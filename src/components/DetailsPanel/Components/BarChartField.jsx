/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-05-24T12:51:28+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-26T11:25:03+10:00
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
  Legend
} from 'recharts';

export default observer(({
  field,
  data
}) => {
  console.log('BarChartField field:', field);
  console.log('BarChartField data:', data);

  const chartBars = field.XAxis.map(bar =>
    <Bar dataKey={bar.key} name={bar.label} fill={bar.color} />
  );

  return (
    <div className="div-field-container">
      <label htmlFor={field.name} className="pt-label pt-label-field">
        {field.label}
      </label>
      <BarChart
        layout="vertical"
        width={field.width}
        height={field.height}
        data={data}
        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
      >
        <XAxis type="number" />
        <YAxis dataKey={field.YAxis.key} type="category" />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Legend iconType="circle" />
        {chartBars}
      </BarChart>
    </div>
  );
});
