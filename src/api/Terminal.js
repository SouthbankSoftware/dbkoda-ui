/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-11-14T10:31:06+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-01-08T16:05:25+11:00
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

import { action, observable } from 'mobx';
import uuid from 'uuid/v1';
import autobind from 'autobind-decorator';
// $FlowFixMe
import { featherClient } from '~/helpers/feathers';
// $FlowFixMe
import { Broker, EventType } from '~/helpers/broker';
import type Xterm from 'xterm/build/xterm';
import _ from 'lodash';

export const terminalTypes = {
  local: 'local',
  ssh: 'ssh',
};

export const terminalDisplayNames = {
  local: 'Local',
  ssh: 'SSH',
};

export const terminalErrorLevels = {
  warn: 'warn',
  error: 'error',
};

export type TerminalType = $Keys<typeof terminalTypes>;
export type TerminalErrorLevel = $Keys<typeof terminalErrorLevels>;
export type TerminalState = {
  id: UUID, // same as key
  type: TerminalType,
  name: number, // a unique number within its type
  state: ComponentState,
  errorLevel: ?TerminalErrorLevel,
  error: ?string,
  reactComponent?: *, // only for UAT
};

export type SshProfile = {
  profileId: string,
  username: string,
  host: string,
  password?: string,
  privateKey?: string,
  passphrase?: string,
};

export default class TerminalApi {
  store: *;
  api: *;

  constructor(store: *, api: *) {
    this.store = store;
    this.api = api;
  }

  _findNextTerminalName(type: TerminalType): number {
    const { terminals } = this.store;
    let largestName = -1;

    for (const terminal of terminals.values()) {
      const { type: currType, name } = terminal;

      if (currType !== type) continue;

      const id = Number(name);
      if (id > largestName) {
        largestName = id;
      }
    }

    largestName += 1;
    return largestName;
  }

  // $FlowIssue
  @autobind
  getTerminalTabId(id: UUID): string {
    return `Terminal-${id}`;
  }

  // $FlowIssue
  @action.bound
  addSshTerminal(
    profile: SshProfile,
    options: { switchToUponCreation: boolean, skipWhenExisting: boolean, eagerCreation: boolean },
  ) {
    const id = uuid();
    const type = terminalTypes.ssh;
    const { profileId, username, password, host, privateKey, passphrase } = profile;
    const { switchToUponCreation = true, skipWhenExisting = false, eagerCreation = false } =
      options || {};

    if (skipWhenExisting) {
      const { terminals } = this.store;

      for (const terminal of terminals.values()) {
        if (terminal.profileId && terminal.profileId === profileId) {
          return;
        }
      }
    }

    const createTerminal = (xterm: ?Xterm) => {
      featherClient()
        .terminalService.create({
          _id: id,
          type,
          username,
          password,
          host,
          port: 22,
          privateKey,
          passphrase,
          size: xterm
            ? {
                rows: xterm.rows,
                cols: xterm.cols,
              }
            : undefined,
        })
        .then(() => {
          console.debug('Terminal created');
        })
        .catch(error => {
          Broker.emit(EventType.TERMINAL_ERROR(id), {
            error: error.message,
            level: terminalErrorLevels.error,
          });
        });
    };

    if (eagerCreation) {
      createTerminal();
    } else {
      Broker.once(EventType.TERMINAL_ATTACHING(id), createTerminal);
    }

    this.addTerminal(type, { id, profileId }, { switchToUponCreation });
  }

  // $FlowIssue
  @action.bound
  addTerminal(
    type: TerminalType,
    extraState: { id?: string },
    options: { switchToUponCreation: boolean },
  ) {
    const { terminals, outputPanel } = this.store;
    const { switchToUponCreation = true } = options || {};

    const id = (extraState && extraState.id) || uuid();
    const name = this._findNextTerminalName(type);

    const terminal: TerminalState = {
      id,
      type,
      name,
      state: 'loaded',
      errorLevel: null,
      error: null,
      ...extraState,
    };

    terminals.set(id, observable.shallowObject(terminal));

    if (switchToUponCreation) {
      outputPanel.currentTab = this.getTerminalTabId(id);
    }
  }

  _handleServiceRemoveError(error) {
    if (error.code !== 404) {
      console.error(error);
    }
  }

  _removeSshTerminal(terminal: TerminalState): Promise<*> {
    const { id } = terminal;

    return featherClient()
      .terminalService.remove(id)
      .catch(this._handleServiceRemoveError);
  }

  _removeLocalTerminal(terminal: TerminalState): Promise<*> {
    const { id } = terminal;

    return featherClient()
      .terminalService.remove(id)
      .catch(this._handleServiceRemoveError);
  }

  // $FlowIssue
  @action.bound
  removeTerminal(id: UUID) {
    const { terminals, outputPanel, editorPanel } = this.store;

    const terminal = terminals.get(id);

    if (terminal) {
      const { type } = terminal;
      const removerName = `_remove${_.upperFirst(type)}Terminal`;
      let p;

      // $FlowIssue
      if (typeof this[removerName] === 'function') {
        // $FlowIssue
        p = this[removerName](terminal);
      } else {
        p = Promise.resolve();
      }

      p.then(action(() => terminals.delete(id)));

      outputPanel.currentTab = editorPanel.activeEditorId;
    }
  }

  // $FlowIssue
  @action.bound
  removeAllTerminalsForProfile(profileId: UUID) {
    const { terminals } = this.store;

    for (const terminal of terminals.values()) {
      if (terminal.profileId && terminal.profileId === profileId) {
        this.removeTerminal(terminal.id);
      }
    }
  }
}
