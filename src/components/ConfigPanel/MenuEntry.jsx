/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2018-07-11T16:08:26+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-07-16T15:49:30+10:00
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

import _ from 'lodash';
import * as React from 'react';
import { computed } from 'mobx';
import { inject, observer } from 'mobx-react';
import { Popover, PopoverInteractionKind, Icon } from '@blueprintjs/core';
import classNames from 'classnames';
import './MenuEntry.scss';

// $FlowIssue
@inject(({ store: { configPanel }, api }) => ({
  store: {
    configPanel
  },
  api
}))
@observer
export default class MenuEntry extends React.Component<*> {
  @computed
  get paths() {
    return _.values(this.props.paths);
  }

  render() {
    const {
      store: {
        configPanel: { changes, errors, currentMenuEntry }
      },
      api,
      name,
      icon,
      disableIndicator
    } = this.props;

    let showIndicator = false;

    if (!disableIndicator) {
      showIndicator =
        _.some(this.paths, changes.has.bind(changes)) ||
        _.some(this.paths, errors.has.bind(errors));
    }

    return (
      <div
        className={classNames('ConfigPanelMenuEntry', { selected: currentMenuEntry === name })}
        role="button"
        onClick={() => api.selectMenuEntry(name)}
      >
        <Popover
          className="Tooltip"
          popoverClassName="ConfigPanelMenuEntryTooltip"
          content={<div className="Body">{globalString(`config/menu/${name}`)}</div>}
          interactionKind={PopoverInteractionKind.HOVER}
          hoverOpenDelay={1000}
          minimal
        >
          {icon}
        </Popover>
        {showIndicator && <Icon className="Indicator" icon="dot" iconSize={24} title={false} />}
      </div>
    );
  }
}
