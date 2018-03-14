/**
 * @Author: chris
 * @Date:   2017-09-27T10:39:11+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-03-15T01:00:19+11:00
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

  onTextInputChange = e => {
    const fieldName = e.target.id;
    // fieldValue is kept as string here so that controlled input can hv good UX. When patching,
    // config service will convert it to number
    const fieldValue = e.target.value;

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
        <div className="sectionHeader">Performance Panel</div>
        <div className="form-row">
          {this.props.renderFieldLabel('performancePanel.preventDisplaySleep')}
          <Checkbox
            type="text"
            id="performancePanel.preventDisplaySleep"
            checked={this.props.settings.performancePanel.preventDisplaySleep}
            onChange={this.onCheckboxToggle}
          />
        </div>
        <div className="form-row">
          {this.props.renderFieldLabel('performancePanel.metricSmoothingWindow')}
          <input
            type="text"
            id="performancePanel.metricSmoothingWindow"
            value={this.props.settings.performancePanel.metricSmoothingWindow}
            onChange={this.onTextInputChange}
          />
        </div>
        <div className="form-row">
          {this.props.renderFieldLabel('performancePanel.foregroundSamplingRate')}
          <input
            type="text"
            id="performancePanel.foregroundSamplingRate"
            value={this.props.settings.performancePanel.foregroundSamplingRate}
            onChange={this.onTextInputChange}
          />
        </div>
        <div className="form-row">
          {this.props.renderFieldLabel('performancePanel.backgroundSamplingRate')}
          <input
            type="text"
            id="performancePanel.backgroundSamplingRate"
            value={this.props.settings.performancePanel.backgroundSamplingRate}
            onChange={this.onTextInputChange}
          />
        </div>
        <div className="form-row">
          {this.props.renderFieldLabel('performancePanel.historySize')}
          <input
            type="text"
            id="performancePanel.historySize"
            value={this.props.settings.performancePanel.historySize}
            onChange={this.onTextInputChange}
          />
        </div>
        <div className="form-row">
          {this.props.renderFieldLabel('performancePanel.historyBrushSize')}
          <input
            type="text"
            id="performancePanel.historyBrushSize"
            value={this.props.settings.performancePanel.historyBrushSize}
            onChange={this.onTextInputChange}
          />
        </div>
        <div className="form-row">
          {this.props.renderFieldLabel('performancePanel.alarmDisplayingWindow')}
          <input
            type="text"
            id="performancePanel.alarmDisplayingWindow"
            value={this.props.settings.performancePanel.alarmDisplayingWindow}
            onChange={this.onTextInputChange}
          />
        </div>
      </div>
    );
  }
}
