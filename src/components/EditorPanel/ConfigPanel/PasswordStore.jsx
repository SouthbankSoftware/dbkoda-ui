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
 * @Author: christrott
 * @Date:   2017-02-06T11:51:13+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   christrott
 * @Last modified time: 2017-02-06T11:53:52+11:00
 */

import React from 'react';
import { inject, observer } from 'mobx-react';
import { Checkbox } from '@blueprintjs/core';

@inject(allStores => ({
  store: allStores.store,
  api: allStores.api
}))
@observer
export default class PasswordStore extends React.Component {
  constructor(props) {
    super(props);
    this.onCheckboxToggle = this.onCheckboxToggle.bind(this);
  }

  onCheckboxToggle(e) {
    const fieldValue = e.target.checked;
    const fieldName = e.target.id;
    this.props.updateValue(fieldName, fieldValue);
    if (fieldValue === true) {
      this.props.api.passwordApi.showPasswordDialog(true);
    }
  }

  render() {
    return (
      <div className="formContentWrapper">
        <div className="form-row">
          { this.props.renderFieldLabel('passwordStoreEnabled') }
          <Checkbox
            type="text"
            id="passwordStoreEnabled"
            checked={this.props.settings.passwordStoreEnabled}
            onChange={this.onCheckboxToggle}
           />
        </div>
      </div>
    );
  }
}
