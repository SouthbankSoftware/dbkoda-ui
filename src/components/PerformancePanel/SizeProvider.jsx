/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-12-13T11:48:33+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   wahaj
 * @Last modified time: 2018-02-05T10:07:11+11:00
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
import ReactDOM from 'react-dom';
import type { ComponentType as ReactComponentType } from 'react';

type Props = {
  measureBeforeMount: boolean,
  verticalGridSize: number,
  margin: [number, number],
  bFitHeight: boolean,
  rowHeight: number
};

type State = {
  width: number,
  rowHeight: number,
  height: number
};

export default (ComposedComponent: ReactComponentType<any>) =>
  class extends React.Component<Props, State> {
    static defaultProps = {
      measureBeforeMount: false,
    };

    state: State = {
      width: 1280,
      height: 0,
      rowHeight: 150,
    };

    mounted: boolean = false;

    componentDidMount() {
      this.mounted = true;

      window.addEventListener('resize', this.onWindowResize);
      // Call to properly set the breakpoint and resize the elements.
      // Note that if you're doing a full-width element, this can get a little wonky if a scrollbar
      // appears because of the grid. In that case, fire your own resize event, or set
      // `overflow: scroll` on your body.
      this.onWindowResize();
    }

    componentWillUnmount() {
      this.mounted = false;
      window.removeEventListener('resize', this.onWindowResize);
    }

    onWindowResize = () => {
      if (!this.mounted) return;

      // eslint-disable-next-line
      const node = ReactDOM.findDOMNode(this); // Flow casts this to Text | Element
      const { verticalGridSize, margin, bFitHeight, rowHeight } = this.props;
      if (bFitHeight) {
        const rowHeight =
          (window.innerHeight - (verticalGridSize - 1) * margin[1] - 2 * margin[1]) /
          verticalGridSize;
        this.setState({
          width: node instanceof HTMLElement ? node.offsetWidth : this.state.width,
          rowHeight,
        });
      } else {
        const gridHeight = (rowHeight + margin[1]) * verticalGridSize;
        this.setState({
          width: node instanceof HTMLElement ? node.offsetWidth : this.state.width,
          height: gridHeight
        });
      }
    };

    render() {
      const gridStyle = {};
      if (!this.props.bFitHeight) {
        gridStyle.height = this.state.height + 'px';
      }
      if (this.props.measureBeforeMount && !this.mounted) {
        return <div {...this.props} {...this.state} style={gridStyle} />;
      }

      return <ComposedComponent {...this.props} {...this.state} style={gridStyle} />;
    }
  };
