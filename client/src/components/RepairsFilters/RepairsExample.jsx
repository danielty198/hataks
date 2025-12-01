/**
 * Example: How to use FilterPanel + TemplateSelector in repairs.jsx
 */

import { useMemo, useState, useEffect, useCallback } from "react";
import { Box } from "@mui/material";
import DatagridCustom from "./DatagridCustom";
import { FilterPanel, TemplateSelector } from "./components";
import { baseUrl } from "../assets";

export default function Repairs() {
  const selectOptions = {
    manoiya: ["מנועיה 1", "מנועיה 2", "מנועיה 3"],
    hatakType: ["סוג 1", "סוג 2", "סוג 3"],
    hatakStatus: ["פעיל", "לא פעיל", "בתיקון"],
    waitingHHType: ["סוג א", "סוג ב", "סוג ג"],
  };

  const columnsConfig = useMemo(() => [
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
  ], [selectOptions]);

  // State
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({});
  const [visibleColumns, setVisibleColumns] = useState(
    columnsConfig.filter((c) => c.type !== "actions").map((c) => c.field)
  );
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");

  // Fetch user templates on mount
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

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/hataks`);
        const data = await res.json();
        setRows(data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, []);

  // Handle template selection - immediately applies filters
  const handleSelectTemplate = useCallback(async (templateId) => {
    setSelectedTemplate(templateId);
    
    if (!templateId) return;

    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    // Update local state
    setFilters(template.filters);
    setVisibleColumns(template.visibleColumns);

    // Fetch filtered data
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
    if (selectedTemplate === templateId) {
      setSelectedTemplate("");
    }
  }, [selectedTemplate]);

  // Filter columns based on visibility
  const displayColumns = useMemo(() => {
    return columnsConfig.filter(
      (col) => visibleColumns.includes(col.field) || col.type === "actions" || col.headerName === "מחק"
    );
  }, [columnsConfig, visibleColumns]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Toolbar */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
        {/* Template Selector - Outside filter panel */}
        <TemplateSelector
          templates={templates}
          selectedTemplate={selectedTemplate}
          onSelectTemplate={handleSelectTemplate}
          onSaveTemplate={handleSaveTemplate}
          onDeleteTemplate={handleDeleteTemplate}
          currentFilters={filters}
          currentVisibleColumns={visibleColumns}
        />

        {/* Filter Panel Button */}
        <FilterPanel
          columns={columnsConfig}
          filters={filters}
          visibleColumns={visibleColumns}
          onFiltersChange={setFilters}
          onVisibleColumnsChange={setVisibleColumns}
          onDataLoaded={setRows}
        />
      </Box>

      {/* DataGrid */}
      <DatagridCustom data={rows} columns={displayColumns} route="hataks" />
    </Box>
  );
}