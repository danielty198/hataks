import React from 'react';
import {
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Typography,
} from '@mui/material';
import { CalendarMonth as CalendarIcon } from '@mui/icons-material';

const DateFilter = ({ selectedDate, onChange, availableDates, totalCount }) => {
  return (
    <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider' }}>
      <FormControl fullWidth size="small">
        <InputLabel id="date-filter-label">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarIcon fontSize="small" />
            סינון לפי תאריך
          </Box>
        </InputLabel>
        <Select
          labelId="date-filter-label"
          value={selectedDate}
          onChange={(e) => onChange(e.target.value)}
          label="סינון לפי תאריך"
        >
          <MenuItem value="all">
            <Typography>כל התאריכים ({totalCount} שינויים)</Typography>
          </MenuItem>
          <Divider />
          {availableDates.map((date) => (
            <MenuItem key={date.key} value={date.key}>
              {date.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default DateFilter;
