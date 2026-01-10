import React from 'react';
import { Box, Paper } from '@mui/material';
import { manoiyaOptions, hatakStatusOptions, hatakTypeOptions } from '../../../assets';
import { STATUS_COLOR_MAP } from '../constants';

const ComplexTable = ({ tableData }) => {
  const manoiyaColumns = [...manoiyaOptions, 'sum'];

  return (
    <Paper sx={{ overflow: 'auto', maxHeight: '70vh' }}>
      <Box
        component="table"
        sx={{
          width: '100%',
          borderCollapse: 'collapse',
          minWidth: 1200,
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
            <Box
              component="th"
              rowSpan={2}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                fontWeight: 700,
                minWidth: 100,
                position: 'sticky',
                right: 0,
                zIndex: 3,
              }}
            >
              סוג חט"כ
            </Box>
            {manoiyaColumns.map((manoiya) => (
              <Box
                key={manoiya}
                component="th"
                colSpan={hatakStatusOptions.length}
                sx={{
                  bgcolor: manoiya === 'sum' ? 'success.main' : 'primary.main',
                  color: 'white',
                  fontWeight: 700,
                  textAlign: 'center',
                }}
              >
                {manoiya === 'sum' ? 'סה"כ' : manoiya}
              </Box>
            ))}
          </Box>

          {/* Header Row 2 - סטטוסים */}
          <Box component="tr">
            {manoiyaColumns.map((manoiya) =>
              hatakStatusOptions.map((status) => (
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
              <Box
                component="td"
                sx={{
                  fontWeight: 600,
                  position: 'sticky',
                  right: 0,
                  bgcolor: rowIndex % 2 === 0 ? 'grey.50' : 'white',
                  zIndex: 1,
                }}
              >
                {hatakType}
              </Box>
              {manoiyaColumns.map((manoiya) =>
                hatakStatusOptions.map((status) => {
                  const value = tableData[hatakType]?.[manoiya]?.[status] || 0;
                  return (
                    <Box
                      key={`${hatakType}-${manoiya}-${status}`}
                      component="td"
                      sx={{
                        textAlign: 'center',
                        bgcolor: value > 0 ? `${STATUS_COLOR_MAP[status]}40` : 'transparent',
                        fontWeight: value > 0 ? 600 : 400,
                      }}
                    >
                      {value || '-'}
                    </Box>
                  );
                })
              )}
            </Box>
          ))}
        </Box>

        {/* Total Row */}
        <Box component="tfoot">
          <Box component="tr" sx={{ bgcolor: 'grey.200' }}>
            <Box
              component="td"
              sx={{
                fontWeight: 700,
                position: 'sticky',
                right: 0,
                bgcolor: 'grey.200',
                zIndex: 1,
              }}
            >
              סה"כ
            </Box>
            {manoiyaColumns.map((manoiya) =>
              hatakStatusOptions.map((status) => {
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
                    }}
                  >
                    {total || '-'}
                  </Box>
                );
              })
            )}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default ComplexTable;
