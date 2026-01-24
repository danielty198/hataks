import { useState, useCallback, useMemo, memo, useEffect } from "react";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Typography,
  Chip,
  Stack,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import TuneIcon from "@mui/icons-material/Tune";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ColumnVisibility from "./ColumnVisibility";
import FilterInput from "./FilterInput";
import { baseUrl, FILTERS_AUTOCOMPLETE_FIELDS } from "../../assets";
import { useSearchParams } from "react-router-dom";

import "dayjs/locale/he";
import { useDistinctValues } from "../../contexts/DistinctValuesContext";

// Stable sx objects - defined outside to prevent recreation
const buttonSx = {
  px: 3,
  py: 1.2,
  background: "linear-gradient(135deg, #13293D 0%, #3a5f7d 100%)",
  boxShadow: "0 4px 14px rgba(19, 41, 61, 0.25)",
  "&:hover": { background: "linear-gradient(135deg, #0d1e2b 0%, #2a4a61 100%)" },
};
const chipSx = { ml: 1, height: 20, bgcolor: "#ff6b35", color: "#fff" };
const drawerPaperSx = { width: { xs: "100%", sm: 400 }, bgcolor: "#fafbfc" };
const headerSx = { p: 2.5, background: "linear-gradient(135deg, #13293D 0%, #3a5f7d 100%)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" };
const contentSx = { p: 2, overflow: "auto", flex: 1 };
const sectionSx = { mb: 3, p: 2, bgcolor: "#fff", borderRadius: 2, boxShadow: "0 2px 8px rgba(19,41,61,0.08)" };
const filterSectionSx = { p: 2, bgcolor: "#fff", borderRadius: 2, boxShadow: "0 2px 8px rgba(19,41,61,0.08)" };
const filterHeaderSx = { display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 };
const footerSx = { p: 2, borderTop: "1px solid rgba(19,41,61,0.1)", bgcolor: "#fff", display: "flex", gap: 1.5 };
const resetBtnSx = { flex: 1, borderRadius: 2, borderColor: "#13293D", color: "#13293D" };
const applyBtnSx = { flex: 2, borderRadius: 2, background: "linear-gradient(135deg, #13293D 0%, #3a5f7d 100%)" };
const clearBtnSx = { color: "#ff6b35" };
const closeIconSx = { color: "#fff" };

// Memoized single filter item - prevents unnecessary re-renders
const FilterItem = memo(function FilterItem({
  column,
  value,
  dateFrom,
  dateTo,
  onChange,
  onDateChange,
  dynamicOptions,
  onOptionsOpen,
  onOptionsInputChange,
  onOptionsLoadMore,
  optionsLoading,
}) {
  return (
    <FilterInput
      column={column}
      value={value}
      dateFrom={dateFrom}
      dateTo={dateTo}
      onChange={onChange}
      onDateChange={onDateChange}
      dynamicOptions={dynamicOptions}
      onOptionsOpen={onOptionsOpen}
      onOptionsInputChange={onOptionsInputChange}
      onOptionsLoadMore={onOptionsLoadMore}
      optionsLoading={optionsLoading}
    />
  );
}, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.dateFrom === next.dateFrom &&
    prev.dateTo === next.dateTo &&
    prev.column === next.column &&
    prev.dynamicOptions === next.dynamicOptions &&
    prev.optionsLoading === next.optionsLoading
  );
});

// Memoized filter list component - only renders visible items
const FilterList = memo(function FilterList({
  columns,
  filters,
  onChange,
  onDateChange,
  getValuesForField,
  ensureFirstPage,
  onFieldInputChange,
  loadMore,
  loadingForField,
}) {
  return (
    <Stack spacing={2}>
      {columns.map((column) => (
        <FilterItem
          key={column.field}
          column={column}
          value={filters[column.field]}
          dateFrom={filters[`${column.field}_from`]}
          dateTo={filters[`${column.field}_to`]}
          onChange={onChange}
          onDateChange={onDateChange}
          dynamicOptions={getValuesForField(column.field)}
          onOptionsOpen={() => ensureFirstPage(column.field)}
          onOptionsInputChange={(val) => onFieldInputChange(column.field, val)}
          onOptionsLoadMore={() => loadMore(column.field)}
          optionsLoading={loadingForField(column.field)}
        />
      ))}
    </Stack>
  );
}, (prev, next) => {
  return prev.filters === next.filters &&
    prev.columns === next.columns &&
    prev.getValuesForField === next.getValuesForField &&
    prev.ensureFirstPage === next.ensureFirstPage &&
    prev.onFieldInputChange === next.onFieldInputChange &&
    prev.loadMore === next.loadMore &&
    prev.loadingForField === next.loadingForField;
});

function FilterPanel({
  columns = [],
  filters,
  visibleColumns,
  onFiltersChange,
  onVisibleColumnsChange,
  onDataLoaded,
  fetchData,
  onFiltersApplied, // NEW PROP - Add this
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState({});
  const [localVisibleColumns, setLocalVisibleColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Scoped distinct-values store for filters (separate from insert modal)
  const {
    getValuesForField,
    loadingForField,
    ensureFirstPage,
    onFieldInputChange,
    loadMore,
  } = useDistinctValues("repairsFilters");

  const distinctLoading = useMemo(
    () => FILTERS_AUTOCOMPLETE_FIELDS.some((f) => loadingForField(f)),
    [loadingForField]
  );

  const filterableColumns = useMemo(() =>
    columns.filter((col) => col.type !== "actions" && col.headerName !== "מחק"),
    [columns]
  );

  const defaultVisibleColumns = useMemo(() =>
    filterableColumns.map((c) => c.field),
    [filterableColumns]
  );

  // Load filters from URL on mount
  useEffect(() => {
    const filtersFromUrl = {};
    for (const [key, value] of searchParams.entries()) {
      // Skip pagination params
      if (key !== 'page' && key !== 'pageSize') {
        // Check if this value contains comma (multi-select stored as comma-separated)
        if (value.includes(',')) {
          filtersFromUrl[key] = value.split(',');
        } else {
          filtersFromUrl[key] = value;
        }
      }
    }

    if (Object.keys(filtersFromUrl).length > 0) {
      setLocalFilters(filtersFromUrl);
      onFiltersChange?.(filtersFromUrl);
    }
  }, []); // Only on mount

  // Sync when drawer opens
  useEffect(() => {
    if (drawerOpen) {
      setLocalFilters(filters || {});
      setLocalVisibleColumns(visibleColumns?.length ? visibleColumns : defaultVisibleColumns);
    }
  }, [drawerOpen, filters, visibleColumns, defaultVisibleColumns]);

  const activeFiltersCount = useMemo(() =>
    Object.values(localFilters).filter((v) => {
      if (Array.isArray(v)) return v.length > 0;
      return v !== "" && v !== null && v !== undefined;
    }).length,
    [localFilters]
  );

  const hiddenColumnsCount = useMemo(() =>
    filterableColumns.length - localVisibleColumns.length,
    [filterableColumns.length, localVisibleColumns.length]
  );

  const badgeCount = activeFiltersCount;

  // Stable callbacks
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const handleFilterChange = useCallback((field, value) => {
    setLocalFilters((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleDateChange = useCallback((field, type, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [`${field}_${type}`]: value ? value.toISOString() : null,
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setLocalFilters({});
  }, []);

  const handleReset = useCallback(() => {
    setLocalFilters({});
    setLocalVisibleColumns(defaultVisibleColumns);

    // Clear filters from URL but keep pagination
    const params = new URLSearchParams(searchParams);
    const page = params.get('page');
    const pageSize = params.get('pageSize');

    const newParams = new URLSearchParams();
    if (page) newParams.set('page', page);
    if (pageSize) newParams.set('pageSize', pageSize);

    setSearchParams(newParams, { replace: true });
  }, [defaultVisibleColumns, searchParams, setSearchParams]);

  const handleApply = useCallback(async () => {
    console.log('starting filter apply');
    setLoading(true);
    try {
      // Trigger pagination reset in parent
      onFiltersApplied?.();

      // Update URL with filters and reset page to 1
      const params = new URLSearchParams(searchParams);
      const pageSize = params.get('pageSize') || '15';

      const newParams = new URLSearchParams();
      newParams.set('page', '1');
      newParams.set('pageSize', pageSize);

      Object.entries(localFilters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            if (value.length > 0) {
              newParams.set(key, value.join(','));
            }
          } else {
            newParams.set(key, value);
          }
        }
      });

      setSearchParams(newParams, { replace: true });

      await fetchData(localFilters);

      onFiltersChange?.(localFilters);
      onVisibleColumnsChange?.(localVisibleColumns);

      console.log('filter apply done, data loaded');
      setDrawerOpen(false);
    } catch (err) {
      console.error("Filter fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [localFilters, localVisibleColumns, fetchData, onFiltersChange, onVisibleColumnsChange, onFiltersApplied, searchParams, setSearchParams]);
  
  return (
    <>
      <Button variant="contained" startIcon={<TuneIcon />} onClick={openDrawer} sx={buttonSx}>
        סינון ותצוגה
        {badgeCount > 0 && <Chip size="small" label={badgeCount} sx={chipSx} />}
      </Button>

      <Drawer anchor="left" open={drawerOpen} onClose={closeDrawer} PaperProps={{ sx: drawerPaperSx }}>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="he">
          {/* Header */}
          <Box sx={headerSx}>
            <Typography variant="h6" fontWeight={600}>סינון ותצוגה</Typography>
            <IconButton onClick={closeDrawer} sx={closeIconSx}><CloseIcon /></IconButton>
          </Box>

          {/* Content */}
          <Box sx={contentSx}>
            {/* Column Visibility */}
            <Box sx={sectionSx}>
              <ColumnVisibility
                columns={columns}
                visibleColumns={localVisibleColumns}
                onVisibleColumnsChange={setLocalVisibleColumns}
              />
            </Box>

            {/* Data Filters */}
            <Box sx={filterSectionSx}>
              <Box sx={filterHeaderSx}>
                <Typography variant="subtitle2" fontWeight={600} color="#13293D">סינון נתונים</Typography>
                {activeFiltersCount > 0 && (
                  <Button size="small" onClick={handleClearFilters} startIcon={<DeleteOutlineIcon />} sx={clearBtnSx}>
                    נקה הכל
                  </Button>
                )}
              </Box>
              <FilterList
                columns={filterableColumns}
                filters={localFilters}
                onChange={handleFilterChange}
                onDateChange={handleDateChange}
                getValuesForField={getValuesForField}
                ensureFirstPage={ensureFirstPage}
                onFieldInputChange={onFieldInputChange}
                loadMore={loadMore}
                loadingForField={loadingForField}
              />
            </Box>
          </Box>

          {/* Footer */}
          <Box sx={footerSx}>
            <Button variant="outlined" startIcon={<RestartAltIcon />} onClick={handleReset} sx={resetBtnSx}>
              איפוס
            </Button>
            <Button variant="contained" startIcon={<SearchIcon />} onClick={handleApply} disabled={loading || distinctLoading} sx={applyBtnSx}>
              {loading ? "טוען..." : "החל סינון"}
            </Button>
          </Box>
        </LocalizationProvider>
      </Drawer>
    </>
  );
}

export default memo(FilterPanel);