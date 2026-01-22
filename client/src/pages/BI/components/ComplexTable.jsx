import React from 'react';
import { Box, Paper } from '@mui/material';
import { manoiyaOptions, hatakStatusOptions, hatakTypeOptions } from '../../../assets';
import { STATUS_COLOR_MAP } from '../constants';

const ComplexTable = ({ tableData }) => {
  const manoiyaColumns = ['sum', ...manoiyaOptions];

  return (
    <Paper sx={{ overflow: 'auto', maxHeight: '70vh', width: '80vw', maxWidth: '80vw' }}>
      <Box
        component="table"
        sx={{
          width: 'max-content',
          borderCollapse: 'collapse',
          direction: 'rtl',
          '& th, & td': {
            border: '1px solid',
            borderColor: 'divider',
            p: 0.5,
            fontSize: '0.75rem',
          },
        }}
      >
        {/* Header Row 1 - מנועיה */}
        <Box component="thead">
          <Box component="tr">
            {manoiyaColumns.map((manoiya, index) => (
              <Box
                key={manoiya}
                component="th"
                colSpan={hatakStatusOptions.length}
                sx={{
                  bgcolor: manoiya === 'sum' ? 'success.main' : 'primary.main',
                  color: 'white',
                  fontWeight: 700,
                  textAlign: 'center',
                  border: '1px solid black',
                }}
              >
                {manoiya === 'sum' ? 'סה"כ' : manoiya}
              </Box>
            ))}
            <Box
              component="th"
              rowSpan={2}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                fontWeight: 700,
                minWidth: 100,
                position: 'sticky',
                left: 0,
                zIndex: 3,
                verticalAlign: 'top',
              }}
            >
              סוג חט"כ
            </Box>
          </Box>

          {/* Header Row 2 - סטטוסים */}
          <Box component="tr">
            {manoiyaColumns.map((manoiya, manoiyaIndex) =>
              hatakStatusOptions.map((status, statusIndex) => (
                <Box
                  key={`${manoiya}-${status}`}
                  component="th"
                  sx={{
                    bgcolor: STATUS_COLOR_MAP[status],
                    fontWeight: 600,
                    textAlign: 'center',
                    minWidth: 50,
                    fontSize: '0.65rem',
                    whiteSpace: 'nowrap',
                    borderRight: statusIndex === hatakStatusOptions.length - 1 && manoiyaIndex < manoiyaColumns.length - 1 ? '3px solid white' : undefined,
                  }}
                >
                  {status}
                </Box>
              ))
            )}
          </Box>
        </Box>

        {/* Data Rows */}
        <Box component="tbody">
          {hatakTypeOptions.map((hatakType, rowIndex) => (
            <Box
              key={hatakType}
              component="tr"
              sx={{ bgcolor: rowIndex % 2 === 0 ? 'grey.50' : 'white' }}
            >
              {manoiyaColumns.map((manoiya, manoiyaIndex) =>
                hatakStatusOptions.map((status, statusIndex) => {
                  const value = tableData[hatakType]?.[manoiya]?.[status] || 0;
                  return (
                    <Box
                      key={`${hatakType}-${manoiya}-${status}`}
                      component="td"
                      sx={{
                        textAlign: 'center',
                        bgcolor: value > 0 ? `${STATUS_COLOR_MAP[status]}40` : 'transparent',
                        fontWeight: value > 0 ? 600 : 400,
                        borderRight: statusIndex === hatakStatusOptions.length - 1 && manoiyaIndex < manoiyaColumns.length - 1 ? '3px solid #ccc' : undefined,
                      }}
                    >
                      {value || '-'}
                    </Box>
                  );
                })
              )}
              <Box
                component="td"
                sx={{
                  fontWeight: 600,
                  position: 'sticky',
                  left: 0,
                  bgcolor: rowIndex % 2 === 0 ? 'grey.50' : 'white',
                  zIndex: 1,
                }}
              >
                {hatakType}
              </Box>
            </Box>
          ))}
        </Box>

        {/* Total Row */}
        <Box component="tfoot">
          <Box component="tr" sx={{ bgcolor: 'grey.200' }}>
            {manoiyaColumns.map((manoiya, manoiyaIndex) =>
              hatakStatusOptions.map((status, statusIndex) => {
                const total = hatakTypeOptions.reduce((sum, hatakType) => {
                  return sum + (tableData[hatakType]?.[manoiya]?.[status] || 0);
                }, 0);
                return (
                  <Box
                    key={`total-${manoiya}-${status}`}
                    component="td"
                    sx={{
                      textAlign: 'center',
                      fontWeight: 700,
                      bgcolor: total > 0 ? `${STATUS_COLOR_MAP[status]}60` : 'grey.200',
                      borderRight: statusIndex === hatakStatusOptions.length - 1 && manoiyaIndex < manoiyaColumns.length - 1 ? '3px solid #999' : undefined,
                    }}
                  >
                    {total || '-'}
                  </Box>
                );
              })
            )}
            <Box
              component="td"
              sx={{
                fontWeight: 700,
                position: 'sticky',
                left: 0,
                bgcolor: 'grey.200',
                zIndex: 1,
              }}
            >
              סה"כ
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default ComplexTable;