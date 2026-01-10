import React from 'react';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { PieChart as PieChartIcon, TableChart as TableChartIcon } from '@mui/icons-material';

const ViewToggle = ({ value, onChange }) => {
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={(e, newMode) => newMode && onChange(newMode)}
      size="small"
    >
      <ToggleButton value="pies">
        <PieChartIcon sx={{ ml: 1 }} />
        תצוגת עוגות
      </ToggleButton>
      <ToggleButton value="table">
        <TableChartIcon sx={{ ml: 1 }} />
        תצוגת טבלה
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default ViewToggle;
