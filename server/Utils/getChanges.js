// Treat null, undefined, '' and empty array as equivalent "empty"
function isEmpty(val) {
  if (val === null || val === undefined || val === "") return true;
  if (Array.isArray(val) && val.length === 0) return true;
  return false;
}

function getChanges(oldDoc, newDoc) {
  const changes = [];

  for (const key of Object.keys(newDoc)) {
    if (["updatedAt", "__v", "_id", "createdAt"].includes(key)) continue;

    const oldValue = oldDoc[key];
    const newValue = newDoc[key];

    // Handle arrays (like waitingHHType)
    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      const oldSorted = [...oldValue].sort().join(",");
      const newSorted = [...newValue].sort().join(",");
      // Skip if both empty or same
      if (oldSorted === newSorted) continue;
      changes.push({
        field: key,
        oldValue: oldValue,
        newValue: newValue,
      });
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

    // Handle primitives: skip when both are "empty" (null/undefined/'')
    if (isEmpty(oldValue) && isEmpty(newValue)) continue;
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
