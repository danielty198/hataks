import { memo, useCallback, useMemo } from "react";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Chip,
  Box,
  Autocomplete,
  OutlinedInput,
  Checkbox,
  ListItemText,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

const selectSx = { borderRadius: 2 };
const textFieldSx = { "& .MuiOutlinedInput-root": { borderRadius: 2 } };
const datePickerSlotProps = {
  textField: {
    size: "small",
    fullWidth: true,
    sx: textFieldSx,
  },
};

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 6 + ITEM_PADDING_TOP,
    },
  },
};

const MultiSelectInput = memo(function MultiSelectInput({ field, headerName, value, valueOptions, onChange }) {
  const selectedValues = useMemo(() => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return value.split(',').filter(Boolean);
  }, [value]);

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    onChange(field, Array.isArray(newValue) ? newValue.join(',') : newValue);
  }, [onChange, field]);

  const handleDelete = useCallback((valueToDelete) => {
    const newValues = selectedValues.filter((v) => v !== valueToDelete);
    onChange(field, newValues.join(','));
  }, [onChange, field, selectedValues]);

  return (
    <FormControl fullWidth size="small">
      <InputLabel>{headerName}</InputLabel>
      <Select
        multiple
        value={selectedValues}
        onChange={handleChange}
        input={<OutlinedInput label={headerName} />}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((val) => (
              <Chip
                key={val}
                label={val}
                size="small"
                onDelete={() => handleDelete(val)}
                onMouseDown={(e) => e.stopPropagation()}
              />
            ))}
          </Box>
        )}
        MenuProps={MenuProps}
        sx={selectSx}
      >
        {valueOptions.map((option) => (
          <MenuItem key={option} value={option}>
            <Checkbox checked={selectedValues.includes(option)} size="small" />
            <ListItemText primary={option} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
});

const AutocompleteMultiInput = memo(function AutocompleteMultiInput({
  field,
  headerName,
  value,
  onChange,
  options,
  onOpen,
  onInputChange,
  onLoadMore,
  loading,
}) {
  
  const selectedValues = useMemo(() => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return value.split(',').filter(Boolean);
  }, [value]);

  const handleChange = useCallback((_, newValue) => {
    onChange(field, newValue.join(','));
  }, [onChange, field]);

  return (
    <Autocomplete
      multiple
      freeSolo
      options={options}
      value={selectedValues}
      onChange={handleChange}
      onOpen={onOpen}
      onInputChange={(_, val) => onInputChange?.(val)}
      loading={Boolean(loading)}
      ListboxProps={{
        onScroll: (e) => {
          const listboxNode = e.currentTarget;
          if (!listboxNode) return;
          const nearBottom = listboxNode.scrollTop + listboxNode.clientHeight >= listboxNode.scrollHeight - 24;
          if (nearBottom) onLoadMore?.();
        },
      }}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={option}
            label={option}
            size="small"
          />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={headerName}
          size="small"
          placeholder={options.length > 0 ? "בחר או הקלד" : "הקלד ולחץ Enter"}
          sx={textFieldSx}
        />
      )}
    />
  );
});

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

const FilterInput = memo(function FilterInput({
  column,
  value,
  dateFrom,
  dateTo,
  onChange,
  onDateChange,
  dynamicOptions,
  onOptionsOpen,
  onOptionsInputChange,
  onOptionsLoadMore,
  optionsLoading,
}) {
  const { field, headerName, type, valueOptions, isMultiSelect } = column;


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

  if ((type === "singleSelect" && valueOptions) || isMultiSelect) {
    return (
      <MultiSelectInput
        field={field}
        headerName={headerName}
        value={value}
        valueOptions={valueOptions}
        onChange={onChange}
      />
    );
  }

  // ALL other fields use autocomplete
  return (
    <AutocompleteMultiInput
      field={field}
      headerName={headerName}
      value={value}
      onChange={onChange}
      options={dynamicOptions || []}
      onOpen={onOptionsOpen}
      onInputChange={onOptionsInputChange}
      onLoadMore={onOptionsLoadMore}
      loading={optionsLoading}
    />
  );
});

export default FilterInput;