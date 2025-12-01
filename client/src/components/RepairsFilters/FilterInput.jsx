import { memo, useState, useCallback, useMemo } from "react";
import { TextField, FormControl, InputLabel, Select, MenuItem, Stack } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

// Stable sx objects - defined outside component to prevent recreation
const selectSx = { borderRadius: 2 };
const textFieldSx = { "& .MuiOutlinedInput-root": { borderRadius: 2 } };
const datePickerSlotProps = {
  textField: {
    size: "small",
    fullWidth: true,
    sx: textFieldSx,
  },
};

// Simple text input with local state - no debounce effect needed
const TextInput = memo(function TextInput({ field, headerName, initialValue, onChange }) {
  const [value, setValue] = useState(initialValue || "");

  const handleChange = useCallback((e) => {
    setValue(e.target.value);
  }, []);

  const handleBlur = useCallback(() => {
    onChange(field, value);
  }, [onChange, field, value]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter") {
      onChange(field, value);
    }
  }, [onChange, field, value]);

  return (
    <TextField
      fullWidth
      size="small"
      label={headerName}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      sx={textFieldSx}
    />
  );
});

// Select input
const SelectInput = memo(function SelectInput({ field, headerName, value, valueOptions, onChange }) {
  const handleChange = useCallback((e) => {
    onChange(field, e.target.value);
  }, [onChange, field]);

  const menuItems = useMemo(() => (
    <>
      <MenuItem value=""><em>הכל</em></MenuItem>
      {valueOptions.map((option) => (
        <MenuItem key={option} value={option}>{option}</MenuItem>
      ))}
    </>
  ), [valueOptions]);

  return (
    <FormControl fullWidth size="small">
      <InputLabel>{headerName}</InputLabel>
      <Select value={value || ""} onChange={handleChange} label={headerName} sx={selectSx}>
        {menuItems}
      </Select>
    </FormControl>
  );
});

// Single date picker
const SingleDatePicker = memo(function SingleDatePicker({ field, label, value, type, onDateChange }) {
  const handleChange = useCallback((val) => {
    onDateChange(field, type, val);
  }, [onDateChange, field, type]);

  const dateValue = useMemo(() => value ? dayjs(value) : null, [value]);

  return (
    <DatePicker
      label={label}
      value={dateValue}
      onChange={handleChange}
      slotProps={datePickerSlotProps}
      format="DD/MM/YYYY"
    />
  );
});

// Date range input
const DateRangeInput = memo(function DateRangeInput({ field, headerName, dateFrom, dateTo, onDateChange }) {
  return (
    <Stack spacing={1}>
      <SingleDatePicker
        field={field}
        label={`${headerName} - מתאריך`}
        value={dateFrom}
        type="from"
        onDateChange={onDateChange}
      />
      <SingleDatePicker
        field={field}
        label={`${headerName} - עד תאריך`}
        value={dateTo}
        type="to"
        onDateChange={onDateChange}
      />
    </Stack>
  );
});

// Main component - extracts primitive props to help memo work
const FilterInput = memo(function FilterInput({ column, value, dateFrom, dateTo, onChange, onDateChange }) {
  const { field, headerName, type, valueOptions } = column;

  if (type === "singleSelect" && valueOptions) {
    return (
      <SelectInput
        field={field}
        headerName={headerName}
        value={value}
        valueOptions={valueOptions}
        onChange={onChange}
      />
    );
  }

  if (type === "date") {
    return (
      <DateRangeInput
        field={field}
        headerName={headerName}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateChange={onDateChange}
      />
    );
  }

  return (
    <TextInput
      field={field}
      headerName={headerName}
      initialValue={value}
      onChange={onChange}
    />
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if these specific values change
  return (
    prevProps.value === nextProps.value &&
    prevProps.dateFrom === nextProps.dateFrom &&
    prevProps.dateTo === nextProps.dateTo &&
    prevProps.column.field === nextProps.column.field &&
    prevProps.onChange === nextProps.onChange &&
    prevProps.onDateChange === nextProps.onDateChange
  );
});

export default FilterInput;