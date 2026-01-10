const randomFromArray = (arr) =>
  arr[Math.floor(Math.random() * arr.length)];

const randomBool = () => Math.random() > 0.5;

const randomDate = (start = new Date(2022, 0, 1), end = new Date()) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const randomSerial = (prefix = 'ENG') =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

module.exports = {
  randomFromArray,
  randomBool,
  randomDate,
  randomSerial,
};
