/* @flow
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

import * as React from 'react';
import _ from 'lodash';
import { BarChart as RBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import styles from './BarChart.scss';

const COLOUR_PALETTE: string[] = _.values(styles);
const MARGIN = { top: 20, right: 20, left: 10, bottom: 30 };

export type ChartComponentName = 'x' | 'y' | 'center';
export type ChartComponent = {
  name: ChartComponentName,
  valueSchemaPath: string,
  valueType: 'string' | 'number',
  values?: string[],
};
type ChartDataElement = string | number | { [string]: number };
export type ChartData = { x: ChartDataElement, y: ChartDataElement }[];

type Props = {
  data: ChartData,
  componentX: ChartComponent,
  componentY: ChartComponent,
  componentCenter: ChartComponent,
  width: number,
  height: number,
};

export default class BarChart extends React.PureComponent<Props> {
  render() {
    const { data, componentX, componentY, componentCenter, width, height } = this.props;

    const centerDataKeyPrefix = componentX.valueType === 'string' ? 'y.' : 'x.';

    return (
      <div className="BarChart">
        <RBarChart
          width={width}
          height={height}
          data={data}
          margin={MARGIN}
          layout={componentX.valueType === 'string' ? 'horizontal' : 'vertical'}
        >
          {componentX.valueType === 'string'
            ? <XAxis type="category" dataKey="x" />
            : <XAxis type="number" />}
          {componentY.valueType === 'string'
            ? <YAxis type="category" dataKey="y" />
            : <YAxis type="number" />}
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend />
          <text
            textAnchor="middle"
            transform={`translate(20, ${height / 2 - 30})rotate(-90)`}
            fill="#666"
          >
            {componentY.valueSchemaPath}
          </text>
          <text
            textAnchor="middle"
            transform={`translate(${width / 2 - 10}, ${height - 10})`}
            fill="#666"
          >
            {componentX.valueSchemaPath}
          </text>
          {componentCenter.values &&
            _.map(componentCenter.values, (v, i) =>
              <Bar
                key={v}
                dataKey={`${centerDataKeyPrefix}${v}`}
                stackId="a"
                name={v}
                fill={COLOUR_PALETTE[i % COLOUR_PALETTE.length]}
                isAnimationActive={false}
              />,
            )}
        </RBarChart>
      </div>
    );
  }
}
