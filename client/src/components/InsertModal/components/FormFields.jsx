import React from 'react';
import { TextField, Autocomplete } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { FieldWrapper } from '../styles/styledComponents';
import { inputStyles, multilineInputStyles } from '../styles/theme';

// ---------------------------
// SelectField
// ---------------------------
const SelectFieldComponent = ({ name, label, options, value, onChange, required, error }) => (
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
      error={error}
      helperText={error ? 'שדה חובה' : ''}
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

export const SelectField = React.memo(SelectFieldComponent);

// ---------------------------
// AutocompleteField
// ---------------------------
const AutocompleteFieldComponent = ({ name, label, options, value, onChange }) => (
  <FieldWrapper>
    <Autocomplete
      options={options}
      value={value}
      onChange={(_, val) => onChange(name, val)}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          id={name}
          variant="outlined"
          sx={inputStyles}
        />
      )}
      sx={{
        '& .MuiOutlinedInput-root': {
          height: '56px',
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
      error={error}
      helperText={error ? 'שדה חובה' : ''}
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
          error,
          helperText: error ? 'שדה חובה' : '',
          sx: inputStyles,
        },
      }}
    />
  </FieldWrapper>
);

export const DateField = React.memo(DateFieldComponent);

// Debug
console.log('FormFields rendered');
