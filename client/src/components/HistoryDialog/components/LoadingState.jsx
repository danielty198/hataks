import React from 'react';
import { Typography, Box, CircularProgress } from '@mui/material';

const LoadingState = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 6,
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography color="text.secondary">טוען היסטוריה...</Typography>
    </Box>
  );
};

export default LoadingState;
