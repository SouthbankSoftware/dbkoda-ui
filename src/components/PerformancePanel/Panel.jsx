/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-12-12T22:15:28+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-02-21T13:27:53+11:00
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
import { performancePanelStatuses } from '~/api/PerformancePanel';
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
  rowHeight: number,
  cols: number,
  rows: number,
  midWidth: number,
  leftWidth: number
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
      rowHeight: 25,
      cols: 54,
      rows: 59,
      leftWidth: 8,
      midWidth: 24
    };
  }

  /**
   * When the panel mounts it will subscribe to the event broker for stats errors.
   * It will also adds demo widgets and generates a layout.
   */
  componentDidMount() {
    const { profileId } = this.props;

    Broker.on(EventType.STATS_ERROR(profileId), this._onError);

    this._init();
  }

  componentWillUnmount() {
    const { profileId } = this.props;

    Broker.off(EventType.STATS_ERROR(profileId), this._onError);
  }

  _init = action(() => {
    const { profileId, store: { performancePanel }, api } = this.props;

    if (performancePanel.status === performancePanelStatuses.created) {
      this._addSchemaWidgets();
      performancePanel.status = performancePanelStatuses.stopped;
      api.startPerformancePanel(profileId);
    }
  });

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
          widget.extraState || {}
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
  });

  _updateLayoutStyle(layout) {
    const lSep = this.state.leftWidth;
    const rSep = this.state.leftWidth + this.state.midWidth;
    if (layout.background === 'light') {
      layout.widgetStyle.backgroundColor = '#2D2D2D';
      layout.widgetStyle.opacity = '0.8';
      layout.widgetStyle.padding = '10px';
      // layout.gridElementStyle.paddingTop = '20px';
      // layout.gridElementStyle.paddingBottom = '20px';

      if (layout.x + layout.w < rSep) {
        //  layout.widgetStyle.borderRight = '1px solid #383838';
      }
      if (layout.x === lSep) {
        layout.gridElementStyle.paddingLeft = '20px';
      }
      if (layout.x + layout.w === rSep) {
        layout.gridElementStyle.paddingRight = '20px';
      }
    }
    if (layout.padding) {
      layout.widgetStyle.padding = layout.padding;
    }
    return layout;
  }

  _getWidgetComponent(widget: WidgetState) {
    const { id, type } = widget;
    const { store: { performancePanel } } = this.props;
    const layout = performancePanel.layouts.get(id);

    if (widget.waterMarkGroup) {
      if (!performancePanel.highWaterMarkGroups) {
        performancePanel.highWaterMarkGroups = [];
      }
      performancePanel.highWaterMarkGroups[widget.waterMarkGroup] = 0;
    }
    widget.profileId = this.props.profileId;

    if (layout) {
      const Widget = widgetTypes[type];

      return (
        <div
          id={`widget-${id}`}
          key={id}
          data-grid={layout}
          style={layout.gridElementStyle}
        >
          <Widget
            profileId={this.props.profileId}
            widget={widget}
            widgetStyle={layout.widgetStyle}
          />
        </div>
      );
    }
  }

  _onError = payload => {
    const { error, level } = payload;

    level === 'error' ? console.error(error) : console.warn(error);
    NewToaster.show({
      message: error,
      className: level === 'error' ? 'danger' : 'warning',
      iconName: 'pt-icon-thumbs-down'
    });
  };

  _onLayoutChange = action((gridLayout: *, oldItem: *, newItem: *) => {
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
    const { rowHeight, rows, cols } = this.state;

    return (
      <div className="PerformancePanel">
        <div className="performanceNavBar">
          <div className="title">{globalString('performance/title')}</div>
          <div className="performanceSubNavBar">
            <div className="subtitle os">
              {globalString('performance/section_headers/os')}
            </div>
            <div className="subtitle mongo">
              {globalString('performance/section_headers/mongo')}
            </div>
          </div>
        </div>
        <hr className="osDivider" />
        <ResponsiveReactGridLayout
          className="GridLayout"
          onDragStop={this._onLayoutChange}
          onResizeStop={this._onLayoutChange}
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
          bFitHeight
        >
          {widgets.values().map(widget => this._getWidgetComponent(widget))}
        </ResponsiveReactGridLayout>
        <Button
          className="close-button pt-button pt-intent-primary"
          text="X"
          onClick={() => api.closePerformancePanel(profileId)}
        />
      </div>
    );
  }
}
