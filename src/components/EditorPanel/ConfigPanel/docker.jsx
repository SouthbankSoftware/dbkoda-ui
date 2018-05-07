/**
 * @Author: chris
 * @Date:   2017-09-27T10:39:11+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-03-15T09:57:04+11:00
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
import { RadioGroup, Radio } from '@blueprintjs/core';
import './docker.scss';

export default class Docker extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selection: 'image', finalCmd: '' };
  }

  changeRadio = e => {
    this.setState({ selection: e.target.value });
  };

  changeFinalCommand = e => {
    this.setState({ finalCmd: e.target.value });
  };

  render() {
    const { dockerEnabled, onPathEntered } = this.props;
    return (
      <div className="docker-config-container">
        <RadioGroup inline onChange={this.changeRadio} selectedValue={this.state.selection}>
          <Radio
            className="config-label-width inline-file-input form-row"
            disabled={!dockerEnabled}
            value="image"
            label={globalString('editor/config/docker-image-name')}
          />
          <div className="inline-file-input">
            <input
              type="text"
              id="docker.imageName"
              disabled={!dockerEnabled || this.state.selection === 'id'}
              value=""
              onChange={onPathEntered}
            />
          </div>
          <div style={{ height: '30px' }} />
          <Radio
            className="config-label-width inline-file-input form-row"
            disabled={!dockerEnabled}
            value="id"
            label={globalString('editor/config/docker-container-id')}
          />
          <div className="inline-file-input">
            <input
              type="text"
              id="docker.containerId"
              disabled={!dockerEnabled || this.state.selection === 'image'}
              value=""
              onChange={onPathEntered}
            />
          </div>
        </RadioGroup>
        <div className="docker-mount-volume">
          <span className="config-label-width text-label">
            {globalString('editor/config/docker-volume')}
          </span>
          <input
            type="text"
            id="docker.volumeHostPath"
            disabled={!dockerEnabled || this.state.selection === 'id'}
            value=""
            onChange={onPathEntered}
          />
          <span className="text-label mount-separator">:</span>
          <input
            type="text"
            id="docker.volumeContainerPath"
            disabled={!dockerEnabled || this.state.selection === 'id'}
            value=""
            onChange={onPathEntered}
          />
        </div>
        <div className="final-command-container">
          <div className="config-label-width text-label">
            {globalString('editor/config/docker-cmd')}
          </div>
          <input
            type="text"
            className="final-command"
            disabled={!dockerEnabled || this.state.selection === 'id'}
            value={this.state.finalCmd}
            onChange={onPathEntered}
          />
        </div>
      </div>
    );
  }
}
