/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-12-14T12:22:05+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   wahaj
 * @Last modified time: 2018-02-01T18:03:55+11:00
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
import { inject, observer } from 'mobx-react';
import type { WidgetState } from '~/api/Widget';
import ErrorView from '#/common/ErrorView';
import LoadingView from '#/common/LoadingView';
import _ from 'lodash';
import ReactResizeDetector from 'react-resize-detector';
// $FlowFixMe
import { Broker, EventType } from '~/helpers/broker';
import './Widget.scss';

const DEBOUNCE_DELAY = 100;

type Store = {
  widget: WidgetState
};

type Props = {
  store: any | Store,
  api: *,
  widget: WidgetState,
  widgetStyle: *,
  children: *,
  onResize?: (width: number, height: number) => void,
  projection?: (values: { [string]: any }) => { [string]: number }
};

@inject(({store, api }, { widget }) => {
  return {
    store,
    api,
    widget
  };
})
@observer
export default class Widget extends React.Component<Props> {
  static defaultProps = {
    store: null,
    api: null
  };

  _onData = action(payload => {
    const { timestamp, value } = payload;
    const { items, values } = this.props.widget;

    values.replace([
      {
        timestamp,
        value: _.pick(value, items)
      }
    ]);
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
    const latestValue = values.length > 0 ? values[values.length - 1].value : {};

    return items.map(v => {
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
    });
  }

  render() {
    const { children } = this.props;
    const { state, errorLevel, error } = this.props.widget;

    return (
      <div className="Widget" style={this.props.widgetStyle}>
        {state !== 'loaded' ? (
          state === 'loading' ? (
            <LoadingView />
          ) : (
            <ErrorView title={null} error={error} errorLevel={errorLevel} />
          )
        ) : (
          children || this._renderDefaultView()
        )}
        <ReactResizeDetector handleWidth handleHeight onResize={this._onResize} />
      </div>
    );
  }
}
