/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-11-15T10:29:13+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-01-08T15:29:42+11:00
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
// $FlowFixMe
import { featherClient } from '~/helpers/feathers';
// $FlowFixMe
import { Broker, EventType } from '~/helpers/broker';
import { terminalTypes, terminalErrorLevels } from '~/api/Terminal';
import Terminal from './Terminal';

type Props = {
  id: UUID,
  tabId: string,
};

export default class LocalTerminal extends React.PureComponent<Props> {
  socket: *;
  pid: *;
  terminalService: *;
  _receive: (data: string) => void;

  constructor(props: Props) {
    super(props);

    this.terminalService = featherClient().terminalService;
  }

  _attach = (xterm: Xterm) => {
    const { id } = this.props;

    IS_DEVELOPMENT && console.debug('Attaching...');

    this.terminalService
      .create({
        _id: id,
        type: terminalTypes.local,
        size: {
          rows: xterm.rows,
          cols: xterm.cols,
        },
      })
      .then(({ payload: { new: isNew } }) => {
        if (!isNew) {
          IS_DEVELOPMENT && console.debug('Terminal already exists');
          this._send('\f');
        }
      })
      .catch(error => {
        Broker.emit(EventType.TERMINAL_ERROR(id), {
          error: error.message,
          level: terminalErrorLevels.error,
        });
      });

    this._receive = data => {
      IS_DEVELOPMENT && console.debug('Receiving: ', JSON.stringify(data));

      xterm.write(data);
    };

    Broker.on(EventType.TERMINAL_DATA(id), this._receive);

    xterm.on('data', this._send);
  };

  _detach = (xterm: Xterm) => {
    const { id } = this.props;

    IS_DEVELOPMENT && console.debug('Detaching...');

    this._receive && Broker.off(EventType.TERMINAL_DATA(id), this._receive);

    this._send && xterm.off('data', this._send);
  };

  _onResize = (xterm: Xterm, size: { cols: number, rows: number }) => {
    const { id } = this.props;

    this.terminalService.patch(id, { size });
  };

  _send = (code: string) => {
    const { id } = this.props;

    IS_DEVELOPMENT && console.debug('Sending: ', JSON.stringify(code));

    this.terminalService.patch(id, {
      cmd: code,
    });
  };

  render() {
    const { id, tabId } = this.props;

    return (
      <Terminal
        id={id}
        tabId={tabId}
        attach={this._attach}
        detach={this._detach}
        send={this._send}
        onResize={this._onResize}
      />
    );
  }
}
