// Returns a new object containing only the specified keys that exist in obj
const pick = (obj, keys) =>
  keys.reduce((acc, key) => {
    if (obj[key] !== undefined) acc[key] = obj[key];
    return acc;
  }, {});

module.exports = pick;
