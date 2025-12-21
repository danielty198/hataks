import React, { useState, useMemo, useEffect, useCallback, memo } from "react";
import { Box, Typography, Button, Snackbar, Alert } from "@mui/material";
import { baseUrl, colors } from "../../assets";

import DatagridCustom from "../../components/DatagridCustom";
import UserInsertModal from "./UserInsertModal";

// Move OUTSIDE component - these never change
const ROUTE = "users";

const columnsConfig = [
  { field: "pid", headerName: "מספר אישי",  type: "string" },
  { field: "email", headerName: "אימייל",  type: "string" },
  { field: "role", headerName: "הרשאה", isEdit: true, type: "singleSelect", valueOptions: ["admin", "user", "manager"] },

  // ACTIONS (callback injected later)
  { field: "edit", headerName: "ערוך", type: "actions" },
  { field: "delete", headerName: "מחק", type: "actions" },
];

const defaultVisibleColumns = columnsConfig.filter((c) => c.type !== "actions").map((c) => c.field);

// Stable sx objects
const containerSx = { width: "90%" };
const toolbarSx = { display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" };

// Memoized DataGrid wrapper to prevent re-renders
const MemoizedDataGrid = memo(function MemoizedDataGrid({ data, columns, route, onProcessRowUpdate }) {
  return (
    <DatagridCustom
      data={data}
      columns={columns}
      route={route}
      processRowUpdate={onProcessRowUpdate}
    />
  );
});

export default function UserManagementPage() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [editData, setEditData] = useState();
  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [pendingChanges, setPendingChanges] = useState([]); // Track unsaved changes

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      const url = `${baseUrl}/api/${ROUTE}`;
      const res = await fetch(url);
      const data = await res.json();
      setRows(data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setSnackbar({
        open: true,
        message: "שגיאה בטעינת נתונים",
        severity: "error",
      });
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openModal = useCallback(() => setOpen(true), []);

  const handleInsertSuccess = useCallback(async () => {
    setSnackbar({
      open: true,
      message: "המשתמש נוסף בהצלחה!",
      severity: "success"
    });
    await fetchData();
  }, [fetchData]);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  // Track row edits from the DataGrid
  const handleProcessRowUpdate = useCallback((newRow, oldRow) => {
    // Check if there are actual changes
    const hasChanges = Object.keys(newRow).some(key => newRow[key] !== oldRow[key]);

    if (!hasChanges) {
      return oldRow; // No changes, return old row
    }

    // Validation: Username required
    if (!newRow.pid || newRow.pid.trim() === "") {
      setSnackbar({
        open: true,
        message: "שם משתמש הוא שדה חובה",
        severity: "error"
      });
      return oldRow;
    }

    // Check if this row is already in pending changes
    setPendingChanges(prev => {
      const existingIndex = prev.findIndex(r => r._id === newRow._id);

      if (existingIndex !== -1) {
        // Update existing pending change
        const updated = [...prev];
        updated[existingIndex] = newRow;
        return updated;
      } else {
        // Add new pending change
        return [...prev, newRow];
      }
    });

    // Update local state immediately for UI
    setRows(prev => prev.map(r => (r._id === newRow._id ? newRow : r)));

    return newRow;
  }, []);

  // Save all pending changes
  const handleSaveChanges = useCallback(async () => {
    if (pendingChanges.length === 0) return;

    try {
      const updatePromises = pendingChanges.map(async (row) => {
        const res = await fetch(`${baseUrl}/api/${ROUTE}/${row._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updates: row }),
        });

        if (!res.ok) throw new Error(`Failed to update row ${row._id}`);
        return await res.json();
      });

      await Promise.all(updatePromises);

      setPendingChanges([]); // Clear pending changes

      setSnackbar({
        open: true,
        message: `${pendingChanges.length} שינויים נשמרו בהצלחה!`,
        severity: "success",
      });

    } catch (err) {
      console.error("Failed to save changes:", err);
      setSnackbar({
        open: true,
        message: "שגיאה בשמירת השינויים",
        severity: "error",
      });
    }
  }, [pendingChanges]);

  // ======================================================
  // ACTION HANDLER (edit / add)
  // ======================================================
  const handleSubmit = useCallback(async (data, isEdit) => {
    try {
      let res;
      let updatedRecord;

      if (isEdit) {
        if (!data?._id) throw new Error("Missing record id for update");

        res = await fetch(`${baseUrl}/api/${ROUTE}/${data._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updates: data }),
        });

        if (!res.ok) throw new Error("נכשל עדכון משתמש");
        updatedRecord = await res.json();
        setRows(prev => prev.map(r => (r._id === data._id ? updatedRecord.data : r)));

        setSnackbar({
          open: true,
          message: "המשתמש עודכן בהצלחה!",
          severity: "success",
        });
      } else {
        res = await fetch(`${baseUrl}/api/${ROUTE}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("נכשל הוספת משתמש");
        updatedRecord = await res.json();

        setRows(prev => [...prev, updatedRecord]);

        setSnackbar({
          open: true,
          message: "המשתמש נוסף בהצלחה!",
          severity: "success",
        });
      }

      setOpen(false);

    } catch (err) {
      console.error(err);

      setSnackbar({
        open: true,
        message: err.message || "פעולה נכשלה",
        severity: "error",
      });
    }
  }, []);

  const handleOpenEdit = useCallback((rowData) => {
    setEditData(rowData.row);   // <-- set the row to edit
    setOpen(true);              // <-- open modal
  }, []);

  // ======================================================
  // inject handleSubmit into columnsConfig
  // ======================================================
  const columnsWithActions = useMemo(() => {
    return columnsConfig.map(col => {
      if (col.field === "edit") {
        return { ...col, action: handleOpenEdit };
      }
      return col;
    });
  }, [handleOpenEdit]);

  // visible columns
  const displayColumns = useMemo(() => {
    return columnsWithActions.filter(
      (col) => visibleColumns.includes(col.field) || col.type === "actions"
    );
  }, [visibleColumns, columnsWithActions]);

  const gridData = useMemo(() => rows, [rows]);

  return (
    <Box sx={containerSx}>
      <Typography variant="h1" gutterBottom>ניהול משתמשים</Typography>

      <Box sx={toolbarSx}>
        <Button variant="contained" onClick={openModal}>הוספת משתמש</Button>
        <Button
          variant="contained"
          id='saveChanges'
          onClick={handleSaveChanges}
          disabled={pendingChanges.length === 0}
          sx={{
            backgroundColor: colors.success,
            '&:hover': {
              backgroundColor: colors.successLight,
            },
          }}
        >
          שמירת שינויים {pendingChanges.length > 0 && `(${pendingChanges.length})`}
        </Button>
      </Box>

      <UserInsertModal
        open={open}
        onClose={() => { setOpen(false); setEditData() }}
        onSubmit={handleSubmit}
        editData={editData}
      />

      <MemoizedDataGrid
        data={gridData}
        columns={displayColumns}
        route={ROUTE}
        onProcessRowUpdate={handleProcessRowUpdate}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}