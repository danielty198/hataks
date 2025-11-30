import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
} from "@mui/material";

export default function Sidebar() {
  const navigate = useNavigate();

  // 🔵 Sidebar configuration object
  const menuItems = [
    { label: "תיקונים", path: "/repairs", icon: "🔧" },
    { label: "חט'כים", path: "/hataks", icon: "⚙️" },
    { label: "bi", path: "/bi", icon: "📊" },
  ];

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
          מערכת חט'כים
        </Typography>
      </Box>

      <List>
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
    </Drawer>
  );
}
