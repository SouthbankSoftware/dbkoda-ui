/**
 * @Author: chris
 * @Date:   2017-09-27T10:39:11+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-06-18T16:31:03+10:00
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
import { Button, RadioGroup, Radio } from '@blueprintjs/core';
import path from 'path';

import Docker from './docker';

import './Paths.scss';

const { dialog, BrowserWindow } = IS_ELECTRON ? window.require('electron').remote : {};

@observer
export default class Paths extends React.Component {
  constructor(props) {
    super(props);
    this.onPathEntered = this.onPathEntered.bind(this);
  }

  onPathEntered(e) {
    const fieldName = e.target.id;
    const fieldValue = e.target.value;
    this.props.updateValue(fieldName, fieldValue || null);
  }

  openPath(fieldName) {
    const existingPath = this.props.settings[fieldName]
      ? path.resolve(this.props.settings[fieldName])
      : '';
    const dlgProperties = fieldName == 'drillCmd' ? 'openDirectory' : 'openFile';
    if (IS_ELECTRON) {
      dialog.showOpenDialog(
        BrowserWindow.getFocusedWindow(),
        {
          defaultPath: existingPath,
          properties: [dlgProperties]
        },
        fileName => {
          if (!fileName) {
            return;
          }
          this.props.updateValue(fieldName, fileName[0]);
        }
      );
    }
  }

  changeRadio = e => {
    this.props.updateValue('dockerEnabled', e.target.value === 'true');
  };

  render() {
    const { settings } = this.props;
    return (
      <div className="formContentWrapper">
        <div className="sectionHeader"> {globalString('editor/config/sections/paths')}</div>
        <RadioGroup onChange={this.changeRadio} selectedValue={settings.dockerEnabled}>
          <Radio
            className="sectionHeader"
            value={false}
            label={globalString('editor/config/mongoCmd')}
          />
          <div className="fileInput">
            <input
              type="text"
              id="mongoCmd"
              disabled={settings.dockerEnabled}
              value={this.props.settings.mongoCmd || ''}
              onChange={this.onPathEntered}
            />
            <Button
              className="formButton"
              disabled={settings.dockerEnabled}
              onClick={() => {
                this.openPath('mongoCmd');
              }}
            >
              {globalString('general/browse')}
            </Button>
          </div>
          <Radio className="sectionHeader docker-section-header" label="Docker" value />
          <Docker
            dockerEnabled={settings.dockerEnabled}
            onPathEntered={this.onPathEntered}
            updateValue={this.props.updateValue}
            docker={this.props.settings.docker}
          />
          <div className="sectionHeader">{this.props.renderFieldLabel('drillCmd')}</div>
          <div className="fileInput">
            <input
              type="text"
              id="drillCmd"
              value={this.props.settings.drillCmd || ''}
              onChange={this.onPathEntered}
            />
            <Button
              className="formButton"
              onClick={() => {
                this.openPath('drillCmd');
              }}
            >
              {globalString('general/browse')}
            </Button>
          </div>
        </RadioGroup>
      </div>
    );
  }
}
