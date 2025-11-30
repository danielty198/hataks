import { createTheme } from "@mui/material/styles";
import { heIL } from '@mui/x-data-grid/locales';
export const theme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: ['"Assistant"', 'Arial', 'sans-serif'].join(',')
  },
  components: {
    MuiDataGrid: {
      styleOverrides: {
        columnHeaders: {
          backgroundColor: "#13293D",
          color: "#ffffff",
          fontWeight: "bold",
        },
      },
    },
  },
});


export const tableTheme = createTheme(
  {
    direction: "rtl",
  },
  heIL
);