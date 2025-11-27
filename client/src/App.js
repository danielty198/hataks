import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Box, AppBar, Toolbar, Typography, Button } from "@mui/material";
import Sidebar from "./components/Sidebar";

// import Dashboard from "./pages/Dashboard";
// import Cars from "./pages/Cars";
import Repairs from "./pages/Repairs";

function App() {

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />

      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: "240px" }}>
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Typography variant="h4">מערכת ניהול מוסך</Typography>
            <Button variant="contained">הוספת תיקון</Button>
          </Toolbar>
        </AppBar>

        <Box sx={{ mt: 3 }}>
          <Routes>
            {/* <Route path="/" element={<Dashboard />} />
            <Route path="/cars" element={<Cars />} /> */}
            <Route path="/repairs" element={<Repairs />} />
          </Routes>
        </Box>
      </Box>

    </Box>
  );
}

export default App;


