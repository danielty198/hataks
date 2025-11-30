import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from './theme';
import { BrowserRouter } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';




const root = ReactDOM.createRoot(document.getElementById('root'));

const cacheRtl = createCache({
  key: 'mui-rtl',
  stylisPlugins: [rtlPlugin]
});

root.render(
  <CacheProvider value={cacheRtl}>
    <CssBaseline />
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <App />
        </LocalizationProvider>
      </BrowserRouter>
    </ThemeProvider>
  </CacheProvider>
);

