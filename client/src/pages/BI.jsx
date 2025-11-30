import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";

// Colors for each category
const COLORS = {
  'ממתין ח"ח': "#8884d8",
  'בלאי עבודה': "#82ca9d",
  'מושבת': "#ffc658",
  'כשיר סבב': "#ff8042",
  'כשיר חוב': "#8dd1e1",
};

// Sample data for pies
const sampleData = [
  {
    id: 1,
    name: "Pie 1",
    data: [
      { name: 'ממתין ח"ח', value: 10 },
      { name: 'בלאי עבודה', value: 20 },
      { name: 'מושבת', value: 5 },
      { name: 'כשיר סבב', value: 15 },
      { name: 'כשיר חוב', value: 50 },
    ],
  },
  {
    id: 2,
    name: "Pie 2",
    data: [
      { name: 'ממתין ח"ח', value: 20 },
      { name: 'בלאי עבודה', value: 10 },
      { name: 'מושבת', value: 15 },
      { name: 'כשיר סבב', value: 30 },
      { name: 'כשיר חוב', value: 25 },
    ],
  },
  {
    id: 3,
    name: "Pie 3",
    data: [
      { name: 'ממתין ח"ח', value: 5 },
      { name: 'בלאי עבודה', value: 25 },
      { name: 'מושבת', value: 20 },
      { name: 'כשיר סבב', value: 15 },
      { name: 'כשיר חוב', value: 35 },
    ],
  },
  {
    id: 4,
    name: "Pie 4",
    data: [
      { name: 'ממתין ח"ח', value: 15 },
      { name: 'בלאי עבודה', value: 10 },
      { name: 'מושבת', value: 25 },
      { name: 'כשיר סבב', value: 30 },
      { name: 'כשיר חוב', value: 20 },
    ],
  },
  {
    id: 5,
    name: "Pie 5",
    data: [
      { name: 'ממתין ח"ח', value: 10 },
      { name: 'בלאי עבודה', value: 20 },
      { name: 'מושבת', value: 10 },
      { name: 'כשיר סבב', value: 40 },
      { name: 'כשיר חוב', value: 20 },
    ],
  },
];

export default function BI() {
  const [view, setView] = useState("pie");
  const [filter, setFilter] = useState("yes");

  return (
    <Box p={3}>
      {/* Top Buttons */}
      <ButtonGroup variant="contained" sx={{ mb: 2 }}>
        <Button
          color={view === "pie" ? "primary" : "inherit"}
          onClick={() => setView("pie")}
        >
          Pie
        </Button>
        <Button
          color={view === "table" ? "primary" : "inherit"}
          onClick={() => setView("table")}
        >
          Table
        </Button>
      </ButtonGroup>

      {/* Select filter */}
      <FormControl sx={{ ml: 3, minWidth: 120 }}>
        <InputLabel id="filter-label">Filter</InputLabel>
        <Select
          labelId="filter-label"
          value={filter}
          label="Filter"
          onChange={(e) => setFilter(e.target.value)}
        >
          <MenuItem value="yes">Yes</MenuItem>
          <MenuItem value="no">No</MenuItem>
          <MenuItem value="maybe">Maybe</MenuItem>
        </Select>
      </FormControl>

      {/* Legend on top */}
      <Box display="flex" gap={2} mt={3} mb={2}>
        {Object.entries(COLORS).map(([name, color]) => (
          <Box key={name} display="flex" alignItems="center" gap={0.5}>
            <Box width={20} height={20} bgcolor={color} borderRadius="4px" />
            <Typography>{name}</Typography>
          </Box>
        ))}
      </Box>

      {/* Pie charts */}
      {view === "pie" && (
        <Box
          display="flex"
          flexWrap="wrap"
          gap={4}
          justifyContent="space-between"
        >
          {sampleData.map((pie) => (
            <Box key={pie.id} width={250} height={250}>
              <Typography textAlign="center" mb={1}>
                {pie.name}
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pie.data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={40}
                    outerRadius={80}
                    label
                  >
                    {pie.data.map((entry) => (
                      <Cell key={entry.name} fill={COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
