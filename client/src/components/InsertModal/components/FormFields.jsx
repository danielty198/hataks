import React from 'react';
import { TextField, Autocomplete, FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { FieldWrapper } from '../styles/styledComponents';
import { inputStyles, multilineInputStyles } from '../styles/theme';

// ---------------------------
// SelectField
// ---------------------------
const SelectFieldComponent = ({ name, label, options, value, onChange, required, error, multiple }) => {
  if (multiple) {
    return (
      <FieldWrapper>
        <FormControl fullWidth variant="outlined" required={required} error={error?.error}>
          <InputLabel id={`${name}-label`}>{label}</InputLabel>
          <Select
            labelId={`${name}-label`}
            id={name}
            multiple
            value={value || []}
            onChange={(e) => onChange(name, e.target.value)}
            renderValue={(selected) => selected.join(', ')}
            label={label}
            sx={inputStyles}
          >
            {options.map((opt) => (
              <MenuItem
                key={opt}
                value={opt}
                selected={(value || []).includes(opt)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(25, 118, 210, 0.2)',
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.3)',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                {opt}
              </MenuItem>
            ))}
          </Select>
          {error?.error && <FormHelperText>{error.msg}</FormHelperText>}
        </FormControl>
      </FieldWrapper>
    );
  }

  // Single select (original behavior)
  return (
    <FieldWrapper>
      <TextField
        select
        fullWidth
        name={name}
        id={name}
        label={label}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        variant="outlined"
        required={required}
        error={error?.error}
        helperText={error?.msg || ''}
        SelectProps={{ native: true }}
        sx={inputStyles}
      >
        <option value=""></option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </TextField>
    </FieldWrapper>
  );
};

export const SelectField = React.memo(SelectFieldComponent);

// ---------------------------
// AutocompleteField
// ---------------------------
const AutocompleteFieldComponent = ({ name, label, options, value, onBlur, onChange, freeSolo = false, required, error }) => (
  <FieldWrapper>
    <Autocomplete
      options={options}
      value={value || ''}
      onChange={(_, val) => onChange(name, val)}   // when you select an option 
      freeSolo={freeSolo}
      onInputChange={(_, val) => {
        if (freeSolo) {
          onChange(name, val);   // when you type in the input 
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          id={name}
          variant="outlined"
          required={required}
          onBlur={(e) => {
            if (onBlur) {
              onBlur(name, e.target.value, options);  // Pass name, value, and options
            }
          }}
          error={error?.error}
          helperText={error?.msg || ''}
          sx={inputStyles}
        />
      )}
      sx={{
        '& .MuiOutlinedInput-root': {
          minHeight: '56px',
        },
      }}
    />
  </FieldWrapper>
);

export const AutocompleteField = React.memo(AutocompleteFieldComponent);

// ---------------------------
// InputField
// ---------------------------
const InputFieldComponent = ({ name, label, value, onChange, required, error, multiline }) => (
  <FieldWrapper>
    <TextField
      fullWidth
      name={name}
      id={name}
      label={label}
      value={value}
      onChange={(e) => onChange(name, e.target.value)}
      variant="outlined"
      required={required}
      error={error?.error}
      helperText={error?.msg || ''}
      multiline={multiline}
      rows={multiline ? 4 : 1}
      sx={multiline ? multilineInputStyles : inputStyles}
    />
  </FieldWrapper>
);

export const InputField = React.memo(InputFieldComponent);

// ---------------------------
// DateField
// ---------------------------
const DateFieldComponent = ({ name, label, value, onChange, required, error }) => (
  <FieldWrapper>
    <DatePicker
      label={label}
      value={value}
      onChange={(val) => onChange(name, val)}
      sx={{ width: '100%' }}
      slotProps={{
        textField: {
          id: name,
          variant: 'outlined',
          fullWidth: true,
          required,
          error: error?.error,
          helperText: error?.msg || '',
          sx: inputStyles,
        },
      }}
    />
  </FieldWrapper>
);

export const DateField = React.memo(DateFieldComponent);

// Debug
console.log('FormFields rendered');