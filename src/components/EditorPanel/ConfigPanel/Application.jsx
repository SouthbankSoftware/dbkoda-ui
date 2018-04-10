/**
 * @Author: chris
 * @Date:   2017-09-27T10:39:11+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-03-15T10:25:39+11:00
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

import _ from 'lodash';
import React from 'react';
import { observer } from 'mobx-react';
import { Checkbox } from '@blueprintjs/core';

@observer
export default class Application extends React.Component {
  constructor(props) {
    super(props);
    this.onCheckboxToggle = this.onCheckboxToggle.bind(this);
  }

  onCheckboxToggle(e) {
    const fieldValue = e.target.checked;
    const fieldName = e.target.id;
    this.props.updateValue(fieldName, fieldValue);
  }

  onNumericalInputChange = e => {
    const fieldName = e.target.id;
    const rawValue = e.target.value;
    let fieldValue;

    if (rawValue === '') {
      fieldValue = rawValue;
    } else {
      fieldValue = Number(rawValue);

      if (_.isNaN(fieldValue)) {
        fieldValue = rawValue;
      }
    }

    this.props.updateValue(fieldName, fieldValue);
  };

  render() {
    return (
      <div className="formContentWrapper ApplicationPreferences">
        <div className="sectionHeader">General</div>
        <div className="form-row">
          {this.props.renderFieldLabel('telemetryEnabled')}
          <Checkbox
            type="text"
            id="telemetryEnabled"
            checked={this.props.settings.telemetryEnabled}
            onChange={this.onCheckboxToggle}
          />
        </div>
        <div className="form-row">
          {this.props.renderFieldLabel('tableOutputDefault')}
          <Checkbox
            type="text"
            id="tableOutputDefault"
            checked={this.props.settings.tableOutputDefault}
            onChange={this.onCheckboxToggle}
          />
        </div>
        <div className="sectionHeader">Performance Panel</div>
        <div className="form-row">
          {this.props.renderFieldLabel('showNewFeaturesDialogOnStart')}
          <Checkbox
            type="text"
            id="showNewFeaturesDialogOnStart"
            checked={this.props.settings.showNewFeaturesDialogOnStart}
            onChange={this.onCheckboxToggle}
          />
        </div>
      </div>
    );
  }
}
