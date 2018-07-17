/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2018-05-20T17:32:14+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-05-29T20:18:15+10:00
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

import _ from 'lodash';
import { Doc } from 'codemirror';
import { observe, observable, action } from 'mobx';

/**
 * Represents a Output object stored in state store
 */
export default class Output {
  constructor() {
    observe(this, 'doc', ({ newValue, oldValue }) => {
      if (oldValue instanceof Doc) {
        newValue.off('change', this._onChange);
      }

      if (newValue instanceof Doc) {
        newValue.on('change', this._onChange);
      }
    });
  }

  @observable id: UUID;
  @observable connId: UUID;
  @observable shellId: UUID;
  @observable title: string;

  get output(): string {
    return this.doc.getValue();
  }

  set output(value: string) {
    return this.doc.setValue(value);
  }

  @observable.ref doc: Doc;

  _onChange = cm => {
    this._removeExpiredHistory(cm);
    this.scrollToButtom(cm);
  };

  _removeExpiredHistory = cm => {
    const maxOutputHistory = _.get(global, 'configStore.config.maxOutputHistory');

    if (maxOutputHistory !== undefined) {
      const numLines = cm.lineCount();

      if (numLines > maxOutputHistory) {
        this._removeNLines(numLines - maxOutputHistory, 0);
      }
    }
  };

  scrollToButtom = action((cm: *) => {
    const count = cm.lineCount();
    cm.setCursor(Math.max(0, count - 3), 0);
    this.lastScrollPos = null;
  });

  _removeNLines = (n: number, from: number) => {
    this.doc.replaceRange('', { line: from, ch: 0 }, { line: from + n, ch: 0 });
  };

  append = action((value: string) => {
    this.doc.replaceRange(`${value}`, { line: Infinity });
    this.shouldScrollToBottom = true;
  });

  @observable shouldScrollToBottom: boolean = false;
  @observable lastScrollPos: * = null;
  @observable cannotShowMore: boolean = true;
  @observable showingMore: boolean = false;
  @observable commandHistory: *[] = [];
  @observable enhancedJson: string = '';
  @observable tableJson: * = '';
  @observable currentExecStartLine: number = 0;
}
