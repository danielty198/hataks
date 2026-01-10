import { hatakStatusOptions } from '../../assets';

// Pastel colors for statuses
export const PASTEL_COLORS = [
  '#a8e6cf', // mint green
  '#dcedc1', // light green
  '#ffd3a5', // peach
  '#ffaaa5', // salmon
  '#ff8b94', // pink
  '#b5ead7', // seafoam
  '#c7ceea', // lavender
  '#ffeaa7', // light yellow
  '#dfe6e9', // light gray
  '#fab1a0', // light coral
  '#74b9ff', // light blue
  '#a29bfe', // light purple
  '#fd79a8', // pink
  '#e17055', // terra cotta
  '#00b894', // green
];

// Create color map for statuses
export const getStatusColorMap = () => {
  const colorMap = {};
  hatakStatusOptions.forEach((status, index) => {
    colorMap[status] = PASTEL_COLORS[index % PASTEL_COLORS.length];
  });
  return colorMap;
};

export const STATUS_COLOR_MAP = getStatusColorMap();
