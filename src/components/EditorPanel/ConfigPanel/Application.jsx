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
import { inject, observer } from 'mobx-react';
import { Checkbox } from '@blueprintjs/core';

@inject(allStores => ({
  store: allStores.store,
  config: allStores.config
}))
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

  render() {
    console.log(this.props.config.settings);
    return (
      <div className="formContentWrapper">
        <div className="form-row">
          <label htmlFor="telemetryEnabled">Send Telemetry Data to dbKoda</label>
          <Checkbox type="text" id="telemetryEnabled" checked={this.props.config.settings.telemetryEnabled} onChange={this.onCheckboxToggle} />
        </div>
      </div>
    );
  }
}
