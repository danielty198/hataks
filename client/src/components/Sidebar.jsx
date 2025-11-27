import React from "react";
import { useNavigate } from "react-router-dom";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography } from "@mui/material";

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        "& .MuiDrawer-paper": {
          width: 240,
          boxSizing: "border-box",
          backgroundColor: "#13293D",
          color: "#fff",
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          מערכת תיקוני רכב
        </Typography>
      </Box>

      <List>
        <ListItem button onClick={() => navigate("/")}>
          <ListItemIcon sx={{ color: "#fff" }}>🏠</ListItemIcon>
          <ListItemText primary="דאשבורד" />
        </ListItem>

        <ListItem button onClick={() => navigate("/cars")}>
          <ListItemIcon sx={{ color: "#fff" }}>🚗</ListItemIcon>
          <ListItemText primary="מכוניות" />
        </ListItem>

        <ListItem button onClick={() => navigate("/repairs")}>
          <ListItemIcon sx={{ color: "#fff" }}>🔧</ListItemIcon>
          <ListItemText primary="תיקונים" />
        </ListItem>
      </List>
    </Drawer>
  );
}
