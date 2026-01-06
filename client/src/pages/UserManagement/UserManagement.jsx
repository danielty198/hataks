import React, { useState, useMemo, useEffect, useCallback, memo } from "react";
import { Box, Typography, Button, Snackbar, Alert } from "@mui/material";
import { baseUrl, colors, roles, SYSTEM, userServiceUrl } from "../../assets";

import DatagridCustom from "../../components/DatagridCustom";
import UserInsertModal from "./UserInsertModal";

// Move OUTSIDE component - these never change
const ROUTE = "user";

const columnsConfig = [
  { field: "pid", headerName: "מספר אישי", type: "string" },
  { field: "email", headerName: "אימייל", type: "string" },
  { field: "fName", headerName: "שם פרטי", type: "string" },
  { field: "lName", headerName: "שם משפחה", type: "string" },
  {
    field: "roles",
    headerName: "הרשאה",
    isEdit: true,
    isMultiSelect: true,
    valueOptions: roles.map(el => el.label),
    // Add valueGetter to convert stored values to labels for display
    valueGetter: (value) => {
      if (!value) return [];
      if (!Array.isArray(value)) return [];
      // Convert value codes to labels
      return value.map(val => {
        const role = roles.find(r => r.value === val);
        return role ? role.label : val;
      });
    }
  },

  // ACTIONS (callback injected later)
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
      const url = `${userServiceUrl}/api/${ROUTE}/allSystem?system=${SYSTEM}`;
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

    // Convert labels back to values for storage
    if (newRow.roles && Array.isArray(newRow.roles)) {
      newRow.roles = newRow.roles.map(label => {
        const role = roles.find(r => r.label === label);
        return role ? role.value : label;
      });
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
      // Prepare all rows with proper format
      const contentArray = pendingChanges.map(row => {
        const rowToSave = { ...row };

        // Ensure roles are in value format
        if (rowToSave.roles && Array.isArray(rowToSave.roles)) {
          rowToSave.roles = rowToSave.roles.map(el => {
            const role = roles.find(r => r.label === el || r.value === el);
            return role ? role.value : el;
          });
        }

        return rowToSave;
      });

      // Send all changes in a single request as an array
      const res = await fetch(`${userServiceUrl}/api/${ROUTE}/updateUser?system=${SYSTEM}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: contentArray }),
      });

      if (!res.ok) throw new Error("Failed to update users");

      await res.json();

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
  const handleAddUser = useCallback(async (data) => {
    try {
      let res;
      const pid = data.pid
      delete data.pid

      res = await fetch(`${userServiceUrl}/api/${ROUTE}/addSystemSettings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pid, system: SYSTEM, systemSettings: data }),
      });

      if (!res.ok) throw new Error("נכשל הוספת משתמש");

      fetchData()
      setSnackbar({
        open: true,
        message: "המשתמש נוסף בהצלחה!",
        severity: "success",
      });

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

  const deleteOne = useCallback(async (row) => {
    const content = [row.row]
    try {
      const response = await fetch(
        `${userServiceUrl}/api/${ROUTE}/deleteSystem?system=${SYSTEM}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      fetchData()
      // Show success message
      setSnackbar({
        open: true,
        message: 'Row deleted successfully',
        severity: 'success'
      });

    } catch (error) {
      console.error('Error deleting row:', error);

      // Show error message
      setSnackbar({
        open: true,
        message: `Failed to delete row: ${error.message}`,
        severity: 'error'
      });

      throw error;
    }
  }, [fetchData])

  const handleOpenEdit = useCallback((rowData) => {
    setEditData(rowData.row);   // <-- set the row to edit
    setOpen(true);              // <-- open modal
  }, []);

  // ======================================================
  // inject handleSubmit into columnsConfig
  // ======================================================
  const columnsWithActions = useMemo(() => {
    return columnsConfig.map(col => {
      if (col.field === "delete") {
        return { ...col, action: deleteOne };
      }
      return col;
    });
  }, [deleteOne]);

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
        onSubmit={handleAddUser}
        editData={editData}
        ROUTE={ROUTE}
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