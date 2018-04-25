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
 * @Date:   2017-05-24T15:20:50+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-06-13T14:05:23+10:00
 */

import React from 'react';
import { observer } from 'mobx-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default observer(({ field, data }) => {
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
      style={field.width && { width: field.groupBy ? '100%' : field.width }}
    >
      <label htmlFor={field.name} className="pt-label pt-label-field">
        {field.label}
      </label>
      <ResponsiveContainer width="100%" height={field.height}>
        <PieChart>
          <Pie outerRadius="60%" data={data} paddingAngle={5} label>
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
