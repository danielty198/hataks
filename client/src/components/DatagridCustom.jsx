import { useCallback, useEffect, useMemo, useState } from "react";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import CloseIcon from "@mui/icons-material/Close";
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


  useEffect(() => {
    console.log(rows)
  }, [rows])
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

  // Sync rows when data prop changes
  useEffect(() => {
    if (data !== undefined) {
      setRows(data);
    }
  }, [data]);


  const showSnack = (message, severity = "success", undo = null) => {
    setSnack({ open: true, message, severity, undo });
  };

  const closeSnack = (event, reason) => {
    if (reason === 'clickaway') return; // optional: prevent closing on clickaway
    setSnack((prev) => ({ ...prev, open: false }));
  };

  const handleSnackExited = () => {
    setSnack({ open: false, message: "", severity: "success", undo: null });
  };

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
  const handleRowUpdate = useCallback(
    async (newRow, oldRow) => {
      // Find all fields that changed
      const changedFields = {};
      Object.keys(newRow).forEach((key) => {
        if (newRow[key] !== oldRow[key]) {
          changedFields[key] = newRow[key];
        }
      });

      // No changes
      if (Object.keys(changedFields).length === 0) return oldRow;

      const id = newRow._id;

      setLoadingFlag("save", true);

      try {
        const res = await fetch(`${baseUrl}/api/${route}/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(changedFields),
        });

        if (!res.ok) throw new Error("Save failed");

        // Update rows state
        setRows((prev) =>
          prev.map((r) => (r._id === id ? newRow : r))
        );

        showSnack("נשמר בהצלחה!", "success", {
          undo: async () => {
            try {
              // Build the old fields to restore
              const oldFields = {};
              Object.keys(changedFields).forEach((key) => {
                oldFields[key] = oldRow[key];
              });

              // Send fetch to undo changes in database
              const undoRes = await fetch(`${baseUrl}/api/${route}/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(oldFields),
              });

              if (!undoRes.ok) throw new Error("Undo failed");

              // Revert rows state
              setRows((prev) =>
                prev.map((r) => (r._id === id ? oldRow : r))
              );

              showSnack("שינויים השתחזרו בהצלחה", "success");
            } catch (err) {
              showSnack("שחזור שינויים נכשל", "error");
            }
          },
        });

        return newRow;
      } catch (err) {
        showSnack("שמירה נכשלה", "error");
        return oldRow;
      } finally {
        setLoadingFlag("save", false);
      }
    },
    [route, setLoadingFlag]
  );

  const handleProcessRowUpdateError = useCallback((error) => {
    console.error("Row update error:", error);
    showSnack("קרתה שגיאה בשינויים", "error");
  }, []);
  /* -------------------------------------------
   * DELETE
   * ------------------------------------------- */
  const deleteRow = useCallback(
    async (id) => {

      const confirm = window.confirm("האם אתה בטוח שברצונך למחוק שורה זו?");
      if (!confirm) return;

      const oldRows = rows;
      setRows((prev) => prev.filter((r) => r._id !== id));

      try {
        const res = await fetch(`${baseUrl}/api/${route}/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Delete failed");

        showSnack("נמחק בהצלחה", "success");
      } catch {
        setRows(oldRows);
        showSnack("מחיקה נכשלה", "error");
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

        // Handle date columns - convert string/timestamp to Date object
        if (c.type === "date" || c.type === "dateTime") {
          c.valueGetter = (value) => {
            if (!value) return null;
            const date = value instanceof Date ? value : new Date(value);
            return isNaN(date.getTime()) ? null : date;
          };
        }

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

  console.log(snack.severity)

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
        processRowUpdate={handleRowUpdate}
        onProcessRowUpdateError={handleProcessRowUpdateError}
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
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        TransitionProps={{ onExited: handleSnackExited }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          action={
            <>
              {snack.undo && (
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
              )}
              <IconButton
                color="inherit"
                size="small"
                onClick={closeSnack}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </>
          }
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
