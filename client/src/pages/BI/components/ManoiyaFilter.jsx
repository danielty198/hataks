import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Chip,
  IconButton,
} from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';
import { manoiyaOptions } from '../../../assets';

const ManoiyaFilter = ({ value, onChange }) => {
  const handleChange = (event) => {
    const selected = event.target.value;
    onChange(typeof selected === 'string' ? selected.split(',') : selected);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <FormControl size="small" sx={{ minWidth: 250 }}>
      <InputLabel>סינון לפי מנועיה</InputLabel>
      <Select
        multiple
        value={value}
        onChange={handleChange}
        input={<OutlinedInput label="סינון לפי מנועיה" />}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.length <= 2 ? (
              selected.map((val) => <Chip key={val} label={val} size="small" />)
            ) : (
              <Chip label={`${selected.length} נבחרו`} size="small" />
            )}
          </Box>
        )}
        endAdornment={
          value.length > 0 && (
            <IconButton size="small" onClick={handleClear} sx={{ ml: 2 }}>
              <ClearIcon fontSize="small" />
            </IconButton>
          )
        }
      >
        {manoiyaOptions.map((option) => (
          <MenuItem key={option} value={option}>
            <Checkbox checked={value.includes(option)} size="small" />
            <ListItemText primary={option} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default ManoiyaFilter;
