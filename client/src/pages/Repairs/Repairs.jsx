import React, { useState, useMemo, useEffect, useCallback, memo } from "react";
import { Box, Typography, Button, Snackbar, Alert } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { TextField, Autocomplete } from "@mui/material";
import { baseUrl, hatakStatus, hatakType, intended, manoiya, ogdot } from "../../assets";
import DatagridCustom from "../../components/DatagridCustom";
import InsertModal from "../../components/InsertModal";
import { FilterPanel, TemplateSelector } from "../../components/RepairsFilters";

// Move OUTSIDE component - these never change
const selectOptions = {
  manoiya: [],
  hatakType: [],
  hatakStatus: [],
  waitingHHType: [],
};

const columnsConfig = [
  { field: "manoiya", headerName: "מנועיה", isEdit: true, type: "singleSelect", valueOptions: manoiya },
  { field: "hatakType", headerName: 'סוג חט"כ', isEdit: true, type: "singleSelect", valueOptions: hatakType },
  { field: "sendingDivision", headerName: "אוגדה מוסרת", isEdit: true, type: "string", type: "singleSelect", valueOptions: ogdot },
  { field: "sendingBrigade", headerName: "חטיבה מוסרת", isEdit: true, type: "string" },
  { field: "sendingBattalion", headerName: "גדוד מוסר", isEdit: true, type: "string" },
  { field: "zadik", headerName: "צ' של כלי", isEdit: true, type: "string" },
  { field: "reciveDate", headerName: "תאריך קבלה", isEdit: true, type: "date" },
  { field: "engineSerial", headerName: "מספר מנוע", isEdit: true, type: "string" },
  { field: "minseretSerial", headerName: "מספר ממסרת", isEdit: true, type: "string" },
  { field: "hatakStatus", headerName: 'סטטוס חט"כ', isEdit: true, type: "singleSelect", valueOptions: hatakStatus },
  { field: "problem", headerName: "פירוט תקלה", isEdit: true, type: "string" },
  { field: "waitingHHType", headerName: 'סוג ח"ח ממתין', isEdit: true, type: "singleSelect", valueOptions: selectOptions.waitingHHType },
  { field: "michlalNeed", headerName: "צריכת מכלל", isEdit: true, type: "string" },
  { field: "recivingDivision", headerName: "אוגדה מקבלת", isEdit: true, type: "string", type: "singleSelect", valueOptions: ogdot },
  { field: "recivingBrigade", headerName: "חטיבה מקבלת", isEdit: true, type: "string" },
  { field: "recivingBattalion", headerName: "גדוד מקבל", isEdit: true, type: "string" },
  { field: "startWorkingDate", headerName: "תאריך לפקודה", isEdit: true, type: "date" },
  { field: "forManoiya", headerName: "מנועיה לפקודה", isEdit: true, type: "string" },
  { field: "performenceExpectation", headerName: "צפי ביצוע", isEdit: true, type: "string" },
  { field: "intended", headerName: "מיועד ל?", isEdit: true, type: "string", type: "singleSelect", valueOptions: intended },
  { field: "delete", headerName: "מחק", type: "actions" },
];

const defaultVisibleColumns = columnsConfig.filter((c) => c.type !== "actions").map((c) => c.field);

// Stable sx objects
const containerSx = { width: "90%", };
const toolbarSx = { display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" };

// Memoized DataGrid wrapper to prevent re-renders
const MemoizedDataGrid = memo(function MemoizedDataGrid({ data, columns, route }) {
  return <DatagridCustom data={data} columns={columns} route={route} />;
});

export default function RepairsPage() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({});
  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Function to fetch data from backend
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

  // Fetch templates on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/users`);
        const data = await res.json();
        setTemplates(data.templates || []);
      } catch (err) {
        console.error("Failed to fetch templates:", err);
      }
    };
    fetchTemplates();
  }, []);

  const handleSelectTemplate = useCallback(async (templateId) => {
    setSelectedTemplate(templateId);
    if (!templateId) return;

    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    setFilters(template.filters);
    setVisibleColumns(template.visibleColumns);

    // Use the fetchData function
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

  // Handle successful insert - refetch data
  const handleInsertSuccess = useCallback(async (newData) => {
    console.log("New record created:", newData);

    // Show success snackbar
    setSnackbar({
      open: true,
      message: "הרשומה נוספה בהצלחה!",
      severity: "success"
    });

    // Refetch data with current filters
    await fetchData(filters);
  }, [filters, fetchData]);

  // Handle snackbar close
  const handleCloseSnackbar = useCallback((event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  // Filter visible columns for DataGrid
  const displayColumns = useMemo(() => {
    return columnsConfig.filter(
      (col) => visibleColumns.includes(col.field) || col.type === "actions" || col.headerName === "מחק"
    );
  }, [visibleColumns]);

  // Stable data reference - only changes when rows actually change
  const gridData = useMemo(() => rows, [rows]);
  // ogdot
  // Modal content
  const modalContent = useMemo(() => [
    <TextField key="manoiya" select name="manoiya" id="manoiya" label="מנועיה" variant="outlined" SelectProps={{ native: true }}>
      <option value=""></option>
      {manoiya.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
    </TextField>,
    <TextField key="hatakType" select name="hatakType" id="hatakType" label='סוג חט"כ' variant="outlined" SelectProps={{ native: true }}>
      <option value=""></option>
      {hatakType.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
    </TextField>,
    <TextField key="sendingDivision" select name="sendingDivision" id="sendingDivision" label="אוגדה מוסרת" variant="outlined" SelectProps={{ native: true }}>
      <option value=""></option>
      {ogdot.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
    </TextField>
    ,
    <Autocomplete key="sendingBrigade" options={[]} renderInput={(params) => <TextField {...params} label="חטיבה מוסרת" id="sendingBrigade" />} />,
    <Autocomplete key="sendingBattalion" options={[]} renderInput={(params) => <TextField {...params} label="גדוד מוסר" id="sendingBattalion" />} />,
    <Autocomplete key="zadik" options={[]} renderInput={(params) => <TextField {...params} label="צ' של כלי" id="zadik" />} />,
    <DatePicker key="reciveDate" label="תאריך קבלה" slotProps={{ textField: { id: "reciveDate", variant: "outlined" } }} />,
    <Autocomplete key="engineSerial" options={[]} renderInput={(params) => <TextField {...params} label="מספר מנוע" id="engineSerial" />} />,
    <Autocomplete key="minseretSerial" options={[]} renderInput={(params) => <TextField {...params} label="מספר ממסרת" id="minseretSerial" />} />,
    <TextField key="hatakStatus" select id="hatakStatus" label='סטטוס חט"כ' variant="outlined" SelectProps={{ native: true }}>
      <option value=""></option>
      {hatakStatus.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
    </TextField>,
    <TextField key="problem" id="problem" label="פירוט תקלה" variant="outlined" />,
    <TextField key="waitingHHType" select id="waitingHHType" label='סוג ח"ח ממתין' variant="outlined" SelectProps={{ native: true }}>
      <option value=""></option>
      {selectOptions.waitingHHType.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
    </TextField>,
    <TextField key="michlalNeed" id="michlalNeed" label="צריכת מכלל" variant="outlined" />,

    <TextField key="recivingDivision" select name="recivingDivision" id="recivingDivision" label="אוגדה מקבלת" variant="outlined" SelectProps={{ native: true }}>
      <option value=""></option>
      {ogdot.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
    </TextField>
    ,
    <Autocomplete key="recivingBrigade" options={[]} renderInput={(params) => <TextField {...params} label="חטיבה מקבלת" id="recivingBrigade" />} />,
    <Autocomplete key="recivingBattalion" options={[]} renderInput={(params) => <TextField {...params} label="גדוד מקבל" id="recivingBattalion" />} />,
    <DatePicker key="startWorkingDate" label="תאריך לפקודה" slotProps={{ textField: { id: "startWorkingDate", variant: "outlined" } }} />,
    <TextField key="forManoiya" id="forManoiya" label="מנועיה לפקודה" variant="outlined" />,
    <TextField key="performenceExpectation" id="performenceExpectation" label="צפי ביצוע" variant="outlined" />,
    <TextField key="intended" id="intended" name="intended" label="מיועד ל?" select variant="outlined" SelectProps={{ native: true }}>
      <option value=""></option>
      {intended.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
    </TextField>

  ], []);

  return (
    <Box sx={containerSx}>
      <Typography variant="h1" gutterBottom>חטכים</Typography>

      <Box sx={toolbarSx}>
        <Button variant="contained" onClick={openModal}>הוספה</Button>

        <TemplateSelector
          templates={templates}
          selectedTemplate={selectedTemplate}
          onSelectTemplate={handleSelectTemplate}
          onSaveTemplate={handleSaveTemplate}
          onDeleteTemplate={handleDeleteTemplate}
          currentFilters={filters}
          currentVisibleColumns={visibleColumns}
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
        modalContent={modalContent}
        open={open}
        setOpen={setOpen}
        route='repairs'
        onSuccess={handleInsertSuccess}
      />

      <MemoizedDataGrid data={gridData} columns={displayColumns} route="repairs" />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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