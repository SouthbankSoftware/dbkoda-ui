/**
 * @flow
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-02-15T15:05:45+11:00
 * @Email:  inbox.wahaj@gmail.com
 * @Last modified by:   mike
 * @Last modified time: 2018-02-19T14:55:25+11:00
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

import _ from 'lodash';

function timescale(num: number, a, b) {
  if (isNaN(num)) {
    throw new TypeError('expected a number');
  }
  if (unitTimeValue(a) > unitTimeValue(b)) {
    return num / (unitTimeValue(a) / unitTimeValue(b));
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
export const convertTime = (value: any, unit: string, length: number) => {
  const result = {
    value,
    unit
  };
  if (String(Math.round(value)).length > length) {
    switch (unit) {
      case '/μs':
        result.unit = '/ms';
        result.value = timescale(value, 'μs', 'ms');
        break;
      case '/ms':
        result.unit = '/s';
        result.value = timescale(value, 'ms', 's');
        break;
      case '/s':
        result.unit = 'k/s';
        result.value /= 1000;
        break;
      case 'k/s':
        result.unit = 'M/s';
        result.value /= 1000;
        break;
      case 'μs/s':
        result.unit = 'ms/s';
        result.value = timescale(value, 'μs', 'ms');
        break;
      case 'ms/s':
        result.unit = 's/s';
        result.value = timescale(value, 'ms', 's');
        break;
      case 'Op/s':
        result.unit = 'KOp/s';
        result.value /= 1000;
        break;
      case 'KOp/ss':
        result.unit = 'MOp/μs';
        result.value /= 1000;
        break;
      case 'pages/s':
        result.unit = 'Kpages/s';
        result.value /= 1000;
        break;
      case 'Kpages/s':
        result.unit = 'Mpages/s';
        result.value /= 1000;
        break;
      case 'μs':
        result.unit = 'ms';
        result.value = timescale(value, 'μs', 'ms');
        break;
      case 'ms':
        result.unit = 's';
        result.value = timescale(value, 'ms', 's');
        break;
      case 's':
        result.unit = 'm';
        result.value = timescale(value, 's', 'm');
        break;
      case 'm':
        result.unit = 'h';
        result.value = timescale(value, 'm', 'h');
        break;
      case ' ':
        result.unit = 'k';
        result.value /= 1000;
        break;
      case 'k':
        result.unit = 'M';
        result.value /= 1000;
        break;
      default: {
        console.error('"' + unit + '" is not a valid unit of time.');
        return result;
      }
    }
    return convertTime(result.value, result.unit, length);
  }
  result.value = _.round(parseFloat(Number(value)), 2);
  return result;
};

export const convertBytes = (value: any, unit: string, length: number) => {
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
      case 'b/s':
        result.unit = 'kb/s';
        break;
      case 'kb/s':
        result.unit = 'mb/s';
        break;
      case 'mb/s':
        result.unit = 'gb/s';
        break;
      case 'gb/s':
        result.unit = 'tb/s';
        break;
      default: {
        console.error('"' + unit + '" is the maximum supported unit of bytes.');
        return result;
      }
    }

    result.value = parseFloat(value) / 1024;
    return convertBytes(result.value, result.unit, length);
  }
  result.value = _.round(parseFloat(value), 2);
  return result;
};

export const convertUnits = (value: any, unit: string, length: number) => {
  if (
    's|ms|μs|ms/s|μs/s|/μs|/us|/ms|/s|/m|/h|Op/s|KOp/s|MOp/s|pages/s|Kpages/s|Mpages/s| |k'.indexOf(
      unit
    ) >= 0
  ) {
    return convertTime(value, unit, length);
  } else if ('b|kb|mb|gb|tb|pb|eb|b/s|kb/s|mb/s|gb/s|tb/s'.indexOf(unit) >= 0) {
    return convertBytes(value, unit, length);
  } else if ('%'.indexOf(unit) >= 0) {
    return {
      value: parseFloat(_.round(Number(value), 2)),
      unit
    };
  }
  console.log('Unknown unit is provided for conversion (unit=', unit, ').');
  return {
    value: parseFloat(_.round(Number(value), 2)),
    unit
  };
};

export const hofUnitFormatter = (unit: string, length: number) => {
  // $FlowFixMe
  const unitFormatter = value => {
    const result = convertUnits(value, unit, length);
    return result.value + ' ' + result.unit;
  };
  return unitFormatter;
};

export const bytesToSize = (bytes: number) => {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes <= 0) return '0 B';
  const i = _.round(
    parseFloat(Math.floor(Math.log(bytes) / Math.log(1024))),
    2
  );
  if (i < 0) {
    return '0B';
  }
  return _.round(bytes / 1024 ** i, 1) + '' + sizes[i];
};

export const convertTimeToTarget = (
  value: any,
  unit: string,
  targetUnit: string,
  length: number
) => {
  const result = {
    value,
    unit
  };
  if (String(Math.round(value)).length > length || unit != targetUnit) {
    switch (unit) {
      case '/μs':
        result.unit = '/ms';
        result.value = timescale(value, 'μs', 'ms');
        break;
      case '/ms':
        result.unit = '/s';
        result.value = timescale(value, 'ms', 's');
        break;
      case '/s':
        result.unit = 'k/s';
        result.value /= 1000;
        break;
      case 'k/s':
        result.unit = 'M/s';
        result.value /= 1000;
        break;
      case 'μs/s':
        result.unit = 'ms/s';
        result.value = timescale(value, 'μs', 'ms');
        break;
      case 'ms/s':
        result.unit = 's/s';
        result.value = timescale(value, 'ms', 's');
        break;
      case 'Op/s':
        result.unit = 'KOp/s';
        result.value /= 1000;
        break;
      case 'KOp/ss':
        result.unit = 'MOp/μs';
        result.value /= 1000;
        break;
      case 'pages/s':
        result.unit = 'Kpages/s';
        result.value /= 1000;
        break;
      case 'Kpages/s':
        result.unit = 'Mpages/s';
        result.value /= 1000;
        break;
      case 'μs':
        result.unit = 'ms';
        result.value = timescale(value, 'μs', 'ms');
        break;
      case 'ms':
        result.unit = 's';
        result.value = timescale(value, 'ms', 's');
        break;
      case ' ':
        result.unit = 'k';
        result.value /= 1000;
        break;
      case 'k':
        result.unit = 'M';
        result.value /= 1000;
        break;
      default: {
        console.error('"' + unit + '" is not a valid unit of time.');
        return result;
      }
    }
    return convertTimeToTarget(result.value, result.unit, targetUnit, length);
  }
  result.value = _.round(parseFloat(Number(value)), 2);
  return result;
};

export const convertBytesToTarget = (
  value: any,
  unit: string,
  targetUnit: string,
  length: number
) => {
  const result = {
    value,
    unit
  };
  if (String(Math.round(value)).length > length || unit != targetUnit) {
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
      case 'b/s':
        result.unit = 'kb/s';
        break;
      case 'kb/s':
        result.unit = 'mb/s';
        break;
      case 'mb/s':
        result.unit = 'gb/s';
        break;
      case 'gb/s':
        result.unit = 'tb/s';
        break;
      default: {
        console.error('"' + unit + '" is the maximum supported unit of bytes.');
        return result;
      }
    }

    result.value = parseFloat(value) / 1024;
    return convertBytesToTarget(result.value, result.unit, targetUnit, length);
  }
  result.value = _.round(parseFloat(value), 2);
  return result;
};

export const convertToTarget = (
  value: any,
  unit: string,
  targetUnit: string,
  length: number
) => {
  // Check that unit and target unit matches:
  if (
    's|ms|μs|ms/s|μs/s|/μs|/us|/ms|/s|/m|/h|Op/s|KOp/s|MOp/s|pages/s|Kpages/s|Mpages/s| |k'.indexOf(
      unit
    ) >= 0 &&
    's|ms|μs|ms/s|μs/s|/μs|/us|/ms|/s|/m|/h|Op/s|KOp/s|MOp/s|pages/s|Kpages/s|Mpages/s| |k'.indexOf(
      targetUnit
    ) < 0
  ) {
    // Invalid
    console.log(
      'Unit (',
      unit,
      ') and target unit (',
      targetUnit,
      ') for conversion are not compatible.'
    );
    return {
      value: parseFloat(_.round(Number(value), 2)),
      unit
    };
  } else if (
    's|ms|μs|ms/s|μs/s|/μs|/us|/ms|/s|/m|/h|Op/s|KOp/s|MOp/s|pages/s|Kpages/s|Mpages/s| |k'.indexOf(
      targetUnit
    ) >= 0 &&
    'b|kb|mb|gb|tb|pb|eb|b/s|kb/s|mb/s|gb/s|tb/s'.indexOf(unit) >= 0
  ) {
    // Invalid
    console.log('Unit and target unit for conversion are not compatible.');
    return {
      value: parseFloat(_.round(Number(value), 2)),
      unit
    };
  }

  if (
    's|ms|μs|ms/s|μs/s|/μs|/us|/ms|/s|/m|/h|Op/s|KOp/s|MOp/s|pages/s|Kpages/s|Mpages/s| |k'.indexOf(
      unit
    ) >= 0
  ) {
    return convertTimeToTarget(value, unit, targetUnit, length);
  } else if ('b|kb|mb|gb|tb|pb|eb|b/s|kb/s|mb/s|gb/s|tb/s'.indexOf(unit) >= 0) {
    return convertBytesToTarget(value, unit, targetUnit, length);
  } else if ('%'.indexOf(unit) >= 0) {
    return {
      value: parseFloat(_.round(Number(value), 2)),
      unit
    };
  }
  console.log('Unknown unit is provided for conversion (unit=', unit, ').');
  return {
    value: parseFloat(_.round(Number(value), 2)),
    unit
  };
};

/**
 * Reduces the length of the name of a metric from the controller for user readability.
 * @param {string} name - Takes the name of a metric.
 * @returns {string} The reduced string.
 */
export const reduceName = (name: string) => {
  if (name.match('_')) {
    [, name] = name.split('_');
  }

  if (name.match(/UsPs$/g)) {
    name = name.substring(0, name.length - 4);
  } else if (name.match(/Us$|Ps$/g)) {
    name = name.substring(0, name.length - 2);
  }
  return name;
};
