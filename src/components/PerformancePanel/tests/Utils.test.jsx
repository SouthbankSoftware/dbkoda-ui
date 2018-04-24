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

/**
 * @Author: Michael Harrison <mike>
 * @Date:   2017-03-14 15:54:01
 * @Email:  mike@southbanksoftware.com
 * @Last modified by:   mike
 * @Last modified time: 2017-03-14 15:54:27
 */

import chai, { assert } from 'chai';
import chaiEnzyme from 'chai-enzyme';
import globalizeInit from '#/tests/helpers/globalize.js';
import { convertUnits, convertToTarget, reduceName } from '../Widgets/Utils.js';

chai.use(chaiEnzyme());

describe('Test Performance Panel Util Class', () => {
  const testValues = [
    {
      input: { name: 'wtIO_metricAUsPs', value: 10000, unit: 'ms' },
      output: { name: 'metricA', value: 10, unit: 's' }
    },
    {
      input: { name: 'wtIO_metricB', value: 10000, unit: 'Op/s' },
      output: { name: 'metricB', value: 10, unit: 'KOp/s' }
    },
    {
      input: { name: 'metricCUsPs', value: 10000, unit: 'μs/s' },
      output: { name: 'metricC', value: 10, unit: 'ms/s' }
    },
    {
      input: { name: 'metricD', value: 10000, unit: 'b' },
      output: { name: 'metricD', value: 9.77, unit: 'kb' }
    }
  ];

  const targetedTestValues = [
    {
      input: { value: 10000, unit: 'μs', target: 's' },
      output: { value: 0.01, unit: 's' }
    },
    {
      input: { value: 100, unit: 'Op/s', target: 'KOp/s' },
      output: { value: 0.1, unit: 'KOp/s' }
    },
    {
      input: { value: 100000, unit: 'b', target: 'mb' },
      output: { value: 0.1, unit: 'mb' }
    }
  ];

  beforeAll(() => {
    globalizeInit();
  });

  test('Can convert metrics automatically', () => {
    testValues.forEach(value => {
      const newValue = convertUnits(value.input.value, value.input.unit, 3);
      assert.equal(newValue.value, value.output.value);
      assert.equal(newValue.unit, value.output.unit);
    });
  });

  test('Can convert to a specific metric.', () => {
    targetedTestValues.forEach(value => {
      const newValue = convertToTarget(value.input.value, value.input.unit, value.input.target, 3);
      assert.equal(newValue.value, value.output.value);
      assert.equal(newValue.unit, value.output.unit);
    });
  });

  test('Can reduce metric names correctly', () => {
    testValues.forEach(value => {
      const newName = reduceName(value.input.name);
      assert.equal(newName, value.output.name);
    });
  });
});
