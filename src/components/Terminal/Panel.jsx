/**
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-11-08T15:08:22+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2017-11-10T02:48:57+11:00
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
import * as Xterm from 'xterm/build/xterm';
import ReactResizeDetector from 'react-resize-detector';
import _ from 'lodash';
import 'xterm/build/addons/attach/attach';
import 'xterm/build/addons/fit/fit';
// import 'xterm/build/addons/search/search';
// import 'xterm/build/addons/winptyCompat/winptyCompat';
import 'xterm/build/xterm.css';
import './Panel.scss';

const DEBOUNCE_DELAY = 100;

type Props = {
  id: string,
  profileId: string,
};

type State = {};

export default class TerminalTest extends React.PureComponent<Props, State> {
  container: React.ElementRef<*>;
  xterm;
  pid;

  componentDidMount() {
    this.xterm = new Xterm();
    this.xterm.open(this.container);
    // this.xterm.fit();
    // this.xterm.winptyCompatInit();

    this.xterm.on('resize', (size) => {
      if (!this.pid) {
        return;
      }

      fetch(
        `http://localhost:3001/terminals/${this.pid}/size?cols=${size.cols}&rows=${size.rows}`,
        {
          method: 'POST',
        },
      );
    });

    fetch('http://localhost:3001/terminals?cols=' + this.xterm.cols + '&rows=' + this.xterm.rows, {
      method: 'POST',
    }).then((res) => {
      res.text().then((pid) => {
        this.pid = pid;
        const socket = new WebSocket(`ws://localhost:3001/terminals/${pid}`);
        socket.onopen = () => {
          this.xterm.attach(socket);
        };
      });
    });
  }

  _onPanelResize = _.debounce(() => {
    this.xterm.fit();
  }, DEBOUNCE_DELAY);

  render() {
    return (
      <div className="Terminal">
        <div className="Container" ref={ref => (this.container = ref)} />
        <ReactResizeDetector handleWidth handleHeight onResize={this._onPanelResize} />
      </div>
    );
  }
}
