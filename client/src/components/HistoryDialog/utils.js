import { statusTranslations, fieldTranslations } from './constants';

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
  if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) return 'ריק';
  if (typeof value === 'boolean') return value ? 'כן' : 'לא';
  if (field === 'price') return `₪${value}`;
  if (field === 'status' && statusTranslations[value]) return statusTranslations[value];
  if (Array.isArray(value)) return value.join(', ');
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

// Extract all available filter options from history data
export const getAvailableFilterOptions = (historyData, distinctValues = {}) => {
  const options = {
    date: [],
    changedBy: new Set(),
    changedField: new Set(),
    manoiya: new Set(),
    hatakType: new Set(),
    sendingDivision: new Set(),
    sendingBrigade: new Set(),
    sendingBattalion: new Set(),
    hatakStatus: new Set(),
    tipulType: new Set(),
    recivingDivision: new Set(),
    recivingBrigade: new Set(),
    recivingBattalion: new Set(),
    forManoiya: new Set(),
    performenceExpectation: new Set(),
    intended: new Set(),
    engineSerial: new Set(),
    minseretSerial: new Set(),
    zadik: new Set(),
  };

  // Date options - unique dates formatted nicely
  const dateMap = new Map();
  
  historyData.forEach((item) => {
    // Date
    const dateKey = new Date(item.createdAt).toDateString();
    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, formatDateOption(item.createdAt));
    }

    // Changed by
    if (item.changedBy) {
      options.changedBy.add(item.changedBy);
    }

    // Changed fields
    if (item.changes && Array.isArray(item.changes)) {
      item.changes.forEach((change) => {
        if (change.field) {
          const fieldLabel = fieldTranslations[change.field] || change.field;
          options.changedField.add(fieldLabel);
        }
      });
    }

    // Extract values from newRepair or oldRepair
    const repairData = item.newRepair || item.oldRepair || {};
    
    // Add values from repair data
    const fieldsToExtract = [
      'manoiya', 'hatakType', 'sendingDivision', 'sendingBrigade', 'sendingBattalion',
      'hatakStatus', 'tipulType', 'recivingDivision', 'recivingBrigade', 'recivingBattalion',
      'forManoiya', 'performenceExpectation', 'intended', 'engineSerial', 'minseretSerial', 'zadik'
    ];

    fieldsToExtract.forEach((field) => {
      const value = repairData[field];
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach((v) => options[field]?.add(v));
        } else {
          options[field]?.add(String(value));
        }
      }
    });

    // Also extract from changes (newValue and oldValue)
    if (item.changes && Array.isArray(item.changes)) {
      item.changes.forEach((change) => {
        if (fieldsToExtract.includes(change.field)) {
          if (change.newValue !== null && change.newValue !== undefined && change.newValue !== '') {
            if (Array.isArray(change.newValue)) {
              change.newValue.forEach((v) => options[change.field]?.add(v));
            } else {
              options[change.field]?.add(String(change.newValue));
            }
          }
          if (change.oldValue !== null && change.oldValue !== undefined && change.oldValue !== '') {
            if (Array.isArray(change.oldValue)) {
              change.oldValue.forEach((v) => options[change.field]?.add(v));
            } else {
              options[change.field]?.add(String(change.oldValue));
            }
          }
        }
      });
    }
  });

  // Add values from distinctValues context for specific fields
  const fieldsFromContext = [
    'sendingBrigade', 'sendingBattalion', 'engineSerial', 
    'minseretSerial', 'recivingBrigade', 'recivingBattalion'
  ];
  
  fieldsFromContext.forEach((field) => {
    if (distinctValues[field] && Array.isArray(distinctValues[field])) {
      distinctValues[field].forEach((value) => {
        if (value !== null && value !== undefined && value !== '') {
          options[field]?.add(String(value));
        }
      });
    }
  });

  // Convert date map to array
  options.date = Array.from(dateMap.entries()).map(([key, label]) => label);

  // Convert sets to sorted arrays
  const result = {};
  Object.keys(options).forEach((key) => {
    if (options[key] instanceof Set) {
      result[key] = Array.from(options[key]).sort((a, b) => a.localeCompare(b, 'he'));
    } else {
      result[key] = options[key];
    }
  });

  return result;
};

// Initialize empty filters object
export const getInitialFilters = () => ({
  date: [],
  changedBy: [],
  changedField: [],
  manoiya: [],
  hatakType: [],
  sendingDivision: [],
  sendingBrigade: [],
  sendingBattalion: [],
  hatakStatus: [],
  tipulType: [],
  recivingDivision: [],
  recivingBrigade: [],
  recivingBattalion: [],
  forManoiya: [],
  performenceExpectation: [],
  intended: [],
  engineSerial: [],
  minseretSerial: [],
  zadik: [],
});

// Filter history by all selected filters (multi-select)
export const filterHistory = (historyData, filters) => {
  return historyData.filter((item) => {
    // Date filter
    if (filters.date && filters.date.length > 0) {
      const itemDate = formatDateOption(item.createdAt);
      if (!filters.date.includes(itemDate)) {
        return false;
      }
    }

    // Changed by filter
    if (filters.changedBy && filters.changedBy.length > 0) {
      if (!filters.changedBy.includes(item.changedBy)) {
        return false;
      }
    }

    // Changed field filter
    if (filters.changedField && filters.changedField.length > 0) {
      const itemChangedFields = (item.changes || []).map(
        (c) => fieldTranslations[c.field] || c.field
      );
      const hasMatchingField = filters.changedField.some((f) =>
        itemChangedFields.includes(f)
      );
      if (!hasMatchingField) {
        return false;
      }
    }

    // Property-based filters - check in newRepair, oldRepair, and changes
    const repairData = item.newRepair || item.oldRepair || {};
    const changes = item.changes || [];

    const propertyFields = [
      'manoiya', 'hatakType', 'sendingDivision', 'sendingBrigade', 'sendingBattalion',
      'hatakStatus', 'tipulType', 'recivingDivision', 'recivingBrigade', 'recivingBattalion',
      'forManoiya', 'performenceExpectation', 'intended', 'engineSerial', 'minseretSerial', 'zadik'
    ];

    for (const field of propertyFields) {
      if (filters[field] && filters[field].length > 0) {
        // Get value from repair data
        let value = repairData[field];
        
        // Also check in changes
        const changeForField = changes.find((c) => c.field === field);
        const newValue = changeForField?.newValue;
        const oldValue = changeForField?.oldValue;

        // Collect all possible values for this field
        const allValues = new Set();
        
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            value.forEach((v) => allValues.add(String(v)));
          } else {
            allValues.add(String(value));
          }
        }
        
        if (newValue !== null && newValue !== undefined && newValue !== '') {
          if (Array.isArray(newValue)) {
            newValue.forEach((v) => allValues.add(String(v)));
          } else {
            allValues.add(String(newValue));
          }
        }
        
        if (oldValue !== null && oldValue !== undefined && oldValue !== '') {
          if (Array.isArray(oldValue)) {
            oldValue.forEach((v) => allValues.add(String(v)));
          } else {
            allValues.add(String(oldValue));
          }
        }

        // Check if any of the filter values match
        const hasMatch = filters[field].some((filterValue) => allValues.has(filterValue));
        if (!hasMatch) {
          return false;
        }
      }
    }

    return true;
  });
};

// Legacy function - keep for backward compatibility
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

// Check if any filters are active
export const hasActiveFilters = (filters) => {
  return Object.values(filters).some(
    (val) => Array.isArray(val) && val.length > 0
  );
};
