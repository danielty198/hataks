import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Typography, Snackbar, Alert } from "@mui/material";
import DatagridCustom from "../../components/DatagridCustom";
import { baseUrl, colors } from "../../assets";
import useUser from "../../contexts/UserContext";

const ROUTE = "repairs";

// Reuse a minimal set of columns for the pending-deletion view
const columnsConfig = [
  { field: "manoiya", headerName: "מנועיה" },
  { field: "hatakType", headerName: 'סוג חט"כ' },
  { field: "sendingDivision", headerName: "אוגדה מוסרת" },
  { field: "sendingBrigade", headerName: "חטיבה מוסרת" },
  { field: "sendingBattalion", headerName: "גדוד מוסר" },
  { field: "zadik", headerName: "צ' של כלי" },
  { field: "engineSerial", headerName: "מספר מנוע" },
  { field: "minseretSerial", headerName: "מספר ממסרת" },
  { field: "hatakStatus", headerName: 'סטטוס חט"כ' },
  { field: "reciveDate", headerName: "תאריך קבלה", type: "date" },
  { field: "updatedAt", headerName: "עודכן אחרון", type: "date" },
  { field: "restore", headerName: "שחזר", type: "actions" },
  { field: "delete", headerName: "מחק", type: "actions" },
];

export default function RepairsPendingDeletionPage() {
  const [rows, setRows] = useState([]);
  const [rowsLoading, setRowsLoading] = useState({
    getRows: false,
    save: false,
    delete: false,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [user] = useUser();

  const isAdmin =
    user?.roles && Array.isArray(user.roles) && user.roles.includes("admin");

  const handleRestore = useCallback(
    async (params) => {
      const id = params.id;

      if (!isAdmin) {
        setSnackbar({
          open: true,
          message: "אין לך הרשאה לשחזר רשומה זו",
          severity: "error",
        });
        return;
      }

      const confirmed = window.confirm(
        'האם אתה בטוח שברצונך להחזיר שורה זו לטבלת החט"כים?'
      );
      if (!confirmed) return;

      try {
        const res = await fetch(`${baseUrl}/api/${ROUTE}/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            updates: { goingToBeDeleted: false },
            user,
          }),
        });

        if (!res.ok) {
          throw new Error("שחזור הרשומה נכשל");
        }

        // Remove from this list, since it's no longer marked for deletion
        setRows((prev) => prev.filter((r) => r._id !== id));

        setSnackbar({
          open: true,
          message: 'הרשומה הוחזרה לטבלת החט"כים',
          severity: "success",
        });
      } catch (err) {
        console.error("Restore error:", err);
        setSnackbar({
          open: true,
          message: err.message || "שגיאה בשחזור הרשומה",
          severity: "error",
        });
      }
    },
    [isAdmin, user]
  );

  // Load only rows that were soft-deleted (goingToBeDeleted = true)
  useEffect(() => {
    const fetchPendingDeletions = async () => {
      try {
        setRowsLoading((prev) => ({ ...prev, getRows: true }));
        const params = new URLSearchParams();
        params.append("pageSize", 500);
        params.append("page", 0);
        params.append("goingToBeDeleted", "true");

        const res = await fetch(`${baseUrl}/api/${ROUTE}?${params.toString()}`);
        if (!res.ok) throw new Error("שגיאה בטעינת רשומות למחיקה");

        const { data } = await res.json();
        setRows(data || []);
      } catch (err) {
        console.error("Failed to fetch pending deletions:", err);
        setSnackbar({
          open: true,
          message: err.message || "שגיאה בטעינת רשומות למחיקה",
          severity: "error",
        });
      } finally {
        setRowsLoading((prev) => ({ ...prev, getRows: false }));
      }
    };

    if (isAdmin) {
      fetchPendingDeletions();
    }
  }, [isAdmin]);

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const gridColumns = useMemo(
    () =>
      columnsConfig.map((col) => {
        const c = { ...col };
        if (c.field === "restore") {
          c.action = handleRestore;
        }
        if (!c.flex) c.flex = 1;
        if (!c.minWidth) c.minWidth = 100;
        return c;
      }),
    [handleRestore]
  );

  return (
    <Box sx={{ width: "90%" }}>
      <Typography variant="h1" gutterBottom>
        רשומות שסומנו למחיקה
      </Typography>
      <Typography variant="body1" sx={{ mb: 2, color: colors.primary }}>
        כאן תראה רשומות שסומנו למחיקה על ידי מנועייה. מחיקה כאן תסיר אותן לצמיתות מהמערכת.
      </Typography>

      <DatagridCustom
        data={rows}
        columns={gridColumns}
        route={ROUTE}
        processRowUpdate={(row) => row}
        paginationOff
        rowsLoading={rowsLoading}
        setRowsLoading={setRowsLoading}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

