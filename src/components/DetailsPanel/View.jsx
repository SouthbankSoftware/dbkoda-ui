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
 * @Date:   2017-05-22T14:42:47+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-08-15T10:45:12+10:00
 */


import React from 'react';
import { action } from 'mobx';
import { observer, inject } from 'mobx-react';
import TableField from './Components/TableField';
import BarChartField from './Components/BarChartField';
import PieChartField from './Components/PieChartField';

import './View.scss';

@inject('store')
@observer
export default class DetailsView extends React.Component {
  @action.bound
  close(e) {
    e.preventDefault();
  }
  render() {
    const { title, viewInfo } = this.props;
    const detailsFields = [];
    const fldGroups = {};
    if (viewInfo && viewInfo.fields.length > 0) {
      for (const field of viewInfo.fields) {
        if (viewInfo.values[field.name]) {
          const fieldData = viewInfo.values[field.name];
          let fld;
          if (field.type == 'Table') {
            fld = (<TableField key={field.name} field={field} data={fieldData} />);
          } else if (field.type == 'BarChart') {
            fld = (<BarChartField key={field.name} field={field} data={fieldData} />);
          } else if (field.type == 'PieChart') {
            fld = (<PieChartField key={field.name} field={field} data={fieldData} />);
          }

          if (field.groupBy) {
            if (fldGroups[field.groupBy]) {
              fldGroups[field.groupBy].push(fld);
            } else {
              fldGroups[field.groupBy] = [];
              fldGroups[field.groupBy].push(fld);
              const grpDiv = (<div style={field.width && { width: field.width }}>{fldGroups[field.groupBy]}</div>);
              detailsFields.push(grpDiv);
            }
          } else {
            detailsFields.push(fld);
          }
        }
      }
    }
    return (
      <div className="pt-dark ">
        <p className="details-title">{title}</p>
        <div className="details-fields">
          {detailsFields}
        </div>
        {/* <div className="form-button-panel">
          <button
            className="pt-button pt-intent-primary right-button"
            onClick={this.close}
          >
            Close
          </button>
        </div> */}
      </div>
    );
  }
}
