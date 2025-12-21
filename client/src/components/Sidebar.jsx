import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, List, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material";

export default function Sidebar() {
  const navigate = useNavigate();

  // 🔵 Sidebar configuration object
  const menuItems = [
    { label: "חטכים", path: "/hataks", icon: "🔧" },
    { label: "bi", path: "/bi", icon: "📊" },
     { label: "ניהול משתמשים", path: "/users", icon: "👤" },
  ];

  return (
    <Box
      sx={{
        width: '12vw',
        height: '100vh',
        backgroundColor: "#13293D",
        color: "#fff",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          מערכת חט'כים
        </Typography>
      </Box>

      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.path}
            button
            onClick={() => navigate(item.path)}
            sx={{
              "&:hover": {
                backgroundColor: "#0F1F2E", // darker shade
              },
            }}
          >
            <ListItemIcon sx={{ color: "#fff" }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
