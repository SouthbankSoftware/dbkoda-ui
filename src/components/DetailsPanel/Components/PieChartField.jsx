/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-05-24T15:20:50+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-06-01T11:12:50+10:00
 */

import React from 'react';
import { observer } from 'mobx-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default observer(({
  field,
  data
}) => {
  console.log('BarChartField field:', field);
  console.log('BarChartField data:', data);
  const COLORS = [
    '#77173E',
    '#0D657C',
    '#607747',
    '#413456',
    '#823C1D',
    '#5D3750',
    '#107BA3',
    '#A01B4C',
    '#1E282D',
    '#465061',
    '#1E423C',
    '#701535'
  ];

  if (!field.height) {
    field.height = 300;
  }

  return (
    <div
      className="div-field-container"
      style={field.width && { width: (field.groupBy ? '100%' : field.width) }}
    >
      <label htmlFor={field.name} className="pt-label pt-label-field">
        {field.label}
      </label>
      <ResponsiveContainer width="100%" height={field.height}>
        <PieChart>
          <Pie
            outerRadius="60%"
            data={data}
            paddingAngle={5}
            label
          >
            {data.map((entry, index) => (
              <Cell fill={COLORS[index % COLORS.length]} strokeWidth={0} />
            ))}
          </Pie>

          <Tooltip />
          <Legend iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});
