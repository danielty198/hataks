import { useCallback, useEffect, useMemo, useState } from "react";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Snackbar,
  Alert,
  IconButton,
  CircularProgress,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import HistoryIcon from "@mui/icons-material/History";
import {
  baseUrl,
  datagridcustomCellClassNames,
  waitingHHTypeOptions,
} from "../assets";
import useUser from "../contexts/UserContext";

export default function DatagridCustom({
  data,
  columns,
  route,
  processRowUpdate,
}) {
  const [rows, setRows] = useState([]);

  useEffect(() => { }, [rows]);
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
    if (reason === "clickaway") return; // optional: prevent closing on clickaway
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
  const [user] = useUser();
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

  const handleProcessRowUpdateError = useCallback((error) => {
    console.error("Row update error:", error);
    showSnack("קרתה שגיאה בשינויים", "error");
  }, []);
  /* -------------------------------------------
   * DELETE
   * ------------------------------------------- */
  const deleteRow = useCallback(
    async (id) => {
      const isAdmin =
        user?.roles &&
        Array.isArray(user.roles) &&
        user.roles.includes("admin");
      if (!isAdmin) return alert("אין לך הרשאה למחוק שורה זאת");
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

        if (c.field === "detailsOfNonCompliance") {
          c.editable = true; // Set to true so DataGrid knows it CAN be edited
          c.isCellEditable = (params) => {
            const performanceValue = params.row.performenceExpectation;
            return performanceValue === "לא";
          };
        }
        if (c.field === "detailsHH") {
          c.editable = true; // Let DataGrid know it can be editable
          c.isCellEditable = (params) => {
            const waitingHHType = params.row.waitingHHType;
            return (
              Array.isArray(waitingHHType) && waitingHHType.includes("אחר")
            );
          };
        }

        // Handle multiselect columns
        if (c.isMultiSelect && c.valueOptions) {
          c.renderEditCell = (params) => (
            <Select
              multiple
              value={params.value || []}
              onChange={(e) => {
                params.api.setEditCellValue({
                  id: params.id,
                  field: params.field,
                  value: e.target.value,
                });
              }}
              renderValue={(selected) => selected.join(", ")}
              sx={{ width: "100%" }}
            >
              {c.valueOptions.map((option) => (
                <MenuItem
                  key={option}
                  value={option}
                  selected={(params.value || []).includes(option)}
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: "rgba(25, 118, 210, 0.2)",
                    },
                    "&.Mui-selected:hover": {
                      backgroundColor: "rgba(25, 118, 210, 0.3)",
                    },
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                >
                  {option}
                </MenuItem>
              ))}
            </Select>
          );
          c.renderCell = (params) => {
            console.log(params)
            const values = params.value || [];
            return Array.isArray(values) ? values.join(", ") : values;
          };
        }

        // Handle date columns - convert string/timestamp to Date object
        if (c.type === "date" || c.type === "dateTime") {
          c.valueGetter = (value) => {
            if (!value) return null;
            const date = value instanceof Date ? value : new Date(value);
            return isNaN(date.getTime()) ? null : date;
          };
        }

        if (c.field === "edit" || c.headerName === "ערוך") {
          c.getActions = (params) => [
            <GridActionsCellItem
              key="edit"
              icon={<EditIcon />}
              label="Edit"
              onClick={() => c.action(params, true)}
            />,
          ];
        }

        // delete column
        if (c.headerName === "delete" || c.headerName === "מחק") {
          c.type = "actions";
          c.getActions = (params) => [
            <GridActionsCellItem
              key="delete"
              icon={<DeleteIcon />}
              label="Delete"
              onClick={() =>
                c.action ? c.action(params) : deleteRow(params.id)
              }
            />,
          ];
        }
        if (c.field === "hatakStatus") {
          c.cellClassName = (params) => {
            const value = params.value;
            if (!value) return "";

            // כשיר (כל סוג) - ירוק
            if (value.startsWith("כשיר")) return "hatak-kosher";

            // נופק - תורכיז
            if (value === "נופק") return "hatak-nofek";

            // בלאי - צהוב
            if (value === "בלאי") return "hatak-balai";

            // דרג ג' או ממתין ח"ח - כתום
            if (value.startsWith("דרג ג'") || value === 'ממתין ח"ח')
              return "hatak-darag3";

            // מושבת - אדום
            if (value.startsWith("מושבת")) return "hatak-mushbat";

            return "";
          };
        }

        if (c.headerName === "history" || c.headerName === "היסטוריה") {
          c.type = "actions";
          c.getActions = (params) => [
            <GridActionsCellItem
              key="history"
              icon={<HistoryIcon />}
              label="history"
              onClick={() => c.action(params, true)}
            />,
          ];
        }
        if (!c.flex) c.flex = 1;
        if (!c.minWidth) c.minWidth = 100;

        return c;
      });
  }, [columns, visibleColumns, deleteRow, rows]);

  return (
    <Box sx={{ width: "100%", height: "80%", position: "relative" }}>
      {error && (
        <Box sx={{ color: "red", mb: 1, fontWeight: 600 }}>Error: {error}</Box>
      )}

      <DataGrid
        //key={rows.map(r => `${r._id}-${r.waitingHHType?.join(',')}-${r.performenceExpectation}`).join('|')}
        rows={rows}
        columns={processedColumns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        loading={loading.getRows}
        disableSelectionOnClick
        getRowId={(row) => row._id}
        sx={{ minHeight: "60%", ...datagridcustomCellClassNames }}
        processRowUpdate={processRowUpdate}
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
          <CircularProgress size={20} /> שומר...
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
              <IconButton color="inherit" size="small" onClick={closeSnack}>
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
