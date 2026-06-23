function monthKeyFromDate(date) {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${d.getFullYear()}-${month}`;
}

module.exports = { monthKeyFromDate };
