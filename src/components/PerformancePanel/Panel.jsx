/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-12-12T22:15:28+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   wahaj
 * @Last modified time: 2018-02-08T17:15:30+11:00
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
import type { WidgetState } from '~/api/Widget';
// $FlowFixMe
import { NewToaster } from '#/common/Toaster';
// $FlowFixMe
import { Broker, EventType } from '~/helpers/broker';
import SizeProvider from './SizeProvider';
import * as widgetTypes from './Widgets';
import schema from './schema.json';
import './Panel.scss';

const ResponsiveReactGridLayout = SizeProvider(Responsive);

type Store = {
  performancePanel: PerformancePanelState
};

type Props = {
  store: any | Store,
  api: *,
  profileId: UUID
};

type State = {
  layouts: *,
  rowHeight: number,
  cols: number,
  rows: number,
  midWidth: number,
  leftWidth: number,
  widgetHeight: number,
  widgetWidth: number,
  height: number
};

@inject(({ store: { performancePanels }, api }, { profileId }) => {
  const performancePanel = performancePanels.get(profileId);
  return {
    store: {
      performancePanel
    },
    api
  };
})
@observer
/**
 * Performance Panel defines the layout and creation of widgets in the performance view
 */
export default class PerformancePanel extends React.Component<Props, State> {
  static defaultProps = {
    store: null,
    api: null
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      layouts: {
        desktop: []
      },
      rowHeight: 150,
      cols: 8,
      rows: 8,
      leftWidth: 2,
      midWidth: 6,
      widgetHeight: 2,
      widgetWidth: 2,
      height: 0
    };
  }

  _addSchemaWidgets = action(() => {
    const { api, profileId, store: { performancePanel } } = this.props;

    if (schema.cols && schema.rows) {
      this.setState({
        rowHeight: schema.rowHeight,
        cols: schema.cols,
        rows: schema.rows,
        midWidth: schema.midWidth,
        leftWidth: schema.leftWidth
      });
    }

    if (schema && schema.widgets) {
      for (const widget of schema.widgets) {
        const id = api.addWidget(
          profileId,
          widget.items,
          widget.type,
          widget.extraState ? widget.extraState : {}
        );
        const layout = this._updateLayoutStyle({
          i: id,
          widgetStyle: {},
          gridElementStyle: {},
          ...widget.layout
        });
        performancePanel.layouts.set(id, observable(layout));
      }
    }
    // TIP: easier to dev widget with dummy observable
  });

  _updateLayoutStyle(layout) {
    const lSep = this.state.leftWidth;
    const rSep = this.state.leftWidth + this.state.midWidth;
    if (layout.background === 'light') {
      layout.widgetStyle.backgroundColor = '#2A2A2A';
      layout.gridElementStyle.paddingTop = '20px';
      layout.gridElementStyle.paddingBottom = '20px';

      if (layout.x + layout.w < rSep) {
        layout.widgetStyle.borderRight = '1px solid #383838';
      }
      if (layout.x === lSep) {
        layout.gridElementStyle.paddingLeft = '20px';
      }
      if (layout.x + layout.w === rSep) {
        layout.gridElementStyle.paddingRight = '20px';
      }
    }
    return layout;
  }

  _getWidgetComponent(widget: WidgetState) {
    const { id, type } = widget;
    const { store: { performancePanel } } = this.props;
    const layout = performancePanel.layouts.get(id);

    if (layout) {
      const Widget = widgetTypes[type];

      return (
        <div
          id={`widget-${id}`}
          key={id}
          data-grid={layout}
          style={layout.gridElementStyle}
        >
          <Widget widget={widget} widgetStyle={layout.widgetStyle} />
        </div>
      );
    }
  }

  _removeSchemaWidgets = action(() => {
    const { store } = this.props;

    store.performancePanel.widgets = observable.shallowMap();
    store.performancePanel.layouts = observable.shallowMap();
  });

  _onError = payload => {
    const { error, level } = payload;

    level === 'error' ? console.error(error) : console.warn(error);
    NewToaster.show({
      message: error,
      className: level === 'error' ? 'danger' : 'warning',
      iconName: 'pt-icon-thumbs-down'
    });
  };

  /**
   * When the panel mounts it will subscribe to the event broker for stats errors.
   * It will also adds demo widgets and generates a layout.
   */
  componentDidMount() {
    const { profileId, store: { performancePanel } } = this.props;

    Broker.on(EventType.STATS_ERROR(profileId), this._onError);

    if (performancePanel.widgets.size <= 0) {
      this._addSchemaWidgets();
    }
  }

  componentWillUnmount() {
    const { profileId } = this.props;

    Broker.off(EventType.STATS_ERROR(profileId), this._onError);

    this._removeSchemaWidgets();
  }
  onLayoutChange = action((gridLayout: *, oldItem: *, newItem: *) => {
    const { store: { performancePanel } } = this.props;
    const layout = performancePanel.layouts.get(oldItem.i);
    if (layout.background === 'light') {
      const newLayout = this._updateLayoutStyle({
        ...newItem,
        widgetStyle: {},
        gridElementStyle: {},
        background: layout.background
      });
      layout.gridElementStyle = newLayout.gridElementStyle;
      layout.widgetStyle = newLayout.widgetStyle;
    }
  });

  render() {
    const {
      api,
      profileId,
      store: { performancePanel: { widgets } }
    } = this.props;
    const { layouts, rowHeight, rows, cols } = this.state;

    return (
      <div className="PerformancePanel">
        <ResponsiveReactGridLayout
          className="GridLayout"
          layouts={layouts}
          onDragStop={this.onLayoutChange}
          onResizeStop={this.onLayoutChange}
          autoSize={false}
          compactType={null}
          preventCollision={false}
          breakpoints={{
            desktop: 0
          }}
          cols={{
            desktop: cols
          }}
          rowHeight={rowHeight}
          margin={[0, 0]}
          verticalGridSize={rows}
          bFitHeight={false}
        >
          {widgets.values().map(widget => this._getWidgetComponent(widget))}
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
