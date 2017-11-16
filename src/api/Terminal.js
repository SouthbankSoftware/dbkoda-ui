/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-11-14T10:31:06+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2017-11-17T09:41:32+11:00
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

export const terminalTypes = {
  local: 'local',
  localXtermDemo: 'localXtermDemo',
  ssh: 'ssh',
};

export type TerminalType = $Keys<typeof terminalTypes>;
export type TerminalState = {
  id: UUID, // same as key
  type: TerminalType,
  name: number, // a unique number within its type
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
  addSshTerminal(profileId: string) {
    const id = uuid();
    const type = terminalTypes.ssh;

    featherClient()
      .terminalService.create({
        _id: id,
        type,
        username: 'guiguan',
        password: '',
        host: 'localhost',
        port: 22,
      })
      .then(() => {
        this.addTerminal(type, { id, profileId });
      })
      .catch(console.error);
  }

  // $FlowIssue
  @action.bound
  addTerminal(type: TerminalType, extraState: { id?: string }) {
    const { terminals, outputPanel } = this.store;

    const id = (extraState && extraState.id) || uuid();
    const name = this._findNextTerminalName(type);

    const terminal: TerminalState = {
      id,
      type,
      name,
      ...extraState,
    };

    terminals.set(id, observable.shallowObject(terminal));

    outputPanel.currentTab = this.getTerminalTabId(id);
  }

  // $FlowIssue
  @action.bound
  removeTerminal(id: UUID) {
    const { terminals } = this.store;

    terminals.delete(id);
  }

  // $FlowIssue
  @action.bound
  removeAllTerminalsForProfile(profileId: UUID) {
    const { terminals } = this.store;

    for (const terminal of terminals.values()) {
      if (terminal.profileId && terminal.profileId === profileId) {
        terminals.delete(terminal.id);
      }
    }
  }
}
