import { statusTranslations } from './constants';

// Get color based on change type
export const getChangeColor = (field, newValue) => {
  if (field === 'status') {
    switch (newValue) {
      case 'Completed':
      case 'הושלם':
        return 'success';
      case 'Cancelled':
      case 'בוטל':
        return 'error';
      case 'In Progress':
      case 'בטיפול':
        return 'info';
      default:
        return 'warning';
    }
  }
  return 'primary';
};

// Format value for display
export const formatValue = (value, field) => {
  if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0 )) return 'ריק';
  if (typeof value === 'boolean') return value ? 'כן' : 'לא';
  if (field === 'price') return `₪${value}`;
  if (field === 'status' && statusTranslations[value]) return statusTranslations[value];
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

// Format date for display
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Format time for display
export const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format date for select options
export const formatDateOption = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

// Get unique dates from history data
export const getAvailableDates = (historyData) => {
  const dates = new Map();
  historyData.forEach((item) => {
    const dateKey = new Date(item.createdAt).toDateString();
    if (!dates.has(dateKey)) {
      dates.set(dateKey, item.createdAt);
    }
  });
  return Array.from(dates.entries()).map(([key, value]) => ({
    key,
    value,
    label: formatDateOption(value),
  }));
};

// Filter history by selected date
export const filterHistoryByDate = (historyData, selectedDate) => {
  if (selectedDate === 'all') return historyData;
  return historyData.filter(
    (item) => new Date(item.createdAt).toDateString() === selectedDate
  );
};

// Group history by date
export const groupHistoryByDate = (filteredHistory) => {
  const groups = new Map();
  filteredHistory.forEach((item) => {
    const dateKey = new Date(item.createdAt).toDateString();
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey).push(item);
  });
  return Array.from(groups.entries()).sort(
    ([a], [b]) => new Date(b) - new Date(a)
  );
};
