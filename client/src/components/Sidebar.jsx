import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, List, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material";
import useUser from "../contexts/UserContext";


export default function Sidebar() {
  const navigate = useNavigate();
  const [user] = useUser();

  const menuItems = [
    {
      label: "חטכים",
      path: "/hataks",
      icon: "🔧",
      roles: [], // visible to these roles
    },
    {
      label: "מכלול",
      path: "/michlol",
      icon: "🧩",
      roles: ["admin", "manoiya"], // admin + מנויעה only
    },
    {
      label: "חטכים למחיקה",
      path: "/hataks-to-delete",
      icon: "🗑️",
      roles: ["admin"], // admin only (pending deletions)
    },
    {
      label: "BI",
      path: "/bi",
      icon: "📊",
      roles: [],
    },
    {
      label: "ניהול משתמשים",
      path: "/users",
      icon: "👤",
      roles: ["admin"], // admin only
    },
    {
      label: "כללי החלפה",
      path: "/switch-rules",
      icon: "🔄",
      roles: ["admin"], // admin only
    },
  ];

  const visibleItems = menuItems.filter(item => {
    // No roles defined → public
    if (!item.roles ||  item.roles.length === 0) return true;

    // Not logged in
    if (!user?.roles) return false;

    // At least one role matches
    return item.roles.some(role => user.roles.includes(role));
  });

  return (
    <Box
      sx={{
        width: "12vw",
        height: "100vh",
        backgroundColor: "#13293D",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          מערכת חט'כים
        </Typography>
      </Box>

      <List sx={{ flexGrow: 1 }}>
        {visibleItems.map(item => (
          <ListItem
            key={item.path}
            button
            onClick={() => navigate(item.path)}
            sx={{
              "&:hover": {
                backgroundColor: "#0F1F2E",
              },
            }}
          >
            <ListItemIcon sx={{ color: "#fff" }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
