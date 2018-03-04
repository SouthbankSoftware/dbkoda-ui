/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2018-02-21T14:36:12+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-03-04T23:27:49+11:00
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

import * as d3 from 'd3';
import * as React from 'react';
import { computed, type IObservableArray } from 'mobx';
import { observer } from 'mobx-react';
import { PopoverInteractionKind } from '@blueprintjs/core';
// $FlowFixMe
import { Popover2 } from '@blueprintjs/labs';
// $FlowFixMe
import { List, CellMeasurer, CellMeasurerCache } from 'react-virtualized';
import ErrorIcon from '~/styles/icons/error-icon.svg';
import TickIcon from '~/styles/icons/tick-icon.svg';
import styles from './AlarmView.scss';

const POPOVER_CONTENT_WIDTH = 537;
const POPOVER_CONTENT_HEIGHT = 257;

const headerHeight = parseInt(styles.headerHeight, 10);
const containerPadding = parseInt(styles.containerPadding, 10);

const timeFormatter = d3.timeFormat('%H:%M:%S');

const alarmStatuses = {
  green: 0,
  yellow: 1,
  red: 2
};

// well, atm flow doesn't hv a utility to grab values from alarmStatuses, so we need to manually
// list here
type AlarmLevel = 0 | 1 | 2;

export type Alarm = {
  timestamp: number,
  level: AlarmLevel,
  message: string
};

const AlarmLevelIcon = ({ level, size = 18 }: { level: AlarmLevel, size?: number }) => {
  switch (level) {
    case alarmStatuses.green:
      return <TickIcon className="AlarmLevelIcon green" width={size} />;
    case alarmStatuses.yellow:
      return <ErrorIcon className="AlarmLevelIcon yellow" width={size} />;
    case alarmStatuses.red:
      return <ErrorIcon className="AlarmLevelIcon red" width={size} />;
    default:
      return null;
  }
};

type Props = {
  category: string,
  alarms: IObservableArray<Alarm>
};

@observer
export default class AlarmView extends React.PureComponent<Props> {
  _cellMeasurerCache: *;

  constructor(props: Props) {
    super(props);

    this._cellMeasurerCache = new CellMeasurerCache({
      fixedWidth: true
    });
  }

  @computed
  get overallLevel(): AlarmLevel {
    this._cellMeasurerCache.clearAll();

    const { alarms } = this.props;
    let level = 0;

    for (const { level: l } of alarms) {
      if (l > level) {
        level = l;

        if (l >= alarmStatuses.red) {
          break;
        }
      }
    }

    return level;
  }

  _getCategoryDescription = (category: string): string => {
    switch (category) {
      case 'mongo':
        return 'MongoDB';
      case 'wiredtiger':
        return 'WiredTiger';
      case 'disk':
        return 'Disk';
      default:
        return category;
    }
  };

  _getLevelDescription = (level: AlarmLevel): string => {
    switch (level) {
      case alarmStatuses.green:
        return 'normal';
      case alarmStatuses.yellow:
        return 'caution';
      case alarmStatuses.red:
        return 'critical';
      default:
        return '';
    }
  };

  _renderRow = ({ index, key, style, parent }) => {
    const { alarms } = this.props;
    const { timestamp, level, message } = alarms[index];

    return (
      <CellMeasurer
        cache={this._cellMeasurerCache}
        columnIndex={0}
        key={key}
        rowIndex={index}
        parent={parent}
      >
        <div className="row" key={key} style={style}>
          <div className="status">
            <AlarmLevelIcon level={level} />
          </div>
          <div className="message">{`${timeFormatter(timestamp)} ${message}`}</div>
        </div>
      </CellMeasurer>
    );
  };

  render() {
    const { category, alarms } = this.props;
    const { overallLevel } = this;

    return (
      <Popover2
        minimal
        interactionKind={PopoverInteractionKind.HOVER}
        popoverClassName="AlarmViewPopover"
        content={
          <div
            className="AlarmViewPopoverContent"
            style={{
              width: POPOVER_CONTENT_WIDTH,
              height: POPOVER_CONTENT_HEIGHT
            }}
          >
            <div className="header">
              <AlarmLevelIcon level={overallLevel} size={20} />
              {`${this._getCategoryDescription(category)} status: ${this._getLevelDescription(
                overallLevel
              )}`}
            </div>
            <List
              className="messageList"
              deferredMeasurementCache={this._cellMeasurerCache}
              width={POPOVER_CONTENT_WIDTH - 2 * containerPadding}
              height={POPOVER_CONTENT_HEIGHT - 2 * containerPadding - headerHeight}
              rowCount={alarms.length}
              rowHeight={this._cellMeasurerCache.rowHeight}
              rowRenderer={this._renderRow}
            />
          </div>
        }
        target={<AlarmLevelIcon level={overallLevel} size={20} />}
      />
    );
  }
}
