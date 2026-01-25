import React, { useState, useMemo, useEffect, useCallback, memo } from "react";
import { Box, Typography, Button, Snackbar, Alert } from "@mui/material";
import {
  baseUrl,
  hatakStatusOptions,
  hatakTypeOptions,
  intendedOptions,
  manoiyaOptions,
  ogdotOptions,
  waitingHHTypeOptions,
  colors,
  waitingHHTypeRequiredString,
  performenceExpectationOptions,
} from "../../assets";
import { useNavigate, useLocation } from 'react-router-dom';
import DatagridCustom from "../../components/DatagridCustom";
import { FilterPanel, TemplateSelector } from "../../components/RepairsFilters";
import InsertModal from "../../components/InsertModal/InsertModal";
import RepairHistoryDialog from "../../components/HistoryDialog/RepairHistoryDialog";
import useUser from "../../contexts/UserContext";
import CustomPagination from "../../components/CustomPagination";

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
  { field: "engineSerial", headerName: "מספר מנוע", isEdit: false },
  { field: "minseretSerial", headerName: "מספר ממסרת", isEdit: true, type: "string" },
  { field: "hatakStatus", headerName: 'סטטוס חט"כ', isEdit: true, type: "singleSelect", valueOptions: hatakStatusOptions },
  { field: "tipulType", headerName: "סוג טיפול", isEdit: true, type: "singleSelect", valueOptions: ["שבר", 'שע"מ'] },
  { field: "problem", headerName: "פירוט תקלה", isEdit: true, type: "string" },
  { field: "waitingHHType", headerName: 'סוג ח"ח ממתין', isEdit: true, isMultiSelect: true, valueOptions: waitingHHTypeOptions },
  { field: "detailsHH", headerName: 'פירוט ח"ח', isEdit: true, type: "string" },
  { field: "michlalNeed", headerName: "צריכת מכלל", isEdit: true, type: "string" },
  { field: "recivingDivision", headerName: "אוגדה מקבלת", isEdit: true, type: "singleSelect", valueOptions: ogdotOptions },
  { field: "recivingBrigade", headerName: "חטיבה מקבלת", isEdit: true, type: "string" },
  { field: "recivingBattalion", headerName: "גדוד מקבל", isEdit: true, type: "string" },
  { field: "startWorkingDate", headerName: "תאריך לפקודה", isEdit: true, type: "date" },
  { field: "forManoiya", headerName: "מנועיה לפקודה", isEdit: true, type: "singleSelect", valueOptions: manoiyaOptions },
  { field: "performenceExpectation", headerName: "צפי ביצוע", isEdit: true, type: "singleSelect", valueOptions: performenceExpectationOptions },
  { field: "detailsOfNonCompliance", headerName: "פירוט אי עמידה", isEdit: true, type: "string" },
  { field: "intended", headerName: "מיועד ל?", isEdit: true, type: "singleSelect", valueOptions: intendedOptions },
  { field: "updatedAt", headerName: "עודכן אחרון", isEdit: false, type: "date" },
  { field: "history", headerName: "היסטוריה", type: "actions" },
  { field: "edit", headerName: "ערוך", type: "actions" },
  { field: "delete", headerName: "מחק", type: "actions" },
];
const defaultVisibleColumns = columnsConfig
  .filter((c) => c.type !== "actions")
  .map((c) => c.field);

// Stable sx objects
const containerSx = { width: "90%" };
const toolbarSx = {
  display: "flex",
  gap: 2,
  mb: 2,
  flexWrap: "wrap",
  alignItems: "center",
};

// Memoized DataGrid wrapper to prevent re-renders
const MemoizedDataGrid = memo(function MemoizedDataGrid({
  data,
  columns,
  route,
  onProcessRowUpdate,
  paginationOff,
  rowsLoading,
  setRowsLoading
}) {
  return (
    <DatagridCustom
      data={data}
      columns={columns}
      route={route}
      processRowUpdate={onProcessRowUpdate}
      paginationOff
      rowsLoading={rowsLoading}
      setRowsLoading={setRowsLoading}
      loading={rowsLoading}
      setLoading={setRowsLoading}
    />
  );
});

export default function RepairsPage() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [rowsCount, setRowsCount] = useState(0);
  const [editData, setEditData] = useState();
  const [filters, setFilters] = useState({});
  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [rowsLoading, setRowsLoading] = useState({
    getRows: false,
    save: false,
    delete: false,
  });
  const [pendingChanges, setPendingChanges] = useState([]); // Track unsaved changes
  const [openHistoryDialog, setOpenHistoryModal] = useState(false);
  const [repairId, setRepairId] = useState();
  const [currentEngineHistory, setCurrentEngineHistory] = useState();
  const [triggerPaginationReset, setTriggerPaginationReset] = useState(false);
  const navigate = useNavigate();
  const [user] = useUser();
  const LAST_TEMPLATE_KEY = "lastTemplateId";
  const isAdmin =
    user?.roles && Array.isArray(user.roles) && user.roles.includes("admin");
  const isViewer =
    user?.roles &&
    Array.isArray(user.roles) &&
    user.roles.length === 1 &&
    user.roles[0] === "viewer";
  const [exportLoading, setExportLoading] = useState(false);

  // Fetch data function for CustomPagination
  const handleFetchData = useCallback(async (page, pageSize) => {
    setRowsLoading(prev => ({ ...prev, getRows: true }))
    try {
      
      const params = new URLSearchParams();

      // Add pagination params
      params.append('pageSize', pageSize);
      params.append('page', page);

      // Add filter params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          // Handle array values (like waitingHHType) - convert to comma-separated string
          if (Array.isArray(value)) {
            if (value.length > 0) {
              params.append(key, value.join(","));
            }
          } else {
            params.append(key, value);
          }
        }
      });

      const queryString = params.toString();
      const url = `${baseUrl}/api/repairs?${queryString}`;
      const res = await fetch(url);

      const { data, rowsCount } = await res.json();

      setRows(data);
      setRowsCount(rowsCount);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
    setRowsLoading(prev => ({ ...prev, getRows: false }))
  }, [filters]);

  // Fetch templates + initial data
  useEffect(() => {
    handleFetchData(0, 15); // Initial fetch with default pagination
  }, []);

  // Load templates from user
  useEffect(() => {
    if (user?.templates) {
      setTemplates(user.templates);

      // After templates are set, check localStorage for last used template
      const lastTemplateId = localStorage.getItem(LAST_TEMPLATE_KEY);
      if (lastTemplateId) {
        const lastTemplate = user.templates.find(
          (t) => t.id === lastTemplateId
        );
        if (lastTemplate) {
          setSelectedTemplate(lastTemplate.id);
          setFilters(lastTemplate.filters || {});
          setVisibleColumns(
            lastTemplate.visibleColumns || defaultVisibleColumns
          );
        }
      }
    }
  }, [user?.templates]);

  const handleSelectTemplate = useCallback(
    async (templateId) => {
      setSelectedTemplate(templateId);

      // Save to localStorage
      if (templateId) {
        localStorage.setItem(LAST_TEMPLATE_KEY, templateId);
      } else {
        localStorage.removeItem(LAST_TEMPLATE_KEY);
      }

      if (!templateId) return;

      const template = templates.find((t) => t.id === templateId);
      if (!template) return;

      setFilters(template.filters);
      setVisibleColumns(template.visibleColumns);
    },
    [templates]
  );

  const handleSaveTemplate = useCallback((newTemplate) => {
    setTemplates((prev) => [...prev, newTemplate]);
    setSelectedTemplate(newTemplate.id);
  }, []);

  const handleDeleteTemplate = useCallback(
    (templateId) => {
      setTemplates((prev) => prev.filter((t) => t.id !== templateId));

      if (selectedTemplate === templateId) {
        setSelectedTemplate("");
        setFilters({});
        setVisibleColumns(defaultVisibleColumns);
        localStorage.removeItem(LAST_TEMPLATE_KEY);
      }
    },
    [selectedTemplate]
  );

  const openModal = useCallback(() => setOpen(true), []);

  const handleInsertSuccess = useCallback(async () => {
    setSnackbar({
      open: true,
      message: "הרשומה נוספה בהצלחה!",
      severity: "success",
    });
  }, []);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  // Track row edits from the DataGrid
  const handleProcessRowUpdate = useCallback((newRow, oldRow) => {
    // Check if there are actual changes
    const hasChanges = Object.keys(newRow).some(
      (key) => newRow[key] !== oldRow[key]
    );
    if (!hasChanges) {
      return oldRow; // No changes, return old row
    }

    if (newRow.waitingHHType.includes("אחר")) {
      setSnackbar({
        open: true,
        message: 'סוג ח"ח ממתין כולל "אחר" - עכשיו ניתן לערוך את שדה פירוט ח"ח',
        severity: "info",
      });
    }
    else {
      setSnackbar({
        open: true,
        message: 'סוג ח"ח ממתין לא כולל "אחר" - שדה פירוט ח"ח נוקה ונעול',
        severity: "warning",
      });
    }
    const performanceChanged = newRow.performenceExpectation !== oldRow.performenceExpectation;

    if (performanceChanged) {
      if (newRow.performenceExpectation === "לא") {
        setSnackbar({
          open: true,
          message: 'צפי ביצוע הוא "לא" - עכשיו ניתן לערוך את שדה פירוט אי עמידה',
          severity: "info",
        });
      } else {
        if (oldRow.detailsOfNonCompliance) {
          newRow.detailsOfNonCompliance = "";
          setSnackbar({
            open: true,
            message: 'צפי ביצוע אינו "לא" - שדה פירוט אי עמידה נוקה ונעול',
            severity: "warning",
          });
        } else {
          setSnackbar({
            open: true,
            message: 'צפי ביצוע אינו "לא" - שדה פירוט אי עמידה נעול',
            severity: "info",
          });
        }
      }
    }

    // Check if hatakStatus was changed to the value that requires waitingHHType
    if (newRow.hatakStatus === waitingHHTypeRequiredString) {
      if (
        !newRow.waitingHHType ||
        (Array.isArray(newRow.waitingHHType) &&
          (newRow.waitingHHType.length === 0 ||
            (newRow.waitingHHType.length === 1 &&
              newRow.waitingHHType[0] === "")))
      ) {
        // Show error snackbar
        const errMsg =
          'כאשר סטטוס חטכ הוא ממתין ל- ח"ח חייב לתת לסוג ח"ח ממתין ערך';
        setSnackbar({
          open: true,
          message: errMsg,
          severity: "error",
        });

        return oldRow; // Revert to old row
      }
    }

    // Check if this row is already in pending changes
    setPendingChanges((prev) => {
      const existingIndex = prev.findIndex((r) => r._id === newRow._id);

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
    setRows((prev) => prev.map((r) => (r._id === newRow._id ? newRow : r)));

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
          body: JSON.stringify({ updates: row, user: user }),
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
  }, [pendingChanges, user]);

  const handleCancelChanges = useCallback(() => {
    if (pendingChanges.length === 0) return;

    // Refetch original data to revert changes
    setPendingChanges([]);

    setSnackbar({
      open: true,
      message: "השינויים בוטלו",
      severity: "info",
    });
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
          body: JSON.stringify({ updates: data, user: user }),
        });

        if (!res.ok) throw new Error("נכשל עדכון שורה");
        updatedRecord = await res.json();
        setRows((prev) =>
          prev.map((r) => (r._id === data._id ? updatedRecord.data : r))
        );

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

        setRows((prev) => [...prev, updatedRecord]);

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
  }, [user]);

  const handleExportToExcel = useCallback(async () => {
    try {
      setExportLoading(true);

      const params = new URLSearchParams();

      // Current filters (same shape used for fetching rows)
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          // Handle array values (like waitingHHType) - convert to comma-separated string
          if (Array.isArray(value)) {
            if (value.length > 0) {
              params.append(key, value.join(","));
            }
          } else {
            params.append(key, value);
          }
        }
      });

      // Export only currently visible (non-action) columns
      const exportColumns = visibleColumns.filter((c) => c !== "delete" && c !== "edit" && c !== "history");
      params.set("columns", exportColumns.join(","));

      const res = await fetch(`${baseUrl}/api/repairs/export/excel?${params.toString()}`);
      if (!res.ok) throw new Error("נכשל ייצוא לאקסל");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "ייצוא_חטכים.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: err?.message || "שגיאה בייצוא לאקסל",
        severity: "error",
      });
    } finally {
      setExportLoading(false);
    }
  }, [filters, visibleColumns]);

  const handleOpenEdit = useCallback((rowData) => {
    setEditData(rowData.row); // <-- set the row to edit
    setOpen(true); // <-- open modal
  }, []);

  const handleOpenHistory = (params) => {
    setRepairId(params.id);
    setCurrentEngineHistory(params.row.engineSerial);
    setOpenHistoryModal(true);
  };
  const handleCloseHistory = () => {
    setOpenHistoryModal(false);
    setCurrentEngineHistory(null);
    setRepairId(null);
  };
  const handleFiltersApplied = useCallback(() => {
    setTriggerPaginationReset(true);
  }, []);

  // Callback when pagination reset is complete
  const handlePaginationResetComplete = useCallback(() => {
    setTriggerPaginationReset(false);
  }, []);

  // ======================================================
  // inject handleSubmit into columnsConfig
  // ======================================================
  const columnsWithActions = useMemo(() => {
    return columnsConfig.map((col) => {
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
  }, [isViewer, handleOpenEdit]);

  // visible columns
  const displayColumns = useMemo(() => {
    return columnsWithActions.filter((col) => {
      // Filter out delete column if not admin
      if (col.field === "delete" && !isAdmin) return false;
      if (col.field === "edit" && isViewer) return false;

      return visibleColumns.includes(col.field) || col.type === "actions";
    });
  }, [visibleColumns, columnsWithActions, isAdmin, isViewer]);

  const gridData = useMemo(() => rows, [rows]);

  return (
    <Box sx={containerSx}>
      <Typography variant="h1" gutterBottom>
        חטכים
      </Typography>

      <Box sx={toolbarSx}>
        {user && !isViewer && (
          <>
            <Button variant="contained" onClick={openModal} disabled={isViewer}>
              הוספה
            </Button>
            <Button
              variant="contained"
              id="saveChanges"
              onClick={handleSaveChanges}
              disabled={pendingChanges.length === 0 || isViewer}
              sx={{
                backgroundColor: colors.success,
                "&:hover": {
                  backgroundColor: colors.successLight,
                },
              }}
            >
              שמירת שינויים{" "}
              {pendingChanges.length > 0 && `(${pendingChanges.length})`}
            </Button>
            <Button
              variant="contained"
              onClick={handleCancelChanges}
              disabled={pendingChanges.length === 0}
              sx={{
                backgroundColor: "#d32f2f",
                color: "#fff",
                "&:hover": {
                  backgroundColor: "#b71c1c",
                },
              }}
            >
              ביטול שינויים
            </Button>
          </>
        )}

        <Button
          variant="contained"
          onClick={handleExportToExcel}
          disabled={exportLoading || rowsLoading.getRows}
          sx={{ backgroundColor: "#1D6F42", "&:hover": { backgroundColor: "#155a35" } }}
        >
          {exportLoading ? "מייצא..." : "ייצוא לאקסל"}
        </Button>

        <TemplateSelector
          templates={templates}
          selectedTemplate={selectedTemplate}
          onSelectTemplate={handleSelectTemplate}
          onSaveTemplate={handleSaveTemplate}
          onDeleteTemplate={handleDeleteTemplate}
          currentFilters={filters}
          currentVisibleColumns={visibleColumns}
          setSnackbar={setSnackbar}
        />
        <RepairHistoryDialog
          open={openHistoryDialog}
          onClose={handleCloseHistory}
          repairId={repairId}
          currentEngineHistory={currentEngineHistory}
        />
        <FilterPanel
          columns={columnsConfig}
          filters={filters}
          visibleColumns={visibleColumns}
          onFiltersChange={setFilters}
          onVisibleColumnsChange={setVisibleColumns}
          onDataLoaded={setRows}
          fetchData={handleFetchData}
          onFiltersApplied={handleFiltersApplied} // NEW PROP
        />
        <CustomPagination
          rowsCount={rowsCount}
          onFetchData={handleFetchData}
          initialPageSize={15}
          showPageSize={true}
          pageSizeOptions={[10, 15, 25, 50, 100]}
          debounceDelay={300}
          resetToPage1={triggerPaginationReset} // NEW PROP
          onResetComplete={handlePaginationResetComplete} // NEW PROP
        />
      </Box>

      <InsertModal
        open={open}
        setOpen={setOpen}
        onClose={() => {
          setOpen(false);
          setEditData();
        }}
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