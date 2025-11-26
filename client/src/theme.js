const { createTheme } = require('@mui/material/styles');

export const theme = createTheme({
    direction: 'rtl',
    typography: {
        fontFamily: ['"Assistant"', 'Arial', 'sans-serif'].join(',')
    },
});