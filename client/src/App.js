import React, { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Box, AppBar, Toolbar, Typography } from "@mui/material";
import Sidebar from "./components/Sidebar";
import Repairs from "./pages/Repairs/Repairs";
import RepairsPendingDeletionPage from "./pages/Repairs/RepairsPendingDeletion";
import BI from "./pages/BI";
import '@fontsource/assistant/400.css';
import '@fontsource/assistant/500.css';
import { ASSETS_SERVICE_SERVER_PORT, clientPort, USER_SERVICE_CLIENT_PORT, USER_SERVICE_SERVER_PORT } from "./assets";

import UserManagement from './pages/UserManagement/UserManagement'
import SwitchRules from './pages/SwitchRules/SwitchRules'
import ProtectedRoute from "./utils/ProtectedRoute";
import ProtectedUser from "./utils/ProtectedUser";
import useUser from "./contexts/UserContext";
import { DistinctValuesProvider } from "./contexts/DistinctValuesContext";
function App() {



  const [user, setUser] = useUser();
  const navigate = useNavigate();
  useEffect(() => {
    setUser({ roles: ['admin'], templates: [] })
  }, [])
  // useEffect(() => {

  //   const handleUser = async () => {
  //     const req = window.location.search;
  //     const id = req.slice(1).split("id=")[1];


  //     const getUserFromId = async () => {
  //       const response = await fetch(`http://localhost:${USER_SERVICE_SERVER_PORT}/api/user/findOneById/${id}?port=${clientPort}`);
  //       const data = await response.json();
  //       const user = data.user;
  //       return user;
  //     };

  //     if (id && !user) {
  //       setUser(await getUserFromId());
  //     }

  //     if (id && user) {
  //       const idUser = await getUserFromId();
  //       fetch(`http://localhost:${ASSETS_SERVICE_SERVER_PORT}/api/assets/twoObjectsAreEqual`, {
  //         method: "POST",
  //         headers: { "content-type": "application/json" },
  //         body: JSON.stringify({ obj1: idUser, obj2: user })
  //       })
  //         .then((res) => res.json())
  //         .then((data) => {
  //           if (!data.payload) {
  //             setUser(idUser);
  //           }
  //           // window.location.href = window.location.origin
  //           navigate("/")
  //         });
  //     }

  //     if (!id && user === null) {
  //       fetch(`http://localhost:${ASSETS_SERVICE_SERVER_PORT}/api/assets/encodeDecodePort/${clientPort}`)
  //         .then((res) => res.json())
  //         .then((data) => {
  //           window.location.href = `http://localhost:${USER_SERVICE_CLIENT_PORT}/login?PORT=${data.port}`;
  //         });
  //     }
  //   }
  //   handleUser()
  // }, [user]);






  return (
    <Box sx={{ width: "100vw", display: "flex", justifyContent: 'center', height: "100vh", }}>

      <Sidebar />


      {/* Main content area (88vw) */}

      <Box
        component="main"
        sx={{
          width: "87vw",       // remaining width
          display: "flex",     // to center inner content
          justifyContent: "center",

          position: 'relative',
        }}
      >
        <ProtectedUser user={user}>
          <Routes>
            <Route path="/" element={<DistinctValuesProvider><Repairs /></DistinctValuesProvider>} />
            <Route path="/bi" element={<BI />} />
            <Route path="/hataks" element={<DistinctValuesProvider><Repairs /></DistinctValuesProvider>} />
            <Route
              path="/hataks-to-delete"
              element={
                <ProtectedRoute roleRequired="admin">
                  <DistinctValuesProvider>
                    <RepairsPendingDeletionPage />
                  </DistinctValuesProvider>
                </ProtectedRoute>
              }
            />
            <Route path="/users" element={<ProtectedRoute roleRequired='admin'><UserManagement /></ProtectedRoute>} />
            <Route path="/switch-rules" element={<ProtectedRoute roleRequired="admin"><SwitchRules /></ProtectedRoute>} />
          </Routes>
        </ProtectedUser>


      </Box>
    </Box>

  );
}

export default App;
