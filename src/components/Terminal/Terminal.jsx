/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-11-08T15:08:22+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2017-11-18T09:42:15+11:00
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
import ReactResizeDetector from 'react-resize-detector';
import { ContextMenu, Menu, MenuItem } from '@blueprintjs/core';
import { type ObservableMap, reaction } from 'mobx';
import { inject } from 'mobx-react';
import _ from 'lodash';
import Xterm from 'xterm/build/xterm';
import fitAddon from 'xterm/lib/addons/fit/fit';
import searchAddon from 'xterm/lib/addons/search/search';
import winptyCompatAddon from 'xterm/lib/addons/winptyCompat/winptyCompat';
import 'xterm/build/xterm.css';
import styles from './Terminal.scss';

fitAddon(Xterm);
searchAddon(Xterm);
winptyCompatAddon(Xterm);

const DEBOUNCE_DELAY = 100;

type Store = {
  outputPanel: *,
  editorPanel: *,
  editors: ObservableMap<*>,
};

type Props = {
  store: Store,
  tabId: string,
  attach: (xterm: Xterm) => void,
  detach: (xterm: Xterm) => void,
  send: (code: string) => void,
  onResize: (xterm: Xterm, size: { cols: number, rows: number }) => void,
};

// $FlowIssue
@inject(({ store }) => {
  const { outputPanel, editorPanel, editors } = store;

  return {
    store: {
      outputPanel,
      editorPanel,
      editors,
    },
  };
})
export default class Terminal extends React.PureComponent<Props> {
  reactions = [];
  resizeDetector: React.ElementRef<*>;
  container: React.ElementRef<*>;
  xterm: Xterm;
  _hasInitialSize = false;

  componentDidMount() {
    this.reactions.push(
      reaction(
        () => {
          const { store: { outputPanel: { currentTab } }, tabId } = this.props;

          return currentTab === tabId;
        },
        (isActive) => {
          if (isActive) {
            // fix container size undetected issue when this component is mounted behind the scene
            this.resizeDetector.componentDidMount();
            setTimeout(() => {
              this.xterm.focus();
            }, 100);
          }
        },
      ),
    );

    this.xterm = new Xterm({
      enableBold: false,
      theme: {
        foreground: styles.terminalForeground,
        background: styles.terminalBackground,
      },
    });
    this.xterm.open(this.container);
    this.xterm.winptyCompatInit();
    setTimeout(() => {
      this.xterm.focus();
    }, 100);

    const { attach, onResize } = this.props;

    this.xterm.on('resize', (size) => {
      if (!this._hasInitialSize) {
        this._hasInitialSize = true;
        attach(this.xterm);
      } else {
        onResize(this.xterm, size);
      }
    });
  }

  componentWillUnmount() {
    _.forEach(this.reactions, r => r());

    const { detach } = this.props;

    detach(this.xterm);

    this.xterm.destroy();
  }

  _onExecuteCommands = (all: boolean) => {
    const { store: { editorPanel, editors }, send } = this.props;
    const currEditor = editors.get(editorPanel.activeEditorId);

    if (!currEditor) return;

    const doc = currEditor.doc;
    const code = all ? doc.getValue() : doc.getSelection();

    for (const line of code.split(doc.lineSeparator())) {
      line && setTimeout(() => send(line + '\r'));
    }
  };

  _onContextMenu = (e: SyntheticMouseEvent<*>) => {
    const menu = (
      <Menu>
        <MenuItem
          onClick={() => this._onExecuteCommands(false)}
          text="Execute Selected Commands"
        />
        <MenuItem
          onClick={() => this._onExecuteCommands(true)}
          text="Execute All Commands"
        />
        <MenuItem
          onClick={() => {
            const selection = this.xterm.getSelection();
            if (selection) {
              this.xterm.findNext(selection);
            }
          }}
          text="Find Next"
        />
        <MenuItem
          onClick={() => {
            const selection = this.xterm.getSelection();
            if (selection) {
              this.xterm.findPrevious(selection);
            }
          }}
          text="Find Previous"
        />
      </Menu>
    );

    ContextMenu.show(menu, { left: e.clientX, top: e.clientY });
  };

  _onPanelResize = _.debounce(() => {
    this.xterm.charMeasure.measure(this.xterm.options);
    this.xterm.fit();
  }, DEBOUNCE_DELAY);

  render() {
    return (
      <div className="Terminal" onContextMenu={this._onContextMenu}>
        <div className="Container" ref={ref => (this.container = ref)} />
        <ReactResizeDetector
          ref={ref => (this.resizeDetector = ref)}
          handleWidth
          handleHeight
          onResize={this._onPanelResize}
        />
      </div>
    );
  }
}
