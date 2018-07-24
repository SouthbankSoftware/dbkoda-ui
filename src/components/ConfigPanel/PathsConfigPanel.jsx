/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2018-07-11T14:18:05+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-07-12T21:35:17+10:00
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

import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { withProps } from 'recompose';
import Icon from '~/styles/icons/color/folder-icon.svg';
import ConfigEntry from './ConfigEntry';
import MenuEntry from './MenuEntry';
import './PathsConfigPanel.scss';

const paths = {
  dockerized: 'config.mongo.dockerized',
  dockerCmd: 'config.mongo.docker.cmd',
  dockerCreateNew: 'config.mongo.docker.createNew',
  dockerImageName: 'config.mongo.docker.imageName',
  dockerContainerId: 'config.mongo.docker.containerId',
  dockerHostPath: 'config.mongo.docker.hostPath',
  dockerContainerPath: 'config.mongo.docker.containerPath',
  drillCmd: 'config.drillCmd'
};

const MenuIcon = <Icon id="folder-icon" />;

export const PathsMenuEntry = withProps({ icon: MenuIcon, paths })(MenuEntry);

// $FlowIssue
@inject(({ api }) => ({
  api
}))
@observer
export default class PathsConfigPanel extends React.Component<*> {
  render() {
    const { api } = this.props;
    const dockerized = api.getCurrentConfigValue(paths.dockerized);

    return (
      <div className="PathsConfigPanel">
        <div className="MainColumn">
          <ConfigEntry path={paths.dockerized} />
          <ConfigEntry path={paths.drillCmd} />
        </div>
        <div className="SecondaryColumn">
          {dockerized && (
            <div>
              <ConfigEntry path={paths.dockerCmd} />
              <ConfigEntry path={paths.dockerCreateNew} />
              {api.getCurrentConfigValue(paths.dockerCreateNew) ? (
                <div>
                  <ConfigEntry path={paths.dockerImageName} />
                  <ConfigEntry path={paths.dockerHostPath} />
                  <ConfigEntry path={paths.dockerContainerPath} />
                </div>
              ) : (
                <ConfigEntry path={paths.dockerContainerId} />
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}
