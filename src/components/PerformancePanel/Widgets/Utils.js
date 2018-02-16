/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-02-15T15:05:45+11:00
 * @Email:  inbox.wahaj@gmail.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-02-16T14:55:25+11:00
 *
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

function timescale(num, a, b) {
  if (isNaN(num)) {
    throw new TypeError('expected a number');
  }
  return num * unitTimeValue(a) / unitTimeValue(b);
}

function unitTimeValue(name) {
  switch (name) {
    case 'ns':
      return 1;
    case 'μs':
    case 'us':
      return 1e3;
    case 'ms':
      return 1e6;
    case 's':
      return 1e9;
    case 'm':
      return 6e10;
    case 'h':
      return 36e11;
    case 'd':
      return 864e11;
    case 'w':
      return 6048e11;
    default: {
      throw new Error('"' + name + '" is not a valid unit of time.');
    }
  }
}
export const convertTime = (value, unit, length) => {
  const result = {
    value,
    unit
  };
  if (String(Math.round(value)).length > length) {
    switch (unit) {
      case '/μs':
        result.unit = '/ms';
        result.value = timescale(value, 'μs', 'ms').toFixed(2);
        break;
      case '/ms':
        result.unit = '/s';
        result.value = timescale(value, 'ms', 's').toFixed(2);
        break;
      case '/s':
        result.unit = '/m';
        result.value = timescale(value, 's', 'm').toFixed(2);
        break;
      case '/m':
        result.unit = '/h';
        result.value = timescale(value, 'm', 'h').toFixed(2);
        break;
      case '/h':
        result.unit = '/d';
        result.value = timescale(value, 'h', 'd').toFixed(2);
        break;
      case 'μs/s':
        result.unit = 'ms/s';
        result.value = timescale(value, 'μs', 'ms').toFixed(2);
        break;
      case 'ms/s':
        result.unit = 's/s';
        result.value = timescale(value, 'ms', 's').toFixed(2);
        break;
      default: {
        console.error('"' + unit + '" is not a valid unit of time.');
        return result;
      }
    }
    return convertTime(result.value, result.unit, length);
  }
  result.value = parseFloat(Number(value).toFixed(2));
  return result;
};

export const convertBytes = (value, unit, length) => {
  const result = {
    value,
    unit
  };
  if (String(Math.round(value)).length > length) {
    switch (unit) {
      case 'b':
        result.unit = 'kb';
        break;
      case 'kb':
        result.unit = 'mb';
        break;
      case 'mb':
        result.unit = 'gb';
        break;
      case 'gb':
        result.unit = 'tb';
        break;
      case 'tb':
        result.unit = 'pb';
        break;
      case 'pb':
        result.unit = 'eb';
        break;
      default: {
        console.error('"' + unit + '" is the maximum supported unit of bytes.');
        return result;
      }
    }
    result.value = (value / 1024).toFixed(2);
    return convertBytes(result.value, result.unit, length);
  }
  return result;
};

export const convertUnits = (value, unit, length) => {
  if ('ms/s|μs/s|/μs|/us|/ms|/s|/m|/h'.indexOf(unit) >= 0) {
    return convertTime(value, unit, length);
  } else if ('b|kb|mb|gb|tb|pb|eb'.indexOf(unit) >= 0) {
    return convertBytes(value, unit, length);
  }
  console.log('Unknown unit is provided for conversion (unit=', unit, ').');
  return {
    value: parseFloat(Number(value).toFixed(2)),
    unit
  };
};

export const hofUnitFormatter = (unit, length) => {
  const unitFormatter = (value) => {
    const result = convertUnits(value, unit, length);
    return result.value + ' ' + result.unit;
  };
  return unitFormatter;
};
