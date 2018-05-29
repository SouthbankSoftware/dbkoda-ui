/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2018-05-22T15:10:52+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-05-30T00:17:09+10:00
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

/* eslint-disable react/no-find-dom-node */

import _ from 'lodash';
import * as React from 'react';
import ReactDOM from 'react-dom';
import SplitPane from 'react-split-pane';
import styled from 'styled-components';
import { Icon } from '@blueprintjs/core';
import pose from 'popmotion-pose';
import shallowequal from 'shallowequal';
import { rgba } from 'polished';
import './Panel.scss';

const TB_BASE_COLOR = '#915CB6';
const ACTIVE_COLOR = `${rgba(TB_BASE_COLOR, 0.8)}`;

const ToggleButton = styled(Icon)`
  fill: ${rgba(TB_BASE_COLOR, 0.2)} !important;
  position: absolute;
  z-index: 20;
  top: ${props => (props.split === 'vertical' ? 'calc(50% - 10px)' : 'unset')};
  left: ${props => (props.split === 'horizontal' ? 'calc(50% - 10px)' : 'unset')};
  cursor: pointer;

  &:hover {
    fill: ${ACTIVE_COLOR} !important;
  }
`;

export const resizerStates = {
  P_HIDDEN: 'P_HIDDEN',
  ALL_SHOWN: 'ALL_SHOWN',
  S_HIDDEN: 'S_HIDDEN'
};

export type ResizerState = $Keys<typeof resizerStates>;

const PANE_PROPS_FILTER = [
  'size',
  'defaultSize',
  'allowedResizerState',
  'resizerState',
  'onResizerStateChanged',
  'onDragFinished',
  'onDragStarted'
];

const SHALLOW_EQUAL_FILTER = [
  'size',
  'defaultSize',
  'resizerState',
  'children',
  'onDragFinished',
  'onDragStarted'
];

const POSER_CONFIG = {
  initialPose: 'open',
  open: {
    x: 0,
    y: 0,
    rotate: 0,
    delay: 20
  },
  close: {
    x: -20,
    y: -20,
    rotate: -180,
    delay: 20
  }
};

type State = {
  size: number,
  prevPropsSize: ?number,
  resizerState: ResizerState,
  prevPropsResizerState: ?ResizerState
};

export default class EnhancedSplitPane extends React.Component<*, State> {
  pane: React.ElementRef<*>;
  primaryTB: React.ElementRef<*>;
  primaryTBPoser: *;
  secondaryTB: React.ElementRef<*>;
  secondaryTBPoser: *;

  static defaultProps = {
    split: 'vertical',
    primary: 'first',
    defaultSize: 200,
    allowResize: true,
    allowedResizerState: [resizerStates.P_HIDDEN, resizerStates.ALL_SHOWN, resizerStates.S_HIDDEN],
    defaultResizerState: resizerStates.ALL_SHOWN
  };

  state = {
    size: EnhancedSplitPane.defaultProps.defaultSize,
    prevPropsSize: null,
    resizerState: EnhancedSplitPane.defaultProps.defaultResizerState,
    prevPropsResizerState: null
  };

  constructor(props: *) {
    super(props);

    if (props.defaultSize !== undefined) {
      this.state.size = props.defaultSize;
    }

    if (props.defaultResizerState !== undefined) {
      this.state.resizerState = props.defaultResizerState;
    }
  }

  static getDerivedStateFromProps(nextProps: *, prevState: State) {
    const nextState = {};

    if (nextProps.size !== undefined && nextProps.size !== prevState.prevPropsSize) {
      nextState.prevPropsSize = nextState.size = nextProps.size;
    }

    if (
      nextProps.resizerState !== undefined &&
      nextProps.resizerState !== prevState.prevPropsResizerState
    ) {
      nextState.prevPropsResizerState = nextState.resizerState = nextProps.resizerState;
    }

    return _.isEmpty(nextState) ? null : nextState;
  }

  _onDragFinished = (size: number) => {
    // just record state without triggering reaction
    this.state.size = size;

    this._updateTBs(this.props, this.state);

    this._softDisableTBs(false);

    const { onDragFinished } = this.props;

    onDragFinished && onDragFinished(size);
  };

  _onDragStarted = () => {
    this._softDisableTBs(true);

    const { onDragStarted } = this.props;

    onDragStarted && onDragStarted();
  };

  getPaneProps = () => {
    const paneProps = _.omit(this.props, PANE_PROPS_FILTER);
    paneProps.defaultSize = this.state.size;
    paneProps.onDragFinished = this._onDragFinished;
    paneProps.onDragStarted = this._onDragStarted;

    return paneProps;
  };

  shouldComponentUpdate(nextProps: *, nextState: State) {
    if (nextState.size !== this.state.size) {
      this.setDraggedSize(nextState.size, nextProps);
    }

    const shouldUpdate = !_.every(_.omit(nextProps, SHALLOW_EQUAL_FILTER), (v, k) =>
      shallowequal(v, this.props[k])
    );

    if (!shouldUpdate) {
      // update is not going to happen, but we need to manually update these
      if (nextState.resizerState !== this.state.resizerState) {
        this.setResizerState(nextProps, nextState);
      } else if (
        nextState.resizerState === resizerStates.ALL_SHOWN &&
        nextState.size !== this.state.size
      ) {
        this.setSize(nextState.size, true);
      }
    } else {
      l.error(
        new Error(
          'EnhancedSplitPane rerendered and its performance is degraded. Please make sure props not in SHALLOW_EQUAL_FILTER are always the same.'
        )
      );
    }

    const { resizerState: prevResizerState } = this.state;

    if (nextState.resizerState !== this.state.resizerState) {
      setTimeout(() => {
        // now nextState becomes this.state. We can emit event now
        const { onResizerStateChanged } = this.props;

        onResizerStateChanged && onResizerStateChanged(this.state.resizerState, prevResizerState);
      });
    }

    return shouldUpdate;
  }

  _setupTBs = () => {
    if (this.primaryTB) {
      this.primaryTBPoser = pose(ReactDOM.findDOMNode(this.primaryTB), POSER_CONFIG);
    } else {
      this.primaryTBPoser = null;
    }

    if (this.secondaryTB) {
      this.secondaryTBPoser = pose(ReactDOM.findDOMNode(this.secondaryTB), POSER_CONFIG);
    } else {
      this.secondaryTBPoser = null;
    }
  };

  _onPrimaryTBClicked = () => {
    const { resizerState } = this.state;

    if (resizerState !== resizerStates.P_HIDDEN) {
      this.setState({ resizerState: resizerStates.P_HIDDEN });
    } else {
      this.setState({ resizerState: resizerStates.ALL_SHOWN });
    }
  };

  _onSecondaryTBClicked = () => {
    const { resizerState } = this.state;

    if (resizerState !== resizerStates.S_HIDDEN) {
      this.setState({ resizerState: resizerStates.S_HIDDEN });
    } else {
      this.setState({ resizerState: resizerStates.ALL_SHOWN });
    }
  };

  _updateTBs = (props: *, state: State) => {
    const { primary } = this.props;
    const { resizerState } = state;

    let size;
    let fill;
    let pTBShown;
    let sTBShown;

    if (resizerState === resizerStates.ALL_SHOWN) {
      size = typeof state.size === 'number' ? `${state.size}px` : state.size;
      fill = null;
      pTBShown = true;
      sTBShown = true;
    } else if (resizerState === resizerStates.P_HIDDEN) {
      size = '0%';
      fill = ACTIVE_COLOR;
      pTBShown = true;
      sTBShown = false;
    } else {
      size = '100%';
      fill = ACTIVE_COLOR;
      pTBShown = false;
      sTBShown = true;
    }

    if (this.primaryTB) {
      const primaryTBEl = ReactDOM.findDOMNode(this.primaryTB);

      if (props.split === 'vertical') {
        if (primary === 'first') {
          // $FlowFixMe
          _.assign(primaryTBEl.style, {
            top: null,
            left: size,
            bottom: null,
            right: null
          });
        } else {
          // $FlowFixMe
          _.assign(primaryTBEl.style, {
            top: null,
            left: null,
            bottom: null,
            right: size
          });
        }
      } else if (primary === 'first') {
        // $FlowFixMe
        _.assign(primaryTBEl.style, {
          top: size,
          left: null,
          bottom: null,
          right: null
        });
      } else {
        // $FlowFixMe
        _.assign(primaryTBEl.style, {
          top: null,
          left: null,
          bottom: size,
          right: null
        });
      }

      // $FlowFixMe
      primaryTBEl.style.setProperty('fill', fill, 'important');
      if (pTBShown) {
        // $FlowFixMe
        primaryTBEl.style.visibility = null;
      } else {
        // $FlowFixMe
        primaryTBEl.style.visibility = 'hidden';
      }
    }

    if (this.secondaryTB) {
      const secondaryTBEl = ReactDOM.findDOMNode(this.secondaryTB);

      if (props.split === 'vertical') {
        if (primary === 'first') {
          // $FlowFixMe
          _.assign(secondaryTBEl.style, {
            top: null,
            left: `calc(${size} - 19px)`,
            bottom: null,
            right: null
          });
        } else {
          // $FlowFixMe
          _.assign(secondaryTBEl.style, {
            top: null,
            left: null,
            bottom: null,
            right: `calc(${size} - 19px)`
          });
        }
      } else if (primary === 'first') {
        // $FlowFixMe
        _.assign(secondaryTBEl.style, {
          top: `calc(${size} - 19px)`,
          left: null,
          bottom: null,
          right: null
        });
      } else {
        // $FlowFixMe
        _.assign(secondaryTBEl.style, {
          top: null,
          left: null,
          bottom: `calc(${size} - 19px)`,
          right: null
        });
      }

      // $FlowFixMe
      secondaryTBEl.style.setProperty('fill', fill, 'important');
      if (sTBShown) {
        // $FlowFixMe
        secondaryTBEl.style.visibility = null;
      } else {
        // $FlowFixMe
        secondaryTBEl.style.visibility = 'hidden';
      }
    }
  };

  /**
   * Yep, without triggering rerender
   */
  _softDisableResizer = (disabled: boolean) => {
    const resizerEl = ReactDOM.findDOMNode(this.pane.resizer);

    // $FlowFixMe
    resizerEl.style.visibility = disabled ? 'hidden' : null;
  };

  _softDisableTBs = (disabled: boolean) => {
    const visibility = disabled ? 'hidden' : null;

    if (this.primaryTB) {
      const primaryTBEl = ReactDOM.findDOMNode(this.primaryTB);

      // $FlowFixMe
      primaryTBEl.style.visibility = visibility;
    }

    if (this.secondaryTB) {
      const secondaryTBEl = ReactDOM.findDOMNode(this.secondaryTB);

      // $FlowFixMe
      secondaryTBEl.style.visibility = visibility;
    }
  };

  componentDidMount() {
    this._setupTBs();

    this.setResizerState(this.props, this.state);
  }

  componentDidUpdate() {
    this._setupTBs();

    this.setResizerState(this.props, this.state);
  }

  setResizerState = (props: *, state: State) => {
    const { resizerState } = state;

    if (resizerState === resizerStates.ALL_SHOWN) {
      const pEl = ReactDOM.findDOMNode(this._getPrimaryPane());
      // $FlowFixMe
      pEl.style.display = '';
      const sEl = ReactDOM.findDOMNode(this._getSecondaryPane());
      // $FlowFixMe
      sEl.style.display = '';
      this.setSize(state.size, true);

      this.primaryTBPoser && this.primaryTBPoser.set('open');
      this.secondaryTBPoser && this.secondaryTBPoser.set('open');

      this._softDisableResizer(false);
    } else if (resizerState === resizerStates.P_HIDDEN) {
      const pEl = ReactDOM.findDOMNode(this._getPrimaryPane());
      // $FlowFixMe
      pEl.style.display = 'none';
      const sEl = ReactDOM.findDOMNode(this._getSecondaryPane());
      // $FlowFixMe
      sEl.style.display = '';
      this.setSize('0%', true);

      this.primaryTBPoser && this.primaryTBPoser.set('close');
      this.secondaryTBPoser && this.secondaryTBPoser.set('open');

      this._softDisableResizer(true);
    } else if (resizerState === resizerStates.S_HIDDEN) {
      const pEl = ReactDOM.findDOMNode(this._getPrimaryPane());
      // $FlowFixMe
      pEl.style.display = '';
      const sEl = ReactDOM.findDOMNode(this._getSecondaryPane());
      // $FlowFixMe
      sEl.style.display = 'none';
      this.setSize('100%', true);

      this.primaryTBPoser && this.primaryTBPoser.set('open');
      this.secondaryTBPoser && this.secondaryTBPoser.set('close');

      this._softDisableResizer(true);
    }

    this._updateTBs(props, state);
  };

  _getPrimaryPane = (): React.ElementRef<*> => {
    // assume pane ref exists
    const {
      props: { primary },
      pane1,
      pane2
    } = this.pane;

    return primary === 'first' ? pane1 : pane2;
  };

  _getSecondaryPane = (): React.ElementRef<*> => {
    // assume pane ref exists
    const {
      props: { primary },
      pane1,
      pane2
    } = this.pane;

    return primary === 'first' ? pane2 : pane1;
  };

  _getMaxVisiblePaneSize = () => {
    const {
      props: { split },
      splitPane
    } = this.pane;

    if (split === 'vertical') {
      return splitPane.offsetWidth;
    }

    return splitPane.offsetHeight;
  };

  _ensureSizeWithinVisiblePanelSize = (size: number, primary: boolean) => {
    const maxPrimarySize = this._getMaxVisiblePaneSize();
    size = Math.min(maxPrimarySize, Math.max(0, primary ? size : maxPrimarySize - size));

    return size;
  };

  /**
   * Set panel size. onDragFinished won't be fired, which means changing size through this method
   * won't be persisted
   */
  setSize = (size: number | string, primary: boolean = true): number | string => {
    let pane;

    if (typeof size === 'string') {
      pane = primary ? this._getPrimaryPane() : this._getSecondaryPane();
    } else {
      pane = this._getPrimaryPane();
      size = this._ensureSizeWithinVisiblePanelSize(size, primary);
    }

    pane.setState({ size });

    return size;
  };

  /**
   * Set panel desired size when resizer state === ALL_SHOWN
   */
  setDraggedSize = (size: number, props: *): number => {
    let { minSize } = props;

    if (minSize === undefined) {
      ({ minSize } = this.pane.props);
    }

    if (minSize !== undefined && size < minSize) {
      size = minSize;
    } else {
      let { maxSize } = props;

      if (maxSize === undefined) {
        ({ maxSize } = this.pane.props);
      }

      if (maxSize !== undefined && maxSize <= 0) {
        maxSize += this._getMaxVisiblePaneSize();
      }

      if (maxSize !== undefined && size > maxSize) {
        size = maxSize;
      }
    }

    size = this._ensureSizeWithinVisiblePanelSize(size, true);

    // just record state without triggering reaction
    this.pane.state.draggedSize = size;

    const { onDragFinished } = props;

    onDragFinished && onDragFinished(size);

    return size;
  };

  _setPaneRef = (pane: *) => {
    this.pane = pane;
  };

  _setPrimaryTBRef = (primaryTB: *) => {
    this.primaryTB = primaryTB;
  };

  _setSecondaryTBRef = (secondaryTB: *) => {
    this.secondaryTB = secondaryTB;
  };

  render() {
    const { split, primary, allowedResizerState } = this.props;

    return (
      <div className="EnhancedSplitPane">
        <SplitPane ref={this._setPaneRef} {...this.getPaneProps()} />
        {allowedResizerState.includes(resizerStates.P_HIDDEN) && (
          <ToggleButton
            ref={this._setPrimaryTBRef}
            icon={
              split === 'vertical'
                ? primary === 'first'
                  ? 'chevron-left'
                  : 'chevron-right'
                : primary === 'first'
                  ? 'chevron-up'
                  : 'chevron-down'
            }
            iconSize={20}
            split={split}
            onClick={this._onPrimaryTBClicked}
          />
        )}
        {allowedResizerState.includes(resizerStates.S_HIDDEN) && (
          <ToggleButton
            ref={this._setSecondaryTBRef}
            icon={
              split === 'vertical'
                ? primary === 'first'
                  ? 'chevron-right'
                  : 'chevron-left'
                : primary === 'first'
                  ? 'chevron-down'
                  : 'chevron-up'
            }
            iconSize={20}
            split={split}
            onClick={this._onSecondaryTBClicked}
          />
        )}
      </div>
    );
  }
}
