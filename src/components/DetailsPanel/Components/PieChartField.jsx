/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-05-24T15:20:50+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-29T14:00:48+10:00
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
    '#6B1635',
    '#105970',
    '#556C3F',
    '#3A2E4B',
    '#77341B',
    '#523147',
    '#465061',
    '#1E282D',
    '#1E423C',
    '#701535'
  ];

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
