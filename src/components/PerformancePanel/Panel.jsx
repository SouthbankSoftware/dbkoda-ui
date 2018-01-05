/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-12-12T22:15:28+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-01-05T12:33:22+11:00
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
// $FlowFixMe
import { Responsive } from 'react-grid-layout';
// $FlowFixMe
import { Button } from '@blueprintjs/core';
import { action, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import type { PerformancePanelState } from '~/api/PerformancePanel';
import Widget from '#/PerformancePanel/Widgets/Widget';
// $FlowFixMe
import { NewToaster } from '#/common/Toaster';
// $FlowFixMe
import { Broker, EventType } from '~/helpers/broker';
import SizeProvider from './SizeProvider';
import './Panel.scss';

const ResponsiveReactGridLayout = SizeProvider(Responsive);

type Store = {
  performancePanel: PerformancePanelState,
};

type Props = {
  store: any | Store,
  api: *,
  profileId: UUID,
};

type State = {
  layouts: *,
  rows: number,
  cols: number,
  widgetHeight: number,
  widgetWidth: number,
};

@inject(({ store: { performancePanels }, api }, { profileId }) => {
  const performancePanel = performancePanels.get(profileId);

  return {
    store: {
      performancePanel,
    },
    api,
  };
})
@observer
export default class PerformancePanel extends React.Component<Props, State> {
  static defaultProps = {
    store: null,
    api: null,
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      layouts: {
        desktop: [],
      },
      rows: 8,
      cols: 10,
      widgetHeight: 2,
      widgetWidth: 2,
    };
  }

  _generateLayouts = (cols, widgetHeight, widgetWidth) => {
    const { widgets } = this.props.store.performancePanel;

    return {
      desktop: widgets.map((v, i) => ({
        w: widgetWidth,
        h: widgetHeight,
        x: (i * widgetWidth) % cols,
        y: Math.floor(i / cols),
        i: v,
      })),
    };
  };

  _addDemoWidgets = action(() => {
    const { api, profileId, store: { performancePanel: { widgets } } } = this.props;

    widgets.push(api.addWidget(profileId, ['cpu', 'memory', 'topology', 'serverStatus']));

    // widgets.push(api.addWidget(profileId, ['memory']));
    // widgets.push(api.addWidget(profileId, ['topology']));
    // widgets.push(api.addWidget(profileId, ['serverStatus']));

    // widgets.push(api.addWidget(profileId, ['item-1']));
    // widgets.push(api.addWidget(profileId, ['item-2', 'item-6']));
    // widgets.push(api.addWidget(profileId, ['item-3', 'item-5', 'item-8']));
    // widgets.push(api.addWidget(profileId, ['item-6']));
    // widgets.push(api.addWidget(profileId, ['item-7']));
    // widgets.push(api.addWidget(profileId, ['item-10']));
  });

  _removeDemoWidgets = action(() => {
    const { store } = this.props;

    store.performancePanel.widgets = observable.shallowArray();
  });

  _onError = payload => {
    const { error, level } = payload;

    level === 'error' ? console.error(error) : console.warn(error);
    NewToaster.show({
      message: error,
      className: level === 'error' ? 'danger' : 'warning',
      iconName: 'pt-icon-thumbs-down',
    });
  };

  componentDidMount() {
    const { profileId } = this.props;

    Broker.on(EventType.STATS_ERROR(profileId), this._onError);

    this._addDemoWidgets();

    const { cols, widgetHeight, widgetWidth } = this.state;

    this.setState({
      layouts: this._generateLayouts(cols, widgetHeight, widgetWidth),
    });
  }

  componentWillUnmount() {
    const { profileId } = this.props;

    Broker.off(EventType.STATS_ERROR(profileId), this._onError);

    this._removeDemoWidgets();
  }

  render() {
    const { api, profileId, store: { performancePanel: { widgets } } } = this.props;
    const { layouts, rows, cols } = this.state;

    return (
      <div className="PerformancePanel">
        <ResponsiveReactGridLayout
          className="GridLayout"
          layouts={layouts}
          autoSize={false}
          breakpoints={{
            desktop: 0,
          }}
          cols={{
            desktop: cols,
          }}
          verticalGridSize={rows}
          margin={[12, 12]}
        >
          {widgets.map(v => (
            <div id={`widget-${v}`} key={v} className="pt-elevation-3">
              <Widget id={v} />
            </div>
          ))}
        </ResponsiveReactGridLayout>
        <Button
          className="close-button pt-button pt-intent-primary"
          text="X"
          onClick={() => api.closePerformancePanel(profileId, true)}
        />
      </div>
    );
  }
}
