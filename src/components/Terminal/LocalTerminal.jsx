/**
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-11-15T10:29:13+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2017-11-15T10:58:42+11:00
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
import Xterm from 'xterm/build/xterm';
import attachAddon from 'xterm/lib/addons/attach/attach';
import Terminal from './Terminal';

attachAddon(Xterm);

type Props = {
  tabId: string,
};

export default class LocalTerminal extends React.PureComponent<Props> {
  socket: *;
  pid: *;

  _attach = (xterm: Xterm) => {
    fetch('http://localhost:3001/terminals?cols=' + xterm.cols + '&rows=' + xterm.rows, {
      method: 'POST',
    }).then((res) => {
      res.text().then((pid) => {
        this.pid = pid;
        this.socket = new WebSocket(`ws://localhost:3001/terminals/${pid}`);
        this.socket.onopen = () => {
          xterm.attach(this.socket);
        };
      });
    });
  };

  _detach = (xterm: Xterm) => {
    xterm.detach(this.socket);
  };

  _onResize = (xterm: Xterm, size: number) => {
    if (!this.pid) {
      return;
    }

    fetch(
      `http://localhost:3001/terminals/${this.pid}/size?cols=${size.cols}&rows=${size.rows}`,
      {
        method: 'POST',
      },
    );
  };

  _send = (code: string) => {
    this.socket.send(code);
  };

  render() {
    const { tabId } = this.props;

    return (
      <Terminal
        tabId={tabId}
        attach={this._attach}
        detach={this._detach}
        send={this._send}
        onResize={this._onResize}
      />
    );
  }
}
