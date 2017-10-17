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
 *
 *
 * @Author: chris
 * @Date:   2017-09-27T10:39:11+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-09-27T10:40:53+10:00
 */

import React from 'react';
import { observer } from 'mobx-react';

@observer
export default class Paths extends React.Component {
  constructor(props) {
    super(props);
    this.onPathEntered = this.onPathEntered.bind(this);
  }

  onPathEntered(e) {
    const fieldName = e.target.id;
    const fieldValue = e.target.value;
    this.props.updateValue(fieldName, fieldValue);
  }

  render() {
    return (
      <div className="formContentWrapper">
        <div className="form-row">
          <label htmlFor="mongoCmd">Mongo Path:</label>
          <input type="text" id="mongoCmd" value={this.props.settings.mongoCmd} onChange={this.onPathEntered} />
        </div>
        <div className="form-row">
          <label htmlFor="drillCmd">Drill Path: </label>
          <input type="text" id="drillCmd" value={this.props.settings.drillCmd} onChange={this.onPathEntered} />
        </div>
      </div>
    );
  }
}
