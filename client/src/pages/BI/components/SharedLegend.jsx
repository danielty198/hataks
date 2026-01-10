import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { hatakStatusOptions } from '../../../assets';
import { STATUS_COLOR_MAP } from '../constants';

const SharedLegend = () => {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        מקרא סטטוסים
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
        {hatakStatusOptions.map((status) => (
          <Box key={status} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: '4px',
                backgroundColor: STATUS_COLOR_MAP[status],
                border: '1px solid rgba(0,0,0,0.1)',
              }}
            />
            <Typography variant="caption">{status}</Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default SharedLegend;
