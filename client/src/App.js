import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, Button, AppBar, Toolbar } from '@mui/material';
import CarRepairTable from './components/Repairs';

// RTL + Emotion setup
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import stylisRTLPlugin from 'stylis-plugin-rtl';

// create emotion cache with rtl plugin
// const cacheRtl = createCache({
//   key: 'mui-rtl',
//   stylisPlugins: [stylisRTLPlugin]
// });

// // create theme with direction rtl
// const theme = createTheme({
//   direction: 'rtl',
//   typography: {
//     fontFamily: ['"Assistant"', 'Arial', 'sans-serif'].join(',')
//   },
// });

function App() {
  return (
    // <CacheProvider value={cacheRtl}>
    //   <ThemeProvider theme={theme}>
    //     <CssBaseline />
        <Box sx={{ display: 'flex' }}>
          <Drawer variant="permanent" anchor="left" sx={{
            '& .MuiDrawer-paper': { width: 240, boxSizing: 'border-box', backgroundColor: '#13293D', color: '#fff' }
          }}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>מערכת תיקוני רכב</Typography>
            </Box>
            <List>
              <ListItem button>
                <ListItemIcon sx={{ color: '#fff' }}>🏠</ListItemIcon>
                <ListItemText primary="דאשבורד" />
              </ListItem>
              <ListItem button>
                <ListItemIcon sx={{ color: '#fff' }}>🚗</ListItemIcon>
                <ListItemText primary="מכוניות" />
              </ListItem>
              <ListItem button selected>
                <ListItemIcon sx={{ color: '#fff' }}>🔧</ListItemIcon>
                <ListItemText primary="תיקונים" />
              </ListItem>
            </List>
          </Drawer>

          <Box component="main" sx={{ flexGrow: 1, p: 3, ml: '240px' }}>
            <AppBar position="static" color="transparent" elevation={0}>
              <Toolbar sx={{ justifyContent: 'space-between' }}>
                <Typography variant="h4" component="div">מערכת ניהול מוסך</Typography>
                <Button variant="contained">הוספת תיקון</Button>
              </Toolbar>
            </AppBar>

            <Box sx={{ mt: 3 }}>
              <CarRepairTable />
            </Box>
          </Box>
        </Box>
    //   </ThemeProvider>
    // </CacheProvider>
  );
}

export default App;
