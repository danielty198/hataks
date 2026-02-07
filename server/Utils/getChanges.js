function getChanges(oldDoc, newDoc) {
  const changes = [];

  for (const key of Object.keys(newDoc)) {
    if (["updatedAt", "__v", "_id", "createdAt"].includes(key)) continue;

    const oldValue = oldDoc[key];
    const newValue = newDoc[key];

    // Handle arrays (like waitingHHType)
    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      // Sort and compare as strings
      const oldSorted = [...oldValue].sort().join(",");
      const newSorted = [...newValue].sort().join(",");

      if (oldSorted !== newSorted) {
        changes.push({
          field: key,
          oldValue: oldValue,
          newValue: newValue,
        });
      }
      continue;
    }

    // Handle dates
    if (oldValue instanceof Date && newValue instanceof Date) {
      if (oldValue.getTime() !== newValue.getTime()) {
        changes.push({
          field: key,
          oldValue: oldValue,
          newValue: newValue,
        });
      }
      continue;
    }

    // Handle objects (like addedBy)
    if (
      typeof oldValue === "object" &&
      typeof newValue === "object" &&
      oldValue !== null &&
      newValue !== null
    ) {
      const oldStr = JSON.stringify(oldValue);
      const newStr = JSON.stringify(newValue);
      if (oldStr !== newStr) {
        changes.push({
          field: key,
          oldValue: oldValue,
          newValue: newValue,
        });
      }
      continue;
    }

    // Handle primitives
    if (oldValue?.toString?.() !== newValue?.toString?.()) {
      changes.push({
        field: key,
        oldValue: oldValue,
        newValue: newValue,
      });
    }
  }

  return changes;
}

module.exports = { getChanges };
