import React, { useState } from 'react';
import {
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
  Chip,
  Button,
  Collapse,
  Typography,
  IconButton,
  Tooltip,
  OutlinedInput,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Clear as ClearIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { fieldTranslations } from '../constants';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 6 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

// Multi-select filter component
const MultiSelectFilter = ({ label, field, value, options, onChange, icon }) => {
  const handleChange = (event) => {
    const selectedValues = event.target.value;
    onChange(field, typeof selectedValues === 'string' ? selectedValues.split(',') : selectedValues);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(field, []);
  };

  return (
    <FormControl size="small" sx={{ minWidth: 150, flex: 1 }}>
      <InputLabel id={`${field}-filter-label`}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {icon}
          {label}
        </Box>
      </InputLabel>
      <Select
        labelId={`${field}-filter-label`}
        multiple
        value={value}
        onChange={handleChange}
        input={<OutlinedInput label={label} />}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.length <= 2 ? (
              selected.map((val) => (
                <Chip key={val} label={val} size="small" sx={{ height: 20 }} />
              ))
            ) : (
              <Chip label={`${selected.length} נבחרו`} size="small" sx={{ height: 20 }} />
            )}
          </Box>
        )}
        MenuProps={MenuProps}
        endAdornment={
          value.length > 0 && (
            <IconButton size="small" onClick={handleClear} sx={{ mr: 2 }}>
              <ClearIcon fontSize="small" />
            </IconButton>
          )
        }
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            <Checkbox checked={value.indexOf(option) > -1} size="small" />
            <ListItemText primary={option} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

const HistoryFilters = ({
  filters,
  onFilterChange,
  onClearAllFilters,
  availableOptions,
  totalCount,
  filteredCount,
}) => {
  const [expanded, setExpanded] = useState(false);

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(
    (val) => Array.isArray(val) && val.length > 0
  ).length;

  // Filter configuration - which fields to show as filters
  const filterConfig = [
    { field: 'date', label: 'תאריך', icon: <CalendarIcon fontSize="small" /> },
    { field: 'changedBy', label: 'שונה ע"י', icon: null },
    { field: 'changedField', label: 'שדה שהשתנה', icon: null },
    { field: 'manoiya', label: fieldTranslations.manoiya || 'מנועיה', icon: null },
    { field: 'hatakType', label: fieldTranslations.hatakType || 'סוג חט"כ', icon: null },
    { field: 'sendingDivision', label: fieldTranslations.sendingDivision || 'אוגדה מוסרת', icon: null },
    { field: 'sendingBrigade', label: fieldTranslations.sendingBrigade || 'חטיבה מוסרת', icon: null },
    { field: 'sendingBattalion', label: fieldTranslations.sendingBattalion || 'גדוד מוסר', icon: null },
    { field: 'hatakStatus', label: fieldTranslations.hatakStatus || 'סטטוס חט"כ', icon: null },
    { field: 'tipulType', label: fieldTranslations.tipulType || 'סוג טיפול', icon: null },
    { field: 'recivingDivision', label: fieldTranslations.recivingDivision || 'אוגדה מקבלת', icon: null },
    { field: 'recivingBrigade', label: fieldTranslations.recivingBrigade || 'חטיבה מקבלת', icon: null },
    { field: 'recivingBattalion', label: fieldTranslations.recivingBattalion || 'גדוד מקבל', icon: null },
    { field: 'forManoiya', label: fieldTranslations.forManoiya || 'מנועיה לפקודה', icon: null },
    { field: 'performenceExpectation', label: fieldTranslations.performenceExpectation || 'צפי ביצוע', icon: null },
    { field: 'intended', label: fieldTranslations.intended || 'מיועד ל?', icon: null },
    // { field: 'engineSerial', label: fieldTranslations.engineSerial || 'מספר מנוע', icon: null },
    { field: 'minseretSerial', label: fieldTranslations.minseretSerial || 'מספר ממסרת', icon: null },
    { field: 'zadik', label: fieldTranslations.zadik || "צ' של כלי", icon: null },
  ];

  // Primary filters (always visible)
  const primaryFilters = filterConfig.slice(0, 4);
  // Secondary filters (shown when expanded)
  const secondaryFilters = filterConfig.slice(4);

  return (
    <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider' }}>
      {/* Header with filter count and clear button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterIcon color="action" />
          <Typography variant="subtitle2">
            סינון תוצאות
          </Typography>
          {activeFilterCount > 0 && (
            <Chip
              label={`${activeFilterCount} פילטרים פעילים`}
              size="small"
              color="primary"
              sx={{ height: 24 }}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {filteredCount} / {totalCount} שינויים
          </Typography>
          {activeFilterCount > 0 && (
            <Tooltip title="נקה את כל הפילטרים">
              <Button
                size="small"
                variant="outlined"
                onClick={onClearAllFilters}
                startIcon={<ClearIcon />}
                sx={{ height: 28 }}
              >
                נקה הכל
              </Button>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Primary Filters - Always Visible */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 1 }}>
        {primaryFilters.map((config) => {
          const options = availableOptions[config.field] || [];
          if (options.length === 0) return null;
          
          return (
            <MultiSelectFilter
              key={config.field}
              field={config.field}
              label={config.label}
              icon={config.icon}
              value={filters[config.field] || []}
              options={options}
              onChange={onFilterChange}
            />
          );
        })}
      </Box>

      {/* Expand Button */}
      <Button
        size="small"
        onClick={() => setExpanded(!expanded)}
        endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        sx={{ mt: 1, color: 'text.secondary' }}
      >
        {expanded ? 'הסתר פילטרים נוספים' : `הצג פילטרים נוספים (${secondaryFilters.filter(f => (availableOptions[f.field] || []).length > 0).length})`}
      </Button>

      {/* Secondary Filters - Expandable */}
      <Collapse in={expanded}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          {secondaryFilters.map((config) => {
            const options = availableOptions[config.field] || [];
            if (options.length === 0) return null;
            
            return (
              <MultiSelectFilter
                key={config.field}
                field={config.field}
                label={config.label}
                icon={config.icon}
                value={filters[config.field] || []}
                options={options}
                onChange={onFilterChange}
              />
            );
          })}
        </Box>
      </Collapse>
    </Box>
  );
};

export default HistoryFilters;
