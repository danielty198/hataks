import React from 'react';
import { Typography, Box } from '@mui/material';
import { History as HistoryIcon } from '@mui/icons-material';

const EmptyState = ({ hasData }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 6,
        gap: 1,
      }}
    >
      <HistoryIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
      <Typography color="text.secondary">
        {hasData ? 'אין שינויים בתאריך זה' : 'אין היסטוריית שינויים'}
      </Typography>
    </Box>
  );
};

export default EmptyState;
