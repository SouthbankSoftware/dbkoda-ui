/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-12-14T12:22:05+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-02-05T11:58:21+11:00
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
import { action } from 'mobx';
import { observer } from 'mobx-react';
import type { WidgetState } from '~/api/Widget';
import ErrorView from '#/common/ErrorView';
import LoadingView from '#/common/LoadingView';
import _ from 'lodash';
import ReactResizeDetector from 'react-resize-detector';
// $FlowFixMe
import { Popover2 } from '@blueprintjs/labs';
// $FlowFixMe
import { Broker, EventType } from '~/helpers/broker';
import type { WidgetValue } from '~/api/Widget';
import HistoryView from './HistoryView';
import './Widget.scss';

const DEBOUNCE_DELAY = 100;
const MAX_HISTORY_SIZE = 720; // 1h with 5s sampling rate
const HISTORY_VIEW_WIDTH = 537;
const HISTORY_VIEW_HEIGHT = 257;

export type Projection = { [string]: (value: WidgetValue) => number };

type Props = {
  widget: WidgetState,
  widgetStyle: *,
  children: *,
  className?: string,
  onResize?: (width: number, height: number) => void,
  projection?: Projection
};

type State = {
  projection: Projection
};

@observer
export default class Widget extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      projection: props.projection || this._generateDefaultProjection(props)
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    const { projection } = this.state;
    const { projection: newProjection } = nextProps;
    if (newProjection && projection !== newProjection) {
      this.setState({
        projection: newProjection
      });
    }
  }

  _generateDefaultProjection = (props: Props) => {
    const { widget: { items } } = props;

    return _.reduce(
      items,
      (acc, v) => {
        acc[v] = value => value.value[v];
        return acc;
      },
      {}
    );
  };

  _onData = action(payload => {
    const { timestamp, value } = payload;
    const { items, values } = this.props.widget;

    if (values.length >= MAX_HISTORY_SIZE) {
      values.splice(0, MAX_HISTORY_SIZE - values.length + 1);
    }

    values.push({
      timestamp,
      value: _.pick(value, items)
    });
  });

  _onResize = _.debounce((...args) => {
    _.invoke(this.props, 'onResize', ...args);
  }, DEBOUNCE_DELAY);

  componentDidMount() {
    const { profileId } = this.props.widget;

    Broker.on(EventType.STATS_DATA(profileId), this._onData);
  }

  componentWillUnmount() {
    const { profileId } = this.props.widget;

    Broker.off(EventType.STATS_DATA(profileId), this._onData);
  }

  _renderDefaultView() {
    const { items, values } = this.props.widget;
    const latestValue =
      values.length > 0 ? values[values.length - 1].value : {};

    return (
      <div className="DefaultWidgetView">
        {items.map(v => {
          let value = _.get(latestValue, v, null);

          if (value === null) {
            value = '?';
          } else if (typeof value === 'number') {
            value = _.isInteger(value) ? value : value.toFixed(2);
          } else {
            value = <pre>{JSON.stringify(value, null, 2)}</pre>;
          }

          return [
            <div key={`${v}-title`} className="title">
              {v}
            </div>,
            <div key={`${v}-value`} className="value">
              {value}
            </div>
          ];
        })}
      </div>
    );
  }

  render() {
    const {
      children,
      // $FlowFixMe
      widget: {
        state,
        errorLevel,
        error,
        values,
        name,
        title,
        description,
        showHorizontalRule
      },
      className,
      widgetStyle
    } = this.props;
    const { projection } = this.state;

    return (
      <div className={className + ' Widget' || 'Widget'} style={widgetStyle}>
        {state !== 'loaded' ? (
          state === 'loading' ? (
            <LoadingView />
          ) : (
            <ErrorView title={null} error={error} errorLevel={errorLevel} />
          )
        ) : (
          <div className="parentWidgetWrapper">
            {title && (
              <p className="header">
                <b className="title">{title}</b>
              </p>
            )}
            <Popover2
              minimal
              popoverClassName="HistoryViewPopover"
              content={
                <HistoryView
                  width={HISTORY_VIEW_WIDTH}
                  height={HISTORY_VIEW_HEIGHT}
                  values={values}
                  projection={projection}
                  name={name}
                  description={description}
                />
              }
              target={
                <span className="children">
                  {children || this._renderDefaultView()}
                </span>
              }
            />
            {showHorizontalRule && <hr />}
          </div>
        )}
        <ReactResizeDetector
          handleWidth
          handleHeight
          onResize={this._onResize}
        />
      </div>
    );
  }
}
