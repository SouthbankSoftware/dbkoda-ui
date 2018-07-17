/**
 * @Author: chris
 * @Date:   2017-09-27T10:39:11+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-06-18T16:47:07+10:00
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

  calculateFinalCommand(dockerSettingsObj) {
    if (!dockerSettingsObj) return;

    const { cmd } = dockerSettingsObj;

    if (!cmd) return;

    const { imageName, containerId } = dockerSettingsObj;

    const subCmd = dockerSettingsObj.createNew ? 'run' : 'exec';
    const targetName = subCmd === 'run' ? imageName : containerId;

    if (!targetName) return;

    const { hostPath, containerPath } = dockerSettingsObj;

    const rmParam = subCmd === 'run' ? '--rm' : '';

    let mongoCmd = `${cmd} ${subCmd} -it ${rmParam}`;

    if (subCmd === 'run' && hostPath && containerPath) {
      mongoCmd += ` -v ${hostPath}:${containerPath} ${targetName} mongo`;
    } else {
      mongoCmd += ` ${targetName} mongo`;
    }

    this.setState({ finalCmd: mongoCmd });
  }

  render() {
    const { dockerEnabled, onPathEntered } = this.props;
    const { newSettings: settings } = this.props.store.configPage;
    const { docker } = settings;
    return (
      <div className="docker-config-container">
        <div className="cmd">
          <div className="config-label-width text-label">
            {globalString('editor/config/docker/cmd')}
          </div>
          <div className="inline-file-input">
            <Tooltip
              intent={Intent.PRIMARY}
              hoverOpenDelay={1000}
              content={globalString('editor/config/docker-tooltip/cmd')}
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}
            >
              <input
                type="text"
                id="docker.cmd"
                disabled={!dockerEnabled}
                value={docker.cmd || ''}
                onChange={onPathEntered}
              />
            </Tooltip>
          </div>
        </div>
        <RadioGroup inline onChange={this.changeRadio} selectedValue={docker.createNew}>
          <Radio
            className="config-label-width inline-file-input form-row"
            disabled={!dockerEnabled}
            value
            label={globalString('editor/config/docker/imageName')}
          />
          <div className="inline-file-input">
            <Tooltip
              intent={Intent.PRIMARY}
              hoverOpenDelay={1000}
              content={globalString('editor/config/docker-tooltip/imageName')}
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
            label={globalString('editor/config/docker/containerId')}
          />
          <div className="inline-file-input">
            <Tooltip
              intent={Intent.PRIMARY}
              hoverOpenDelay={1000}
              content={globalString('editor/config/docker-tooltip/containerId')}
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}
            >
              <input
                type="text"
                id="docker.containerId"
                disabled={!dockerEnabled || docker.createNew}
                value={docker.containerId || ''}
                onChange={onPathEntered}
              />
            </Tooltip>
          </div>
        </RadioGroup>
        <div className="docker-mount-volume">
          <span className="config-label-width text-label">
            {globalString('editor/config/docker/mountVolume')}
          </span>
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            content={globalString('editor/config/docker-tooltip/hostPath')}
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
            content={globalString('editor/config/docker-tooltip/containerPath')}
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
            {globalString('editor/config/docker/mongoCmdPreview')}
          </div>
          <input type="text" className="final-command" disabled value={this.state.finalCmd || ''} />
        </div>
      </div>
    );
  }
}
