function getChanges(oldDoc, newDoc) {
  const changes = [];


  for (const key of Object.keys(newDoc)) {
    if (['updatedAt', '__v'].includes(key)) continue;

    if (
      oldDoc[key]?.toString?.() !== newDoc[key]?.toString?.()
    ) {
      changes.push({
        field: key,
        oldValue: oldDoc[key],
        newValue: newDoc[key],
      });
    }
  }

  return changes;
}


module.exports = {getChanges}