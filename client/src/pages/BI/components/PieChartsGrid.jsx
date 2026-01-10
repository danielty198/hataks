import React from 'react';
import { Box } from '@mui/material';
import PieChartCard from './PieChartCard';

const PieChartsGrid = ({ pieTypes, pieData, onEdit }) => {
  return (
    <Box>
      {/* Top Row - 3 pies */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, justifyContent: 'center' }}>
        {pieTypes.slice(0, 3).map((hatakType, index) => (
          <PieChartCard
            key={`${hatakType}-${index}`}
            title={hatakType}
            data={pieData[hatakType] || []}
            onEdit={() => onEdit(index)}
          />
        ))}
      </Box>

      {/* Bottom Row - 2 pies */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        {pieTypes.slice(3, 5).map((hatakType, index) => (
          <PieChartCard
            key={`${hatakType}-${index + 3}`}
            title={hatakType}
            data={pieData[hatakType] || []}
            onEdit={() => onEdit(index + 3)}
          />
        ))}
      </Box>
    </Box>
  );
};

export default PieChartsGrid;
