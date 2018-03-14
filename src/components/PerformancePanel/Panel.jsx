/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-12-12T22:15:28+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   wahaj
 * @Last modified time: 2018-03-14T10:20:10+11:00
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
import { Button, Intent, Position, Tooltip } from '@blueprintjs/core';
import { observer } from 'mobx-react';
import type { PerformancePanelState } from '~/api/PerformancePanel';
import type { WidgetState } from '~/api/Widget';
import SizeProvider from './SizeProvider';
import * as widgetTypes from './Widgets';
import './Panel.scss';

const ResponsiveReactGridLayout = SizeProvider(Responsive);

type Props = {
  performancePanel: PerformancePanelState,
  onClose: () => void,
  resetHighWaterMark: (profileId: UUID) => void,
  isUnresponsive: boolean
};

@observer
/**
 * Performance Panel defines the layout and creation of widgets in the performance view
 */
export default class PerformancePanel extends React.Component<Props> {
  _getWidgetComponent(widget: WidgetState) {
    const { id, type } = widget;
    const { performancePanel } = this.props;
    const { layouts } = performancePanel;

    const layout = layouts.get(id);

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
            performancePanel={performancePanel}
            widget={widget}
            widgetStyle={layout.widgetStyle}
          />
        </div>
      );
    }
  }

  render() {
    const {
      performancePanel: { widgets, rowHeight, rows, cols, profileAlias },
      onClose,
      resetHighWaterMark,
      isUnresponsive
    } = this.props;

    return (
      <div className="PerformancePanel">
        <div className="performanceNavBar">
          <div className="performanceTitleBar">
            <div className="title">{globalString('performance/title')}</div>
            <div className="titleProfile">
              {profileAlias}
              {isUnresponsive && ' (Not Responding)'}
            </div>
            {resetHighWaterMark && (
              <Tooltip
                className="ResetButton pt-tooltip-indicator pt-tooltip-indicator-form"
                content="Reset High Water Mark"
                hoverOpenDelay={1000}
                inline
                intent={Intent.PRIMARY}
                position={Position.BOTTOM}
              >
                <Button
                  className="reset-button pt-button pt-intent-primary"
                  text="Reset HWM"
                  onClick={resetHighWaterMark}
                />
              </Tooltip>
            )}
          </div>
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
          minFitHeight={901}
        >
          {widgets.values().map(widget => this._getWidgetComponent(widget))}
        </ResponsiveReactGridLayout>
        {onClose && (
          <Button
            className="close-button pt-button pt-intent-primary"
            text="X"
            onClick={onClose}
          />
        )}
      </div>
    );
  }
}
