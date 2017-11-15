/**
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-11-14T09:38:57+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2017-11-15T11:45:39+11:00
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
import Terminal from './Terminal';

type Props = {
  tabId: string,
};

export default class SshTerminal extends React.PureComponent<Props> {
  socket: *;
  pid: *;

  _attach = (_xterm: Xterm) => {
  };

  _detach = (_xterm: Xterm) => {
  };

  _onResize = (_xterm: Xterm, _size: number) => {
  };

  _send = (_code: string) => {
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
