import React, { useState, useMemo, useEffect, useCallback, memo } from "react";
import { Box, Typography, Button } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { TextField, Autocomplete } from "@mui/material";
import { baseUrl } from "../../assets";
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
  { field: "manoiya", headerName: "מנועיה", isEdit: true, type: "singleSelect", valueOptions: selectOptions.manoiya },
  { field: "hatakType", headerName: 'סוג חט"כ', isEdit: true, type: "singleSelect", valueOptions: selectOptions.hatakType },
  { field: "sendingDivision", headerName: "אוגדה מוסרת", isEdit: true, type: "string" },
  { field: "sendingBrigade", headerName: "חטיבה מוסרת", isEdit: true, type: "string" },
  { field: "sendingBattalion", headerName: "גדוד מוסר", isEdit: true, type: "string" },
  { field: "zadik", headerName: "צ' של כלי", isEdit: true, type: "string" },
  { field: "reciveDate", headerName: "תאריך קבלה", isEdit: true, type: "date" },
  { field: "engineSerial", headerName: "מספר מנוע", isEdit: true, type: "string" },
  { field: "minseretSerial", headerName: "מספר ממסרת", isEdit: true, type: "string" },
  { field: "hatakStatus", headerName: 'סטטוס חט"כ', isEdit: true, type: "singleSelect", valueOptions: selectOptions.hatakStatus },
  { field: "problem", headerName: "פירוט תקלה", isEdit: true, type: "string" },
  { field: "waitingHHType", headerName: 'סוג ח"ח ממתין', isEdit: true, type: "singleSelect", valueOptions: selectOptions.waitingHHType },
  { field: "michlalNeed", headerName: "צריכת מכלל", isEdit: true, type: "string" },
  { field: "recivingDivision", headerName: "אוגדה מקבלת", isEdit: true, type: "string" },
  { field: "recivingBrigade", headerName: "חטיבה מקבלת", isEdit: true, type: "string" },
  { field: "recivingBattalion", headerName: "גדוד מקבל", isEdit: true, type: "string" },
  { field: "startWorkingDate", headerName: "תאריך לפקודה", isEdit: true, type: "date" },
  { field: "forManoiya", headerName: "מנועיה לפקודה", isEdit: true, type: "string" },
  { field: "performenceExpectation", headerName: "צפי ביצוע", isEdit: true, type: "string" },
  { field: "intended", headerName: "מיועד ל?", isEdit: true, type: "string" },
  { field: "delete", headerName: "מחק", type: "actions" },
];

const defaultVisibleColumns = columnsConfig.filter((c) => c.type !== "actions").map((c) => c.field);

// Stable sx objects
const containerSx = { width: "90%" };
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

    try {
      const params = new URLSearchParams();
      Object.entries(template.filters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          params.append(key, value);
        }
      });

      const queryString = params.toString();
      const url = queryString ? `${baseUrl}/api/hataks?${queryString}` : `${baseUrl}/api/hataks`;
      const res = await fetch(url);
      const data = await res.json();
      setRows(data);
    } catch (err) {
      console.error("Failed to apply template:", err);
    }
  }, [templates]);

  const handleSaveTemplate = useCallback((newTemplate) => {
    setTemplates((prev) => [...prev, newTemplate]);
    setSelectedTemplate(newTemplate.id);
  }, []);

  const handleDeleteTemplate = useCallback((templateId) => {
    setTemplates((prev) => prev.filter((t) => t.id !== templateId));
    if (selectedTemplate === templateId) setSelectedTemplate("");
  }, [selectedTemplate]);

  const openModal = useCallback(() => setOpen(true), []);

  // Filter visible columns for DataGrid
  const displayColumns = useMemo(() => {
    return columnsConfig.filter(
      (col) => visibleColumns.includes(col.field) || col.type === "actions" || col.headerName === "מחק"
    );
  }, [visibleColumns]);

  // Stable data reference - only changes when rows actually change
  const gridData = useMemo(() => rows.length > 0 ? rows : undefined, [rows]);

  // Modal content
  const modalContent = useMemo(() => [
    <TextField key="manoiya" select name="manoiya" id="manoiya" label="מנועיה" variant="outlined" SelectProps={{ native: true }}>
      <option value=""></option>
      {selectOptions.manoiya.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
    </TextField>,
    <TextField key="hatakType" select name="hatakType" id="hatakType" label='סוג חט"כ' variant="outlined" SelectProps={{ native: true }}>
      <option value=""></option>
      {selectOptions.hatakType.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
    </TextField>,
    <Autocomplete key="sendingDivision" options={[]} renderInput={(params) => <TextField {...params} label="אוגדה מוסרת" id="sendingDivision" />} />,
    <Autocomplete key="sendingBrigade" options={[]} renderInput={(params) => <TextField {...params} label="חטיבה מוסרת" id="sendingBrigade" />} />,
    <Autocomplete key="sendingBattalion" options={[]} renderInput={(params) => <TextField {...params} label="גדוד מוסר" id="sendingBattalion" />} />,
    <Autocomplete key="zadik" options={[]} renderInput={(params) => <TextField {...params} label="צ' של כלי" id="zadik" />} />,
    <DatePicker key="reciveDate" label="תאריך קבלה" slotProps={{ textField: { id: "reciveDate", variant: "outlined" } }} />,
    <Autocomplete key="engineSerial" options={[]} renderInput={(params) => <TextField {...params} label="מספר מנוע" id="engineSerial" />} />,
    <Autocomplete key="minseretSerial" options={[]} renderInput={(params) => <TextField {...params} label="מספר ממסרת" id="minseretSerial" />} />,
    <TextField key="hatakStatus" select id="hatakStatus" label='סטטוס חט"כ' variant="outlined" SelectProps={{ native: true }}>
      <option value=""></option>
      {selectOptions.hatakStatus.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
    </TextField>,
    <TextField key="problem" id="problem" label="פירוט תקלה" variant="outlined" />,
    <TextField key="waitingHHType" select id="waitingHHType" label='סוג ח"ח ממתין' variant="outlined" SelectProps={{ native: true }}>
      <option value=""></option>
      {selectOptions.waitingHHType.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
    </TextField>,
    <TextField key="michlalNeed" id="michlalNeed" label="צריכת מכלל" variant="outlined" />,
    <Autocomplete key="recivingDivision" options={[]} renderInput={(params) => <TextField {...params} label="אוגדה מקבלת" id="recivingDivision" />} />,
    <Autocomplete key="recivingBrigade" options={[]} renderInput={(params) => <TextField {...params} label="חטיבה מקבלת" id="recivingBrigade" />} />,
    <Autocomplete key="recivingBattalion" options={[]} renderInput={(params) => <TextField {...params} label="גדוד מקבל" id="recivingBattalion" />} />,
    <DatePicker key="startWorkingDate" label="תאריך לפקודה" slotProps={{ textField: { id: "startWorkingDate", variant: "outlined" } }} />,
    <TextField key="forManoiya" id="forManoiya" label="מנועיה לפקודה" variant="outlined" />,
    <TextField key="performenceExpectation" id="performenceExpectation" label="צפי ביצוע" variant="outlined" />,
    <TextField key="intended" id="intended" label="מיועד ל?" variant="outlined" />,
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

      <InsertModal modalContent={modalContent} open={open} setOpen={setOpen} />

      <MemoizedDataGrid data={gridData} columns={displayColumns} route="hataks" />
    </Box>
  );
}