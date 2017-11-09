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
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-05-24T12:51:28+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-31T14:21:24+10:00
 */

import React from 'react';
import { observer } from 'mobx-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default observer(({ field, data }) => {
  const COLORS = [
    '#413456',
    '#823C1D',
    '#5D3750',
    '#77173E',
    '#0D657C',
    '#607747',
    '#107BA3',
    '#A01B4C',
    '#1E282D',
    '#465061',
    '#1E423C',
    '#701535',
  ];

  let chartBars = [];

  let calcBarSize = 0;
  let bCalcBarSize = false;
  if (!field.height) {
    bCalcBarSize = true;
  }

  if (field.groupBy) {
    const cat = field.groupBy;
    const val = field.XAxis.key;
    const newData = [];
    const hashData = {};
    let bars = [];
    for (const obj of data) {
      if (hashData[obj[cat[0]]]) {
        const dataObj = hashData[obj[cat[0]]];
        dataObj[obj[cat[1]]] = obj[val];
      } else {
        const newDO = {};
        newDO[cat[0]] = obj[cat[0]];
        newDO[obj[cat[1]]] = obj[val];
        hashData[obj[cat[0]]] = newDO;
        newData.push(newDO);
      }
      if (bars.indexOf(obj[cat[1]]) < 0) {
        bars.push(obj[cat[1]]);
      }
    }
    data = newData;
    bars = bars.sort();
    chartBars = bars.map((bar, index) => {
      if (bCalcBarSize) {
        calcBarSize += field.XAxis.barSize ? field.XAxis.barSize + 10 : 40;
      }
      return (
        <Bar
          dataKey={bar}
          name={bar}
          fill={COLORS[index % COLORS.length]}
          barSize={field.XAxis.barSize}
        />
      );
    });
  } else {
    chartBars = field.XAxis.map((bar, index) => {
      if (bCalcBarSize) {
        calcBarSize += bar.barSize ? bar.barSize + 10 : 40;
      }
      return (
        <Bar
          dataKey={bar.key}
          name={bar.label}
          fill={COLORS[index % COLORS.length]}
          barSize={bar.barSize}
        />
      );
    });
  }

  if (bCalcBarSize) {
    field.height = 60 + calcBarSize * data.length;
  }

  return (
    <div
      className="div-field-container"
      style={field.width && { width: field.groupBy ? '100%' : field.width }}
    >
      <label htmlFor={field.name} className="pt-label pt-label-field">
        {field.label}
      </label>
      <ResponsiveContainer width="100%" height={field.height}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
        >
          <XAxis type="number" />
          <YAxis
            dataKey={field.YAxis.key}
            width={field.YAxis.width ? field.YAxis.width : 60}
            type="category"
          />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend iconType="circle" />
          {chartBars}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});
