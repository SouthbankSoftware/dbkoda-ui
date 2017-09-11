const ONE = 1;
const loopObject = function loopObject(obj, cb, sorted) {
  const keys = Object.keys(obj);
  if (sorted === true) {
    keys.sort();
  }
  return keys.map((key) => {
    return cb(obj[key], key);
  });
};
const getSortedKeyString = function getSortedKeyString(obj) {
  return Object.keys(obj)
    .sort()
    .join(',');
};
const getType = function(val) {
  return Object.prototype.toString
    .call(val)
    .replace(/^\[object\s(.*)\]$/, '$1');
};
const getFirstEle = function getFirstEle(obj) {
  return obj[Object.keys(obj)[0]];
};

const allValuesSameInArray = function(arr) {
  for (let i = 1; i < arr.length; i += 1) {
    if (arr[i] !== arr[0]) {
      return false;
    }
  }
  return true;
};

const checkIfArrayIsAOB = function checkIfArrayIsAOB(obj) {
  if (
    getType(obj) === 'Array' &&
    obj.length > ONE &&
    getType(getFirstEle(obj)) === 'Object'
  ) {
    const test = loopObject(obj, (row) => {
      if (getType(row) === 'Object') {
        return getSortedKeyString(row);
      }
      return '';
    });
    if (test.length > ONE && test[0].length > ONE) {
      return allValuesSameInArray(test);
    }
    return false;
  }
  return false;
};
const checkIfObjectIsOOB = function checkIfObjectIsOOB(obj) {
  if (
    getType(obj) === 'Object' &&
    Object.keys(obj).length > ONE &&
    getType(getFirstEle(obj)) === 'Object'
  ) {
    const test = loopObject(obj, (row) => {
      if (getType(row) === 'Object') {
        return getSortedKeyString(row);
      }
      return '';
    });
    if (test.length > ONE && test[0].length > ONE) {
      return allValuesSameInArray(test);
    }
    return false;
  }
  return false;
};

module.exports = {
  loopObject,
  getSortedKeyString,
  getType,
  getFirstEle,
  allValuesSameInArray,
  checkIfArrayIsAOB,
  checkIfObjectIsOOB,
};
