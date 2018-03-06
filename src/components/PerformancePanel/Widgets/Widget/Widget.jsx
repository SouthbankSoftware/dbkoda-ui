/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-12-14T12:22:05+11:00
 * @Email:  guan@southbanksoftware.com
 * @Last modified by:   mike
 * @Last modified time: 2018-03-06T14:32:54+11:00
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
import { observer } from 'mobx-react';
import type { PerformancePanelState } from '~/api/PerformancePanel';
import type { WidgetState } from '~/api/Widget';
import ErrorView from '#/common/ErrorView';
import _ from 'lodash';
import ReactResizeDetector from 'react-resize-detector';
// $FlowFixMe
import { Popover2 } from '@blueprintjs/labs';
// $FlowFixMe
import { PopoverInteractionKind } from '@blueprintjs/core';
import type { WidgetValue } from '~/api/Widget';
import InfoIcon from '~/styles/icons/explain-query-icon.svg';
import HistoryView from './HistoryView';
import AlarmView from './AlarmView';
import './Widget.scss';

const DEBOUNCE_DELAY = 100;
const HISTORY_VIEW_WIDTH = 537;
const HISTORY_VIEW_HEIGHT = 257;

export type Projection = { [string]: (value: WidgetValue) => number };

type Props = {
  performancePanel: PerformancePanelState,
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

  _onResize = _.debounce((...args) => {
    _.invoke(this.props, 'onResize', ...args);
  }, DEBOUNCE_DELAY);

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
      widget: {
        state,
        errorLevel,
        error,
        values,
        name,
        alarms,
        title,
        infoWidget,
        description,
        showHorizontalRule,
        showVerticalRule,
        showVerticalRuleLeft,
        showAlarms,
        rowText,
        type,
        panelTitle,
        unit
      },
      widgetStyle
    } = this.props;
    const { projection } = this.state;
    let className = 'parentWidgetWrapper';
    if (title) {
      className += ' title';
    }
    return (
      // $FlowFixMe
      <div
        className={(title || '') + ' ' + type + ' Widget' || 'Widget'}
        style={widgetStyle}
      >
        {state === 'error' ? (
          <ErrorView title={null} error={error} errorLevel={errorLevel} />
        ) : (
          <div className={className}>
            {title && (
              <div className="header">
                <b className="title">{title}</b>
                {infoWidget && (
                  <span className="toolTip">
                    <Popover2
                      minimal
                      interactionKind={PopoverInteractionKind.HOVER}
                      popoverClassName="StackedRadialWidgetTooltip"
                      className="toolTip"
                      content={<div>{description}</div>}
                      target={
                        <InfoIcon
                          className="infoButton"
                          width={20}
                          height={20}
                        />
                      }
                    />
                  </span>
                )}
                {showAlarms &&
                  alarms && <AlarmView category={showAlarms} alarms={alarms} />}
              </div>
            )}
            <Popover2
              minimal
              popoverClassName="HistoryViewPopover"
              content={
                <HistoryView
                  width={HISTORY_VIEW_WIDTH}
                  height={HISTORY_VIEW_HEIGHT}
                  values={values}
                  unit={unit}
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
            {showVerticalRuleLeft && <hr className="verticalLeft" />}
            {showHorizontalRule && <hr />}
            {showVerticalRule && <hr className="vertical" />}
            {rowText && <div className="rowText">{rowText}</div>}
            {panelTitle && (
              <div className="panelTitle">
                <div className={'content ' + panelTitle}>{panelTitle}</div>
              </div>
            )}
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
