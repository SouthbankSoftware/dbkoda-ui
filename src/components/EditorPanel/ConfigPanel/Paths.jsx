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
 * @Last modified time: 2017-10-17T14:46:50+11:00
 */

import React from 'react';
import { observer } from 'mobx-react';
import { Button } from '@blueprintjs/core';
import path from 'path';

const { dialog, BrowserWindow } = IS_ELECTRON
  ? window.require('electron').remote
  : {};

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

  openPath(fieldName) {
    const existingPath = (this.props.settings[fieldName]) ?
      path.resolve(this.props.settings[fieldName]) : '';
    if (IS_ELECTRON) {
      dialog.showOpenDialog(
        BrowserWindow.getFocusedWindow(),
        {
          defaultPath: existingPath,
          properties: ['openFile'],
        },
        (fileName) => {
          if (!fileName) {
            return;
          }
          this.props.updateValue(fieldName, fileName[0]);
        }
      );
    }
  }

  render() {
    return (
      <div className="formContentWrapper">
        <div className="form-row">
          { this.props.renderFieldLabel('mongoCmd') }
          <input type="text" id="mongoCmd" value={this.props.settings.mongoCmd} onChange={this.onPathEntered} />
          <Button className="formButton" onClick={() => { this.openPath('mongoCmd'); }}>Browse</Button>
        </div>
        <div className="form-row">
          { this.props.renderFieldLabel('drillCmd') }
          <input type="text" id="drillCmd" value={this.props.settings.drillCmd} onChange={this.onPathEntered} />
          <Button className="formButton" onClick={() => { this.openPath('drillCmd'); }}>Browse</Button>
        </div>
      </div>
    );
  }
}
