import { useState, useCallback, useEffect } from "react";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Typography,
  Divider,
  FormControlLabel,
  Checkbox,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/he";

// Icons
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SaveIcon from "@mui/icons-material/Save";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import AddIcon from "@mui/icons-material/Add";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import TuneIcon from "@mui/icons-material/Tune";

// Storage key for templates
const TEMPLATES_STORAGE_KEY = "datagrid_filter_templates";

/**
 * DatagridFilterPanel
 * 
 * A comprehensive filtering and column visibility component for MUI DataGrid.
 * 
 * Props:
 * @param {Array} columns - Column configuration array (same format as DataGrid columns)
 * @param {Array} visibleColumns - Currently visible column fields
 * @param {Function} onVisibleColumnsChange - Callback when column visibility changes
 * @param {Object} filters - Current filter values { field: value }
 * @param {Function} onFiltersChange - Callback when filters change
 * @param {Function} onApplyFilters - Callback to trigger data fetch with filters
 * @param {string} templateGroup - Group name for storing templates (allows different pages to have different templates)
 */
export default function DatagridFilterPanel({
  columns = [],
  visibleColumns,
  onVisibleColumnsChange,
  filters = {},
  onFiltersChange,
  onApplyFilters,
  templateGroup = "default",
}) {
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Local filter state (before applying)
  const [localFilters, setLocalFilters] = useState(filters);
  const [localVisibleColumns, setLocalVisibleColumns] = useState(
    visibleColumns || columns.filter(c => c.field !== "delete").map(c => c.field)
  );
  
  // Templates state
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  
  // Active filters count
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  
  // Column search
  const [columnSearch, setColumnSearch] = useState("");
  console.log('DatagridFilterPanel')

  // Load templates from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (stored) {
      try {
        const allTemplates = JSON.parse(stored);
        setTemplates(allTemplates[templateGroup] || []);
      } catch (e) {
        console.error("Failed to parse templates:", e);
      }
    }
  }, [templateGroup]);

  // Sync local state with props
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    if (visibleColumns) {
      setLocalVisibleColumns(visibleColumns);
    }
  }, [visibleColumns]);

  // Count active filters
  useEffect(() => {
    const count = Object.values(localFilters).filter(
      (v) => v !== "" && v !== null && v !== undefined
    ).length;
    setActiveFiltersCount(count);
  }, [localFilters]);

  // Filter columns that can be filtered (exclude actions)
  const filterableColumns = columns.filter(
    (col) => col.type !== "actions" && col.headerName !== "delete" && col.headerName !== "מחק"
  );

  // Filtered columns for display
  const filteredColumns = filterableColumns.filter((col) =>
    col.headerName?.toLowerCase().includes(columnSearch.toLowerCase())
  );

  // Handle column visibility toggle
  const handleColumnToggle = useCallback((field) => {
    setLocalVisibleColumns((prev) => {
      if (prev.includes(field)) {
        return prev.filter((f) => f !== field);
      }
      return [...prev, field];
    });
  }, []);

  // Handle select all/none columns
  const handleSelectAllColumns = useCallback(() => {
    setLocalVisibleColumns(filterableColumns.map((c) => c.field));
  }, [filterableColumns]);

  const handleDeselectAllColumns = useCallback(() => {
    setLocalVisibleColumns([]);
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((field, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Handle date range filter
  const handleDateRangeChange = useCallback((field, type, value) => {
    setLocalFilters((prev) => ({
      ...prev,
      [`${field}_${type}`]: value ? value.toISOString() : null,
    }));
  }, []);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setLocalFilters({});
    setSelectedTemplate("");
  }, []);

  // Reset to defaults
  const handleReset = useCallback(() => {
    setLocalFilters({});
    setLocalVisibleColumns(filterableColumns.map((c) => c.field));
    setSelectedTemplate("");
  }, [filterableColumns]);

  // Apply filters
  const handleApply = useCallback(() => {
    onVisibleColumnsChange?.(localVisibleColumns);
    onFiltersChange?.(localFilters);
    onApplyFilters?.(localFilters, localVisibleColumns);
    setDrawerOpen(false);
  }, [localFilters, localVisibleColumns, onFiltersChange, onVisibleColumnsChange, onApplyFilters]);

  // Save template
  const handleSaveTemplate = useCallback(() => {
    if (!newTemplateName.trim()) return;

    const newTemplate = {
      id: Date.now().toString(),
      name: newTemplateName.trim(),
      filters: localFilters,
      visibleColumns: localVisibleColumns,
      createdAt: new Date().toISOString(),
    };

    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);

    // Save to localStorage
    const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    const allTemplates = stored ? JSON.parse(stored) : {};
    allTemplates[templateGroup] = updatedTemplates;
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(allTemplates));

    setNewTemplateName("");
    setSaveDialogOpen(false);
    setSelectedTemplate(newTemplate.id);
  }, [newTemplateName, localFilters, localVisibleColumns, templates, templateGroup]);

  // Load template
  const handleLoadTemplate = useCallback((templateId) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setLocalFilters(template.filters);
      setLocalVisibleColumns(template.visibleColumns);
      setSelectedTemplate(templateId);
    }
  }, [templates]);

  // Delete template
  const handleDeleteTemplate = useCallback(() => {
    if (!templateToDelete) return;

    const updatedTemplates = templates.filter((t) => t.id !== templateToDelete);
    setTemplates(updatedTemplates);

    // Save to localStorage
    const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    const allTemplates = stored ? JSON.parse(stored) : {};
    allTemplates[templateGroup] = updatedTemplates;
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(allTemplates));

    if (selectedTemplate === templateToDelete) {
      setSelectedTemplate("");
    }
    setTemplateToDelete(null);
    setDeleteDialogOpen(false);
  }, [templateToDelete, templates, templateGroup, selectedTemplate]);

  // Render filter input based on column type
  const renderFilterInput = (column) => {
    const { field, headerName, type, valueOptions } = column;

    if (type === "singleSelect" && valueOptions) {
      return (
        <FormControl fullWidth size="small" sx={{ mt: 1 }}>
          <InputLabel>{headerName}</InputLabel>
          <Select
            value={localFilters[field] || ""}
            onChange={(e) => handleFilterChange(field, e.target.value)}
            label={headerName}
            sx={{
              borderRadius: 2,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(19, 41, 61, 0.3)",
              },
            }}
          >
            <MenuItem value="">
              <em>הכל</em>
            </MenuItem>
            {valueOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }

    if (type === "date") {
      return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="he">
          <Stack spacing={1} sx={{ mt: 1 }}>
            <DatePicker
              label={`${headerName} - מתאריך`}
              value={localFilters[`${field}_from`] ? dayjs(localFilters[`${field}_from`]) : null}
              onChange={(value) => handleDateRangeChange(field, "from", value)}
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  sx: {
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  },
                },
              }}
              format="DD/MM/YYYY"
            />
            <DatePicker
              label={`${headerName} - עד תאריך`}
              value={localFilters[`${field}_to`] ? dayjs(localFilters[`${field}_to`]) : null}
              onChange={(value) => handleDateRangeChange(field, "to", value)}
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  sx: {
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  },
                },
              }}
              format="DD/MM/YYYY"
            />
          </Stack>
        </LocalizationProvider>
      );
    }

    // Default text input
    return (
      <TextField
        fullWidth
        size="small"
        label={headerName}
        value={localFilters[field] || ""}
        onChange={(e) => handleFilterChange(field, e.target.value)}
        sx={{
          mt: 1,
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
          },
        }}
      />
    );
  };

  const hiddenColumnsCount = filterableColumns.length - localVisibleColumns.length;

  return (
    <>
      {/* Main Button */}
      <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
        {/* Filter Button */}
        <Button
          variant="contained"
          startIcon={<TuneIcon />}
          onClick={() => setDrawerOpen(true)}
          sx={{
            position: "relative",
            px: 3,
            py: 1.2,
            background: "linear-gradient(135deg, #13293D 0%, #3a5f7d 100%)",
            boxShadow: "0 4px 14px rgba(19, 41, 61, 0.25)",
            "&:hover": {
              background: "linear-gradient(135deg, #0d1e2b 0%, #2a4a61 100%)",
              boxShadow: "0 6px 20px rgba(19, 41, 61, 0.35)",
            },
          }}
        >
          סינון ותצוגה
          {(activeFiltersCount > 0 || hiddenColumnsCount > 0) && (
            <Chip
              size="small"
              label={activeFiltersCount + hiddenColumnsCount}
              sx={{
                ml: 1,
                height: 20,
                minWidth: 20,
                fontSize: "0.7rem",
                bgcolor: "#ff6b35",
                color: "#fff",
              }}
            />
          )}
        </Button>

        {/* Quick Template Select */}
        {templates.length > 0 && (
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>תבנית שמורה</InputLabel>
            <Select
              value={selectedTemplate}
              onChange={(e) => {
                if (e.target.value) {
                  handleLoadTemplate(e.target.value);
                }
              }}
              label="תבנית שמורה"
              startAdornment={
                <InputAdornment position="start">
                  <BookmarkIcon sx={{ color: "#13293D", fontSize: 18 }} />
                </InputAdornment>
              }
              sx={{
                borderRadius: 2,
                bgcolor: "rgba(19, 41, 61, 0.04)",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(19, 41, 61, 0.2)",
                },
              }}
            >
              <MenuItem value="">
                <em>בחר תבנית...</em>
              </MenuItem>
              {templates.map((template) => (
                <MenuItem key={template.id} value={template.id}>
                  {template.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            {Object.entries(localFilters)
              .filter(([, value]) => value !== "" && value !== null && value !== undefined)
              .slice(0, 3)
              .map(([key, value]) => {
                const column = filterableColumns.find((c) => c.field === key || key.startsWith(c.field));
                const displayName = column?.headerName || key;
                const displayValue = typeof value === "string" && value.length > 10 
                  ? value.substring(0, 10) + "..." 
                  : value instanceof Date 
                    ? dayjs(value).format("DD/MM/YY")
                    : value;
                return (
                  <Chip
                    key={key}
                    size="small"
                    label={`${displayName}: ${displayValue}`}
                    onDelete={() => handleFilterChange(key, "")}
                    sx={{
                      bgcolor: "rgba(19, 41, 61, 0.1)",
                      color: "#13293D",
                      "& .MuiChip-deleteIcon": {
                        color: "#13293D",
                        "&:hover": {
                          color: "#ff6b35",
                        },
                      },
                    }}
                  />
                );
              })}
            {activeFiltersCount > 3 && (
              <Chip
                size="small"
                label={`+${activeFiltersCount - 3} עוד`}
                sx={{
                  bgcolor: "rgba(19, 41, 61, 0.2)",
                  color: "#13293D",
                }}
              />
            )}
          </Stack>
        )}
      </Box>

      {/* Filter Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 420 },
            bgcolor: "#fafbfc",
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2.5,
            background: "linear-gradient(135deg, #13293D 0%, #3a5f7d 100%)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <FilterListIcon />
            <Typography variant="h6" fontWeight={600}>
              סינון ותצוגה
            </Typography>
          </Box>
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ p: 2, overflow: "auto", flex: 1 }}>
          {/* Templates Section */}
          <Accordion
            defaultExpanded={templates.length > 0}
            sx={{
              mb: 2,
              borderRadius: "12px !important",
              "&:before": { display: "none" },
              boxShadow: "0 2px 8px rgba(19, 41, 61, 0.08)",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                bgcolor: "rgba(19, 41, 61, 0.04)",
                borderRadius: "12px",
                "&.Mui-expanded": {
                  borderRadius: "12px 12px 0 0",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <BookmarkIcon sx={{ color: "#13293D" }} />
                <Typography fontWeight={600} color="#13293D">
                  תבניות שמורות
                </Typography>
                {templates.length > 0 && (
                  <Chip size="small" label={templates.length} sx={{ bgcolor: "#13293D", color: "#fff" }} />
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 2 }}>
              {templates.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                  אין תבניות שמורות עדיין
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {templates.map((template) => (
                    <Box
                      key={template.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: selectedTemplate === template.id ? "rgba(19, 41, 61, 0.12)" : "rgba(19, 41, 61, 0.04)",
                        border: selectedTemplate === template.id ? "2px solid #13293D" : "2px solid transparent",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        "&:hover": {
                          bgcolor: "rgba(19, 41, 61, 0.08)",
                        },
                      }}
                      onClick={() => handleLoadTemplate(template.id)}
                    >
                      <Typography fontWeight={selectedTemplate === template.id ? 600 : 400}>
                        {template.name}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTemplateToDelete(template.id);
                          setDeleteDialogOpen(true);
                        }}
                        sx={{ color: "#ff6b35" }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              )}
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setSaveDialogOpen(true)}
                sx={{
                  mt: 2,
                  borderRadius: 2,
                  borderColor: "#13293D",
                  color: "#13293D",
                  "&:hover": {
                    borderColor: "#3a5f7d",
                    bgcolor: "rgba(19, 41, 61, 0.04)",
                  },
                }}
              >
                שמור כתבנית חדשה
              </Button>
            </AccordionDetails>
          </Accordion>

          {/* Column Visibility Section */}
          <Accordion
            defaultExpanded
            sx={{
              mb: 2,
              borderRadius: "12px !important",
              "&:before": { display: "none" },
              boxShadow: "0 2px 8px rgba(19, 41, 61, 0.08)",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                bgcolor: "rgba(19, 41, 61, 0.04)",
                borderRadius: "12px",
                "&.Mui-expanded": {
                  borderRadius: "12px 12px 0 0",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <ViewColumnIcon sx={{ color: "#13293D" }} />
                <Typography fontWeight={600} color="#13293D">
                  תצוגת עמודות
                </Typography>
                {hiddenColumnsCount > 0 && (
                  <Chip
                    size="small"
                    label={`${hiddenColumnsCount} מוסתר`}
                    sx={{ bgcolor: "#ff6b35", color: "#fff" }}
                  />
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 2 }}>
              {/* Search columns */}
              <TextField
                fullWidth
                size="small"
                placeholder="חפש עמודה..."
                value={columnSearch}
                onChange={(e) => setColumnSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#13293D" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />

              {/* Select All / None */}
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleSelectAllColumns}
                  startIcon={<VisibilityIcon />}
                  sx={{
                    flex: 1,
                    borderRadius: 2,
                    borderColor: "#13293D",
                    color: "#13293D",
                  }}
                >
                  הצג הכל
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleDeselectAllColumns}
                  startIcon={<VisibilityOffIcon />}
                  sx={{
                    flex: 1,
                    borderRadius: 2,
                    borderColor: "#13293D",
                    color: "#13293D",
                  }}
                >
                  הסתר הכל
                </Button>
              </Box>

              {/* Column checkboxes */}
              <Box
                sx={{
                  maxHeight: 200,
                  overflow: "auto",
                  border: "1px solid rgba(19, 41, 61, 0.15)",
                  borderRadius: 2,
                  p: 1,
                }}
              >
                {filteredColumns.map((column) => (
                  <FormControlLabel
                    key={column.field}
                    control={
                      <Checkbox
                        checked={localVisibleColumns.includes(column.field)}
                        onChange={() => handleColumnToggle(column.field)}
                        sx={{
                          color: "#13293D",
                          "&.Mui-checked": {
                            color: "#13293D",
                          },
                        }}
                      />
                    }
                    label={column.headerName}
                    sx={{
                      display: "flex",
                      width: "100%",
                      m: 0,
                      py: 0.5,
                      px: 1,
                      borderRadius: 1,
                      "&:hover": {
                        bgcolor: "rgba(19, 41, 61, 0.04)",
                      },
                    }}
                  />
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Data Filters Section */}
          <Accordion
            defaultExpanded
            sx={{
              mb: 2,
              borderRadius: "12px !important",
              "&:before": { display: "none" },
              boxShadow: "0 2px 8px rgba(19, 41, 61, 0.08)",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                bgcolor: "rgba(19, 41, 61, 0.04)",
                borderRadius: "12px",
                "&.Mui-expanded": {
                  borderRadius: "12px 12px 0 0",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <FilterListIcon sx={{ color: "#13293D" }} />
                <Typography fontWeight={600} color="#13293D">
                  סינון נתונים
                </Typography>
                {activeFiltersCount > 0 && (
                  <Chip size="small" label={activeFiltersCount} sx={{ bgcolor: "#13293D", color: "#fff" }} />
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 2 }}>
              {activeFiltersCount > 0 && (
                <Button
                  size="small"
                  variant="text"
                  onClick={handleClearFilters}
                  startIcon={<DeleteOutlineIcon />}
                  sx={{
                    mb: 2,
                    color: "#ff6b35",
                  }}
                >
                  נקה את כל הסינונים
                </Button>
              )}

              <Stack spacing={2}>
                {filterableColumns.map((column) => (
                  <Box
                    key={column.field}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "rgba(19, 41, 61, 0.02)",
                      border: "1px solid rgba(19, 41, 61, 0.08)",
                    }}
                  >
                    <Typography variant="body2" fontWeight={600} color="#13293D" sx={{ mb: 0.5 }}>
                      {column.headerName}
                    </Typography>
                    {renderFilterInput(column)}
                  </Box>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Box>

        {/* Footer Actions */}
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid rgba(19, 41, 61, 0.1)",
            bgcolor: "#fff",
            display: "flex",
            gap: 1.5,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<RestartAltIcon />}
            onClick={handleReset}
            sx={{
              flex: 1,
              borderRadius: 2,
              borderColor: "#13293D",
              color: "#13293D",
              "&:hover": {
                borderColor: "#3a5f7d",
                bgcolor: "rgba(19, 41, 61, 0.04)",
              },
            }}
          >
            איפוס
          </Button>
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleApply}
            sx={{
              flex: 2,
              borderRadius: 2,
              background: "linear-gradient(135deg, #13293D 0%, #3a5f7d 100%)",
              boxShadow: "0 4px 14px rgba(19, 41, 61, 0.25)",
              "&:hover": {
                background: "linear-gradient(135deg, #0d1e2b 0%, #2a4a61 100%)",
              },
            }}
          >
            החל סינון
          </Button>
        </Box>
      </Drawer>

      {/* Save Template Dialog */}
      <Dialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 320,
          },
        }}
      >
        <DialogTitle sx={{ bgcolor: "#13293D", color: "#fff" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SaveIcon />
            שמור תבנית חדשה
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            autoFocus
            fullWidth
            label="שם התבנית"
            value={newTemplateName}
            onChange={(e) => setNewTemplateName(e.target.value)}
            placeholder="לדוגמה: סטטוסים הכי טובים"
            sx={{
              mt: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            התבנית תשמור את הסינונים הנוכחיים ואת העמודות המוצגות
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={() => setSaveDialogOpen(false)}
            sx={{ borderRadius: 2, color: "#13293D" }}
          >
            ביטול
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveTemplate}
            disabled={!newTemplateName.trim()}
            sx={{
              borderRadius: 2,
              bgcolor: "#13293D",
              "&:hover": { bgcolor: "#3a5f7d" },
            }}
          >
            שמור
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Template Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle>מחיקת תבנית</DialogTitle>
        <DialogContent>
          <Typography>האם אתה בטוח שברצונך למחוק את התבנית הזו?</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ borderRadius: 2, color: "#13293D" }}
          >
            ביטול
          </Button>
          <Button
            variant="contained"
            onClick={handleDeleteTemplate}
            sx={{
              borderRadius: 2,
              bgcolor: "#ff6b35",
              "&:hover": { bgcolor: "#e55a2b" },
            }}
          >
            מחק
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}