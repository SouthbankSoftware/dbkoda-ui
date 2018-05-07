/**
 * @Author: chris
 * @Date:   2017-09-27T10:39:11+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-03-14T17:50:54+11:00
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
    this.state = { radioSelection: 'path' };
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
    this.setState({ radioSelection: e.target.value });
  };

  render() {
    return (
      <div className="formContentWrapper">
        <RadioGroup onChange={this.changeRadio} selectedValue={this.state.radioSelection}>
          <Radio
            className="sectionHeader"
            value="path"
            label={globalString('editor/config/sections/paths')}
          />

          <div className="form-row">{this.props.renderFieldLabel('mongoCmd')}</div>
          <div className="fileInput">
            <input
              type="text"
              id="mongoCmd"
              disabled={this.state.radioSelection === 'docker'}
              value={this.props.settings.mongoCmd || ''}
              onChange={this.onPathEntered}
            />
            <Button
              className="formButton"
              disabled={this.state.radioSelection === 'docker'}
              onClick={() => {
                this.openPath('mongoCmd');
              }}
            >
              {globalString('general/browse')}
            </Button>
          </div>
          <div className="form-row">{this.props.renderFieldLabel('drillCmd')}</div>
          <div className="fileInput">
            <input
              type="text"
              id="drillCmd"
              disabled={this.state.radioSelection === 'docker'}
              value={this.props.settings.drillCmd || ''}
              onChange={this.onPathEntered}
            />
            <Button
              className="formButton"
              disabled={this.state.radioSelection === 'docker'}
              onClick={() => {
                this.openPath('drillCmd');
              }}
            >
              {globalString('general/browse')}
            </Button>
          </div>
          <Radio className="sectionHeader docker-section-header" label="Docker" value="docker" />
          <Docker
            dockerEnabled={this.state.radioSelection === 'docker'}
            onPathEntered={this.onPathEntered}
            settings={this.props.settings}
            docker={this.props.settings.docker}
          />
        </RadioGroup>
      </div>
    );
  }
}
