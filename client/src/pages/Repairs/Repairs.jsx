import React, { useState, useMemo, useEffect, useCallback, memo } from "react";
import { Box, Typography, Button, Snackbar, Alert } from "@mui/material";
import { baseUrl, hatakStatusOptions, hatakTypeOptions, intendedOptions, manoiyaOptions, ogdotOptions, waitingHHTypeOptions, colors, waitingHHTypeRequiredString } from "../../assets";

import DatagridCustom from "../../components/DatagridCustom";
import { FilterPanel, TemplateSelector } from "../../components/RepairsFilters";
import InsertModal from "../../components/InsertModal/InsertModal";
import RepairHistoryDialog from "../../components/HistoryDialog/RepairHistoryDialog";
import useUser from "../../hooks/useUser";

// Move OUTSIDE component - these never change
const ROUTE = "repairs";

const columnsConfig = [
  { field: "manoiya", headerName: "מנועיה", isEdit: true, type: "singleSelect", valueOptions: manoiyaOptions },
  { field: "hatakType", headerName: 'סוג חט"כ', isEdit: true, type: "singleSelect", valueOptions: hatakTypeOptions },
  { field: "sendingDivision", headerName: "אוגדה מוסרת", isEdit: true, type: "singleSelect", valueOptions: ogdotOptions },
  { field: "sendingBrigade", headerName: "חטיבה מוסרת", isEdit: true, type: "string" },
  { field: "sendingBattalion", headerName: "גדוד מוסר", isEdit: true, type: "string" },
  { field: "zadik", headerName: "צ' של כלי", isEdit: true, type: "string" },
  { field: "reciveDate", headerName: "תאריך קבלה", isEdit: true, type: "date" },
  { field: "engineSerial", headerName: "מספר מנוע", isEdit: false, type: "string" },
  { field: "minseretSerial", headerName: "מספר ממסרת", isEdit: true, type: "string" },
  { field: "hatakStatus", headerName: 'סטטוס חט"כ', isEdit: true, type: "singleSelect", valueOptions: hatakStatusOptions },
  { field: 'tipulType', headerName: 'סוג טיפול', isEdit: true, type: "singleSelect", valueOptions: ['שבר', 'שע"מ'] },
  { field: "problem", headerName: "פירוט תקלה", isEdit: true, type: "string" },
  { field: "waitingHHType", headerName: 'סוג ח"ח ממתין', isEdit: true, isMultiSelect: true, valueOptions: waitingHHTypeOptions },
  { field: "michlalNeed", headerName: "צריכת מכלל", isEdit: true, type: "string" },
  { field: "recivingDivision", headerName: "אוגדה מקבלת", isEdit: true, type: "singleSelect", valueOptions: ogdotOptions },
  { field: "recivingBrigade", headerName: "חטיבה מקבלת", isEdit: true, type: "string" },
  { field: "recivingBattalion", headerName: "גדוד מקבל", isEdit: true, type: "string" },
  { field: "startWorkingDate", headerName: "תאריך לפקודה", isEdit: true, type: "date" },
  { field: "forManoiya", headerName: "מנועיה לפקודה", isEdit: true, type: "string" },
  { field: "performenceExpectation", headerName: "צפי ביצוע", isEdit: true, type: "string" },
  { field: "intended", headerName: "מיועד ל?", isEdit: true, type: "singleSelect", valueOptions: intendedOptions },

  // ACTIONS (callback injected later)
  { field: "history", headerName: "היסטוריה", type: "actions" },
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

export default function RepairsPage() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [editData, setEditData] = useState();
  const [filters, setFilters] = useState({});
  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [pendingChanges, setPendingChanges] = useState([]); // Track unsaved changes
  const [openHistoryDialog, setOpenHistoryModal] = useState(false)
  const [repairId, setRepairId] = useState()
  const [user] = useUser()

  const isAdmin = user?.roles && Array.isArray(user.roles) && user.roles.includes('admin');
  const isViewer = user?.roles && Array.isArray(user.roles) && user.roles.length === 1 && user.roles[0] === 'viewer'
  console.log({ isAdmin, isViewer })
  // Fetch data
  const fetchData = useCallback(async (appliedFilters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          params.append(key, value);
        }
      });

      const queryString = params.toString();
      const url = queryString ? `${baseUrl}/api/repairs?${queryString}` : `${baseUrl}/api/repairs`;
      const res = await fetch(url);
      const data = await res.json();
      setRows(data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  }, []);

  // Fetch templates + data
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (user) {
      setTemplates(user.templates)
    }
  }, [user.templates])


  const handleSelectTemplate = useCallback(async (templateId) => {
    setSelectedTemplate(templateId);
    if (!templateId) return;

    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    setFilters(template.filters);
    setVisibleColumns(template.visibleColumns);

    await fetchData(template.filters);
  }, [templates, fetchData]);

  const handleSaveTemplate = useCallback((newTemplate) => {
    setTemplates((prev) => [...prev, newTemplate]);
    setSelectedTemplate(newTemplate.id);
  }, []);

  const handleDeleteTemplate = useCallback((templateId) => {
    setTemplates((prev) => prev.filter((t) => t.id !== templateId));
    if (selectedTemplate === templateId) setSelectedTemplate("");
  }, [selectedTemplate]);

  const openModal = useCallback(() => setOpen(true), []);

  const handleInsertSuccess = useCallback(async () => {
    setSnackbar({
      open: true,
      message: "הרשומה נוספה בהצלחה!",
      severity: "success"
    });
    await fetchData(filters);
  }, [filters, fetchData]);

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

    // Check if hatakStatus was changed to the value that requires waitingHHType

    if (newRow.hatakStatus === waitingHHTypeRequiredString) {

      if (!newRow.waitingHHType || (Array.isArray(newRow.waitingHHType) && ((newRow.waitingHHType.length === 0) || ((newRow.waitingHHType.length === 1) && (newRow.waitingHHType[0] === ''))))) {
        // Show error snackbar
        const errMsg = 'כאשר סטטוס חטכ הוא ממתין ל- ח"ח חייב לתת לסוג ח"ח ממתין ערך'
        setSnackbar({
          open: true,
          message: errMsg,
          severity: 'error'
        });
        throw Error(errMsg)
        return oldRow; // Revert to old row
      }
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

        if (!res.ok) throw new Error("נכשל עדכון שורה");
        updatedRecord = await res.json();
        setRows(prev => prev.map(r => (r._id === data._id ? updatedRecord.data : r)));

        setSnackbar({
          open: true,
          message: "הרשומה עודכנה בהצלחה!",
          severity: "success",
        });
      } else {
        res = await fetch(`${baseUrl}/api/${ROUTE}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("נכשל הוספת שורה");
        updatedRecord = await res.json();

        setRows(prev => [...prev, updatedRecord]);

        setSnackbar({
          open: true,
          message: "הרשומה נוספה בהצלחה!",
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
    setOpen(true);          // <-- open modal
  }, []);

  const handleOpenHistory = (params) => {

    setRepairId(params.id)
    setOpenHistoryModal(true)
  }
  const handleCloseHistory = () => {
    setOpenHistoryModal(false)
    setRepairId(null)
  }

  // ======================================================
  // inject handleSubmit into columnsConfig
  // ======================================================
  const columnsWithActions = useMemo(() => {
    return columnsConfig.map(col => {
      // Remove edit action callback if viewer
      const newCol = { ...col };

      // If viewer, disable editing on all editable columns
      if (isViewer && newCol.isEdit) {
        newCol.isEdit = false;
      }
      // Inject actions for admin / non-viewers
      if (col.field === "edit") {
        newCol.action = !isViewer ? handleOpenEdit : undefined;
      }
      if (col.field === "history") {
        newCol.action = handleOpenHistory;
      }
      return newCol;
    });
  }, [columnsConfig, isViewer]);

  // visible columns
  const displayColumns = useMemo(() => {


    return columnsWithActions.filter(
      (col) => {
        // Filter out delete column if not admin
        if (col.field === "delete" && !isAdmin) return false;
        if (col.field === 'edit' && isViewer) return false

        return visibleColumns.includes(col.field) || col.type === "actions";
      }
    );
  }, [visibleColumns, columnsWithActions, user?.roles]);

  const gridData = useMemo(() => rows, [rows]);



  return (
    <Box sx={containerSx}>
      <Typography variant="h1" gutterBottom>חטכים</Typography>

      <Box sx={toolbarSx}>
        {!isViewer && <>
          <Button variant="contained" onClick={openModal} disabled={user?.roles}>הוספה</Button>
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
        </>}

        <TemplateSelector
          templates={templates}
          selectedTemplate={selectedTemplate}
          onSelectTemplate={handleSelectTemplate}
          onSaveTemplate={handleSaveTemplate}
          onDeleteTemplate={handleDeleteTemplate}
          currentFilters={filters}
          currentVisibleColumns={visibleColumns}
        />
        <RepairHistoryDialog
          open={openHistoryDialog}
          onClose={handleCloseHistory}
          repairId={repairId}
        />
        <FilterPanel
          columns={columnsConfig}
          filters={filters}
          visibleColumns={visibleColumns}
          onFiltersChange={setFilters}
          onVisibleColumnsChange={setVisibleColumns}
          onDataLoaded={setRows}
        />
      </Box>

      <InsertModal
        open={open}
        setOpen={setOpen}
        onClose={() => { setOpen(false); setEditData() }}
        onSubmit={handleSubmit}
        editData={editData}
        setEditData={setEditData}
        route={ROUTE}
        onSuccess={handleInsertSuccess}
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