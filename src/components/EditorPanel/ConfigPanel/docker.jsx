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
import { reaction, toJS } from 'mobx';
import { observer, inject } from 'mobx-react';
import { RadioGroup, Radio, Tooltip, Intent, Position } from '@blueprintjs/core';
import './docker.scss';

@inject(allStores => ({ store: allStores.store }))
@observer
export default class Docker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      finalCmd: ''
    };
  }

  changeRadio = e => {
    const { updateValue } = this.props;
    updateValue('docker.createNew', e.target.value === 'true');
  };

  componentDidMount() {
    const { newSettings: settings } = this.props.store.configPage;
    this.calculateFinalCommand(settings.docker);
    this._disposer = reaction(
      () => toJS(this.props.store.configPage.newSettings),
      settingsObj => {
        this.calculateFinalCommand(settingsObj.docker);
      },
      { fireImmediately: true }
    );
  }

  componentWillUnmount() {
    this._disposer && this._disposer();
  }

  componentWillReceiveProps(nextProps) {
    this.calculateFinalCommand(nextProps.store.configPage.newSettings.docker);
  }

  calculateFinalCommand(docker) {
    const dockerSubCmd = docker.createNew ? 'run' : 'exec';
    const imageName = dockerSubCmd === 'run' ? docker.imageName : docker.containerID;
    const rmParam = dockerSubCmd === 'run' ? '--rm' : '';
    let mongoCmd = `docker ${dockerSubCmd} -it ${rmParam}`;
    const mongoVersionCmd = `docker ${dockerSubCmd} ${imageName} mongo --version`;
    let mongoSiblingCmd = `docker ${dockerSubCmd} ${rmParam}`;
    if (docker.hostPath && docker.containerPath && dockerSubCmd === 'run') {
      mongoCmd += ` -v ${docker.hostPath}:${docker.containerPath} ${imageName} mongo`;
      mongoSiblingCmd += ` -v ${docker.hostPath}:${docker.containerPath} ${imageName}`;
    } else {
      mongoCmd += ` ${imageName} mongo`;
      mongoSiblingCmd += ` ${imageName}`;
    }
    const { updateValue } = this.props;
    updateValue('docker.mongoCmd', mongoCmd);
    updateValue('docker.mongoVersionCmd', mongoVersionCmd);
    ['mongorestore', 'mongodump', 'mongoimport', 'mongoexport'].forEach(cmd => {
      updateValue(`docker.${cmd}Cmd`, `${mongoSiblingCmd} ${cmd}`);
    });
    this.setState({ finalCmd: mongoCmd });
  }

  changeFinalCommand = e => {
    this.setState({ finalCmd: e.target.value });
    this.props.updateValue('docker.mongoCmd', e.target.value);
  };

  render() {
    const { dockerEnabled, onPathEntered } = this.props;
    const { newSettings: settings } = this.props.store.configPage;
    const { docker } = settings;
    return (
      <div className="docker-config-container">
        <RadioGroup inline onChange={this.changeRadio} selectedValue={docker.createNew}>
          <Radio
            className="config-label-width inline-file-input form-row"
            disabled={!dockerEnabled}
            value
            label={globalString('editor/config/docker-image-name')}
          />
          <div className="inline-file-input">
            <Tooltip
              intent={Intent.PRIMARY}
              hoverOpenDelay={1000}
              content={globalString('editor/config/docker-tooltip/image')}
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}
            >
              <input
                type="text"
                id="docker.imageName"
                disabled={!dockerEnabled || !docker.createNew}
                value={docker.imageName || ''}
                onChange={onPathEntered}
              />
            </Tooltip>
          </div>
          <div
            style={{
              height: '30px'
            }}
          />
          <Radio
            className="config-label-width inline-file-input form-row"
            disabled={!dockerEnabled}
            value={false}
            label={globalString('editor/config/docker-container-id')}
          />
          <div className="inline-file-input">
            <Tooltip
              intent={Intent.PRIMARY}
              hoverOpenDelay={1000}
              content={globalString('editor/config/docker-tooltip/container')}
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}
            >
              <input
                type="text"
                id="docker.containerID"
                disabled={!dockerEnabled || docker.createNew}
                value={docker.containerID || ''}
                onChange={onPathEntered}
              />
            </Tooltip>
          </div>
        </RadioGroup>
        <div className="docker-mount-volume">
          <span className="config-label-width text-label">
            {globalString('editor/config/docker-volume')}
          </span>
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            content={globalString('editor/config/docker-tooltip/host-volume')}
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}
          >
            <input
              type="text"
              id="docker.hostPath"
              disabled={!dockerEnabled || !docker.createNew}
              value={docker.hostPath || ''}
              onChange={onPathEntered}
            />
          </Tooltip>
          <span className="text-label mount-separator">:</span>
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            content={globalString('editor/config/docker-tooltip/container-volume')}
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}
          >
            <input
              type="text"
              id="docker.containerPath"
              disabled={!dockerEnabled || !docker.createNew}
              value={docker.containerPath || ''}
              onChange={onPathEntered}
            />
          </Tooltip>
        </div>
        <div className="final-command-container">
          <div className="config-label-width text-label">
            {globalString('editor/config/docker-cmd')}
          </div>
          <input
            type="text"
            id="docker.dockerCmd"
            className="final-command"
            disabled={!dockerEnabled}
            value={this.state.finalCmd || ''}
            onChange={this.changeFinalCommand}
          />
        </div>
      </div>
    );
  }
}
