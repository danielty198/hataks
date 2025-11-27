import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import stylisRTLPlugin from 'stylis-plugin-rtl';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from './theme';
import { BrowserRouter } from 'react-router-dom';
const root = ReactDOM.createRoot(document.getElementById('root'));

const cacheRtl = createCache({
  key: 'mui-rtl',
  stylisPlugins: [stylisRTLPlugin]
});

root.render(
  <CacheProvider value={cacheRtl}>
    <CssBaseline />
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
        
    </ThemeProvider>
  </CacheProvider>
);

