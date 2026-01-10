import React from 'react';
import { Box, Paper, Typography, IconButton } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const PieChartCard = ({ title, data, onEdit }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Custom label showing numbers
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
    if (value === 0) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#333"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {value}
      </text>
    );
  };

  return (
    <Paper sx={{ p: 2, flex: 1, maxWidth: 320, minWidth: 260, position: 'relative' }}>
      {/* Edit Button */}
      <IconButton
        size="small"
        onClick={onEdit}
        sx={{ position: 'absolute', top: 8, right: 8 }}
      >
        <EditIcon fontSize="small" />
      </IconButton>

      <Typography variant="h6" fontWeight={600} textAlign="center" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center" mb={1}>
        סה"כ: {total}
      </Typography>

      {data.length === 0 || total === 0 ? (
        <Box sx={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="text.disabled">אין נתונים</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={90}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [value, name]} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
};

export default PieChartCard;
