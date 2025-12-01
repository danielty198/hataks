import { createTheme } from "@mui/material/styles";
import { heIL } from '@mui/x-data-grid/locales';

export const theme = createTheme(
  {
    direction: 'rtl',
    palette: {
      primary: {
        main: '#13293D',
        light: '#3a5f7d',
        dark: '#0d1e2b',
        contrastText: '#ffffff',
      },
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: [
        'Assistant',
        'Rubik',
        'Heebo',
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'sans-serif'
      ].join(','),
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        letterSpacing: '-0.01562em',
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
        letterSpacing: '-0.00833em',
        lineHeight: 1.3,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        letterSpacing: '0em',
        lineHeight: 1.4,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        letterSpacing: '0.00735em',
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
        letterSpacing: '0em',
        lineHeight: 1.5,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
        letterSpacing: '0.0075em',
        lineHeight: 1.6,
      },
      subtitle1: {
        fontSize: '1rem',
        fontWeight: 500,
        letterSpacing: '0.00938em',
        lineHeight: 1.75,
      },
      subtitle2: {
        fontSize: '0.875rem',
        fontWeight: 500,
        letterSpacing: '0.00714em',
        lineHeight: 1.57,
      },
      body1: {
        fontSize: '1rem',
        fontWeight: 400,
        letterSpacing: '0.00938em',
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.875rem',
        fontWeight: 400,
        letterSpacing: '0.01071em',
        lineHeight: 1.5,
      },
      button: {
        fontSize: '0.875rem',
        fontWeight: 600,
        letterSpacing: '0.02857em',
        lineHeight: 1.75,
        textTransform: 'none',
      },
      caption: {
        fontSize: '0.75rem',
        fontWeight: 400,
        letterSpacing: '0.03333em',
        lineHeight: 1.66,
      },
      overline: {
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.08333em',
        lineHeight: 2.66,
        textTransform: 'uppercase',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '16px',
          },
          contained: {
            backgroundColor: '#3a5f7d',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#2a4a61',
            },
          },
        },
      },
      MuiDataGrid: {
        styleOverrides: {
          root: {
            borderRadius: '16px',
            overflow: 'hidden',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: "#13293D",
              color: "#ffffff",
            },
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: "#13293D",
              color: "#ffffff",
              fontWeight: "bold",
            },
            '& .MuiDataGrid-iconButtonContainer': {
              color: "#ffffff",
            },
            '& .MuiDataGrid-sortIcon': {
              color: "#ffffff",
            },
            '& .MuiDataGrid-menuIcon': {
              color: "#ffffff",
            },
            '& .MuiDataGrid-columnHeader .MuiIconButton-root': {
              color: "#ffffff",
            },
          },
        },
      },
    },
  },
  heIL
);