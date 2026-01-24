import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { baseUrl } from "../assets";

/**
 * Scoped, paginated distinct-values store.
 *
 * Why:
 * - Old approach fetched ALL distinct values for many fields globally (slow on large collections).
 * - We need separate state per "place" (filters vs insert modal), so scopes don't conflict.
 *
 * API:
 * - useDistinctValues(scope) -> helpers bound to that scope
 * - getValuesForField(field)
 * - onFieldInputChange(field, inputValue) (debounced fetch of first page)
 * - loadMore(field) (fetch next page)
 * - resetField(field)
 */

const DistinctValuesContext = createContext(null);

const DEFAULT_LIMIT = 100;

function ensureScope(state, scope) {
  if (state[scope]) return state;
  return { ...state, [scope]: {} };
}

function ensureField(scopeState, field) {
  if (scopeState[field]) return scopeState;
  return {
    ...scopeState,
    [field]: {
      items: [],
      search: "",
      skip: 0,
      limit: DEFAULT_LIMIT,
      total: 0,
      hasMore: true,
      loading: false,
      error: null,
      // used to ignore out-of-order responses
      requestId: 0,
    },
  };
}

export const DistinctValuesProvider = ({ children }) => {
  // state shape: { [scope: string]: { [field: string]: FieldState } }
  const [scoped, setScoped] = useState({});

  // debounce timers per scope+field
  const debounceTimersRef = useRef(new Map());

  // latest request token per scope+field (used to ignore out-of-order responses)
  const latestRequestTokenRef = useRef(new Map());

  const fetchPage = useCallback(async ({ scope, field, search, skip, limit, mode }) => {
    // mode: "replace" | "append"
    const reqKey = `${scope}::${field}`;
    const token = `${Date.now()}_${Math.random()}`;
    latestRequestTokenRef.current.set(reqKey, token);

    setScoped((prev) => {
      const next = ensureScope(prev, scope);
      const scopeState = next[scope];
      const nextScopeState = ensureField(scopeState, field);
      const current = nextScopeState[field];
      return {
        ...next,
        [scope]: {
          ...nextScopeState,
          [field]: { ...current, loading: true, error: null },
        },
      };
    });

    try {
      const params = new URLSearchParams();
      params.set("limit", String(limit ?? DEFAULT_LIMIT));
      params.set("skip", String(skip ?? 0));
      if (search) params.set("search", search);

      const res = await fetch(`${baseUrl}/api/repairs/unique/${encodeURIComponent(field)}?${params.toString()}`);
      if (!res.ok) throw new Error(`Failed to fetch distincts for ${field}`);
      const data = await res.json();

      setScoped((prev) => {
        if (latestRequestTokenRef.current.get(reqKey) !== token) return prev;
        const current = prev?.[scope]?.[field];
        if (!current) return prev;

        const incoming = Array.isArray(data.values) ? data.values : [];
        const merged =
          mode === "append"
            ? Array.from(new Set([...(current.items || []), ...incoming]))
            : incoming;

        return {
          ...prev,
          [scope]: {
            ...prev[scope],
            [field]: {
              ...current,
              items: merged,
              search: data.search ?? search ?? "",
              skip: data.skip ?? skip ?? 0,
              limit: data.limit ?? limit ?? DEFAULT_LIMIT,
              total: data.total ?? 0,
              hasMore: Boolean(data.hasMore),
              loading: false,
              error: null,
            },
          },
        };
      });
    } catch (err) {
      setScoped((prev) => {
        if (latestRequestTokenRef.current.get(reqKey) !== token) return prev;
        const current = prev?.[scope]?.[field];
        if (!current) return prev;

        return {
          ...prev,
          [scope]: {
            ...prev[scope],
            [field]: {
              ...current,
              loading: false,
              error: err?.message || "Failed to fetch distinct values",
            },
          },
        };
      });
    }
  }, []);

  const api = useMemo(() => {
    return {
      scoped,
      setScoped,
      fetchPage,
      debounceTimersRef,
    };
  }, [scoped, fetchPage]);

  return <DistinctValuesContext.Provider value={api}>{children}</DistinctValuesContext.Provider>;
};

export const useDistinctValues = (scope = "default") => {
  const ctx = useContext(DistinctValuesContext);
  if (!ctx) throw new Error("useDistinctValues must be used within DistinctValuesProvider");

  const { scoped, setScoped, fetchPage, debounceTimersRef } = ctx;

  const getFieldState = useCallback(
    (field) => scoped?.[scope]?.[field] || null,
    [scoped, scope]
  );

  const getValuesForField = useCallback(
    (field) => scoped?.[scope]?.[field]?.items || [],
    [scoped, scope]
  );

  const loadingForField = useCallback(
    (field) => Boolean(scoped?.[scope]?.[field]?.loading),
    [scoped, scope]
  );

  const resetField = useCallback(
    (field) => {
      setScoped((prev) => {
        const next = ensureScope(prev, scope);
        const scopeState = next[scope] || {};
        const nextScopeState = ensureField(scopeState, field);
        const current = nextScopeState[field];
        return {
          ...next,
          [scope]: {
            ...nextScopeState,
            [field]: {
              ...current,
              items: [],
              search: "",
              skip: 0,
              total: 0,
              hasMore: true,
              loading: false,
              error: null,
            },
          },
        };
      });
    },
    [scope, setScoped]
  );

  const ensureFirstPage = useCallback(
    (field) => {
      const st = getFieldState(field);
      if (st?.items?.length) return;
      if (st?.loading) return;
      fetchPage({ scope, field, search: st?.search || "", skip: 0, limit: st?.limit || DEFAULT_LIMIT, mode: "replace" });
    },
    [fetchPage, getFieldState, scope]
  );

  const onFieldInputChange = useCallback(
    (field, inputValue) => {
      const key = `${scope}::${field}`;
      const nextSearch = inputValue || "";

      // persist the search string immediately (so UI can read it)
      setScoped((prev) => {
        const next = ensureScope(prev, scope);
        const scopeState = next[scope] || {};
        const nextScopeState = ensureField(scopeState, field);
        const current = nextScopeState[field];
        return {
          ...next,
          [scope]: {
            ...nextScopeState,
            [field]: { ...current, search: nextSearch, skip: 0 },
          },
        };
      });

      // debounce fetch
      const existing = debounceTimersRef.current.get(key);
      if (existing) clearTimeout(existing);
      const t = setTimeout(() => {
        fetchPage({ scope, field, search: nextSearch, skip: 0, limit: DEFAULT_LIMIT, mode: "replace" });
      }, 250);
      debounceTimersRef.current.set(key, t);
    },
    [debounceTimersRef, fetchPage, scope, setScoped]
  );

  const loadMore = useCallback(
    (field) => {
      const st = getFieldState(field);
      if (!st) {
        // fetch first page if nothing exists yet
        fetchPage({ scope, field, search: "", skip: 0, limit: DEFAULT_LIMIT, mode: "replace" });
        return;
      }
      if (st.loading) return;
      if (!st.hasMore) return;
      const nextSkip = (st.skip || 0) + (st.items?.length ? 0 : 0);
      // `skip` should be the number of already loaded items
      fetchPage({
        scope,
        field,
        search: st.search || "",
        skip: st.items?.length || 0,
        limit: st.limit || DEFAULT_LIMIT,
        mode: "append",
      });
    },
    [fetchPage, getFieldState, scope]
  );

  return {
    // store helpers
    getValuesForField,
    getFieldState,
    loadingForField,
    resetField,
    ensureFirstPage,
    onFieldInputChange,
    loadMore,
  };
};