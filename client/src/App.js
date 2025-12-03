import React from "react";
import { Routes, Route } from "react-router-dom";
import { Box, AppBar, Toolbar, Typography } from "@mui/material";
import Sidebar from "./components/Sidebar";
import Repairs from "./pages/Repairs/Repairs";
import BI from "./pages/BI";
import '@fontsource/assistant/400.css';
import '@fontsource/assistant/500.css';
function App() {
  return (
    <Box sx={{ width: "100vw", display: "flex",justifyContent:'center', height: "100vh",  }}>

      <Sidebar />


      {/* Main content area (88vw) */}

      <Box
        component="main"
        sx={{
          width: "87vw",       // remaining width
          display: "flex",     // to center inner content
          justifyContent: "center",

          position:'relative',
        }}
      >

          <Routes>
            <Route path="/bi" element={<BI />} />
            <Route path="/repairs" element={<Repairs />} />
          </Routes>

      </Box>
    </Box>

  );
}

export default App;
