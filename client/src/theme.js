import { createTheme } from "@mui/material/styles";
import { heIL } from '@mui/x-data-grid/locales';
export const theme = createTheme({
    direction: 'rtl',
    typography: {
        fontFamily: ['"Assistant"', 'Arial', 'sans-serif'].join(',')
    },
});


export const tableTheme = createTheme({

    components: {
        MuiTablePagination: {
            styleOverrides: {
                actions: {
                    direction: 'rtl !important',
                    transform: 'rotate(180deg)',
                }
            }
        },
    },
},
    heIL
)