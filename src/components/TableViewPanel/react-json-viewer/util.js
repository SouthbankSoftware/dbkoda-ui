/*
 * dbKoda - a modern, open source code editor, for MongoDB.
 * Copyright (C) 2017-2018 Southbank Software
 *
 * This file is part of dbKoda.
 *
 * dbKoda is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * dbKoda is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with dbKoda.  If not, see <http://www.gnu.org/licenses/>.
 */

const loopObject = function loopObject(obj, cb, sorted) {
  const keys = Object.keys(obj);
  if (sorted === true) {
    keys.sort();
  }
  return keys.map(key => {
    return cb(obj[key], key);
  });
};
const getSortedKeyString = function getSortedKeyString(obj) {
  return Object.keys(obj)
    .sort()
    .join(',');
};
const getType = function(val) {
  return Object.prototype.toString.call(val).replace(/^\[object\s(.*)\]$/, '$1');
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
  if (getType(obj) === 'Array' && obj.length > 1 && getType(getFirstEle(obj)) === 'Object') {
    const test = loopObject(obj, row => {
      if (getType(row) === 'Object') {
        return getSortedKeyString(row);
      }
      return '';
    });
    if (test.length > 1 && test[0].length > 1) {
      return allValuesSameInArray(test);
    }
    return false;
  }
  return false;
};
const checkIfObjectIsOOB = function checkIfObjectIsOOB(obj) {
  if (
    getType(obj) === 'Object' &&
    Object.keys(obj).length > 1 &&
    getType(getFirstEle(obj)) === 'Object'
  ) {
    const test = loopObject(obj, row => {
      if (getType(row) === 'Object') {
        return getSortedKeyString(row);
      }
      return '';
    });
    if (test.length > 1 && test[0].length > 1) {
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
  checkIfObjectIsOOB
};
