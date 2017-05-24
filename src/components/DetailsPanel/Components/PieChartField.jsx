/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-05-24T15:20:50+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-24T16:32:20+10:00
 */

import React from 'react';
import { observer } from 'mobx-react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export default observer(({
  field,
  data
}) => {
  console.log('BarChartField field:', field);
  console.log('BarChartField data:', data);
  const COLORS = ['#6B203D', '#2B647A', '#76341C', '#382F4B'];

  return (
    <div className="div-field-container">
      <label htmlFor={field.name} className="pt-label pt-label-field">
        {field.label}
      </label>
      <PieChart width={field.width} height={field.height}>
        <Pie
          cx={field.width / 2}
          cy={field.height / 2}
          outerRadius={field.width/3}
          data={data}
          paddingAngle={5}
          label
        >
          {data.map((entry, index) => (
            <Cell fill={COLORS[index % COLORS.length]} strokeWidth={0} />
          ))}
        </Pie>

        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
});
