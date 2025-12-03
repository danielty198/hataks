import { useCallback, useEffect, useMemo, useState } from "react";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import {
  Box,
  Snackbar,
  Alert,
  IconButton,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { baseUrl } from "../assets";

export default function DatagridCustom({
  data,
  columns,
  route,
  templateGroup,
  showFilterPanel = true,
}) {
  const [rows, setRows] = useState([]);

  const [loading, setLoading] = useState({
    getRows: false,
    save: false,
    delete: false,
  });

  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
    undo: null,
  });

  const showSnack = (message, severity = "success", undo = null) => {
    setSnack({ open: true, message, severity, undo });
  };

  const closeSnack = () =>
    setSnack({ open: false, message: "", severity: "success", undo: null });

  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [visibleColumns, setVisibleColumns] = useState(
    columns
      .filter(
        (c) =>
          c.type !== "actions" &&
          c.headerName !== "delete" &&
          c.headerName !== "מחק"
      )
      .map((c) => c.field)
  );

  const setLoadingFlag = useCallback(
    (key, value) => setLoading((prev) => ({ ...prev, [key]: value })),
    []
  );

  /* -------------------------------------------
   * FETCH DATA
   * ------------------------------------------- */
  const fetchData = useCallback(async () => {
    if (Array.isArray(data)) {
      setRows(data);
      return;
    }

    setLoadingFlag("getRows", true);

    try {
      const res = await fetch(`${baseUrl}/api/${route}`);
      if (!res.ok) throw new Error("Fetch failed");

      const json = await res.json();
      if (!Array.isArray(json)) throw new Error("Not array");

      setRows(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingFlag("getRows", false);
    }
  }, [route, data, setLoadingFlag]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* -------------------------------------------
   * CELL SAVE HANDLER
   * ------------------------------------------- */
  const handleCellEdit = useCallback(
    async (params) => {
      const { id, field, value } = params;

      const oldValue = rows.find((r) => r._id === id)?.[field];

      if (oldValue === value) return;

      // Optimistic update
      setRows((prev) =>
        prev.map((r) => (r._id === id ? { ...r, [field]: value } : r))
      );

      setLoadingFlag("save", true);

      try {
        const res = await fetch(`${baseUrl}/api/${route}/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [field]: value }),
        });

        if (!res.ok) throw new Error("Save failed");

        showSnack("Saved!", "success", {
          undo: () => {
            setRows((prev) =>
              prev.map((r) => (r._id === id ? { ...r, [field]: oldValue } : r))
            );
          },
        });
      } catch (err) {
        // revert on error
        setRows((prev) =>
          prev.map((r) => (r._id === id ? { ...r, [field]: oldValue } : r))
        );

        showSnack("Save failed!", "error");
      } finally {
        setLoadingFlag("save", false);
      }
    },
    [rows, route, setLoadingFlag]
  );

  /* -------------------------------------------
   * DELETE
   * ------------------------------------------- */
  const deleteRow = useCallback(
    async (id) => {
      const oldRows = rows;
      setRows((prev) => prev.filter((r) => r._id !== id));

      try {
        const res = await fetch(`${baseUrl}/api/delete/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Delete failed");

        showSnack("Deleted", "success");
      } catch {
        setRows(oldRows);
        showSnack("Delete failed", "error");
      }
    },
    [rows]
  );

  /* -------------------------------------------
   * COLUMNS PROCESS
   * ------------------------------------------- */
  const processedColumns = useMemo(() => {
    return columns
      .filter((col) => {
        if (
          col.type === "actions" ||
          col.headerName === "delete" ||
          col.headerName === "מחק"
        ) {
          return true;
        }
        return visibleColumns.includes(col.field);
      })
      .map((col) => {
        const c = { ...col };

        if (c.isEdit) c.editable = true;

        // delete column
        if (c.headerName === "delete" || c.headerName === "מחק") {
          c.type = "actions";
          c.getActions = (params) => [
            <GridActionsCellItem
              key="delete"
              icon={<DeleteIcon />}
              label="Delete"
              onClick={() => deleteRow(params.id)}
            />,
          ];
        }

        if (!c.flex) c.flex = 1;
        if (!c.minWidth) c.minWidth = 100;

        return c;
      });
  }, [columns, visibleColumns, deleteRow]);

  return (
    <Box sx={{ width: "100%", height: "80%", position: "relative" }}>
      {error && (
        <Box sx={{ color: "red", mb: 1, fontWeight: 600 }}>Error: {error}</Box>
      )}

      <DataGrid
        rows={rows}
        columns={processedColumns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        loading={loading.getRows}
        disableSelectionOnClick
        getRowId={(row) => row._id}
        sx={{ minHeight: "60%" }}
        // 🔥 CELL EDIT EVENT
        onCellEditCommit={handleCellEdit}
      />

      {/* SAVE LOADING */}
      {loading.save && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            display: "flex",
            alignItems: "center",
            gap: 1,
            bgcolor: "white",
            p: 1,
            borderRadius: 1,
            boxShadow: 1,
          }}
        >
          <CircularProgress size={20} /> Saving...
        </Box>
      )}

      {/* SNACKBAR */}
      <Snackbar
        open={snack.open}
        autoHideDuration={snack.undo ? 6000 : 2000}
        onClose={closeSnack}
      >
        <Alert
          severity={snack.severity}
          action={
            snack.undo ? (
              <IconButton
                color="inherit"
                size="small"
                onClick={() => {
                  snack.undo.undo();
                  closeSnack();
                }}
              >
                Undo
              </IconButton>
            ) : null
          }
          onClose={closeSnack}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
