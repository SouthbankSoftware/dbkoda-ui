/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-11-08T15:08:22+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-02-16T13:39:24+11:00
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
import { type ObservableMap, reaction, action } from 'mobx';
import { inject } from 'mobx-react';
import _ from 'lodash';
import { Terminal as Xterm } from 'xterm';
import * as fitAddon from 'xterm/lib/addons/fit/fit';
import * as searchAddon from 'xterm/lib/addons/search/search';
import * as winptyCompatAddon from 'xterm/lib/addons/winptyCompat/winptyCompat';
import 'xterm/dist/xterm.css';
// $FlowFixMe
import { Broker, EventType } from '~/helpers/broker';
import {
  type TerminalState,
  terminalDisplayNames,
  type TerminalErrorLevel,
  terminalErrorLevels,
} from '~/api/Terminal';
import chalk from '~/helpers/chalk';
// $FlowFixMe
import { NewToaster } from '#/common/Toaster';
import styles from './Terminal.scss';

Xterm.applyAddon(fitAddon);
Xterm.applyAddon(searchAddon);
Xterm.applyAddon(winptyCompatAddon);

const DEBOUNCE_DELAY = 100;

type Store = {
  outputPanel: *,
  editorPanel: *,
  editors: ObservableMap<*>,
  terminal: TerminalState,
};

type Props = {
  store: any | Store,
  id: UUID,
  tabId: string,
  attach: (xterm: Xterm) => void,
  detach: (xterm: Xterm) => void,
  send: (code: string) => void,
  onResize: (xterm: Xterm, size: { cols: number, rows: number }) => void,
};

@inject(({ store }, { id }) => {
  const { outputPanel, editorPanel, editors, terminals } = store;

  return {
    store: {
      outputPanel,
      editorPanel,
      editors,
      terminal: terminals.get(id),
    },
  };
})
export default class Terminal extends React.PureComponent<Props> {
  reactions = [];
  resizeDetector: React.ElementRef<*>;
  container: React.ElementRef<*>;
  xterm: Xterm;
  _hasInitialSize = false;
  _showInitialError = true;

  static defaultProps = {
    store: null,
  };

  componentDidMount() {
    this.reactions.push(
      reaction(
        () => {
          const { store: { outputPanel: { currentTab } }, tabId } = this.props;

          return currentTab === tabId;
        },
        isActive => {
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

    if (UAT) {
      const { terminal } = this.props.store;

      terminal.reactComponent = this;
      // $FlowFixMe
      terminal.__nodump__ = ['reactComponent', '__nodump__'];
    }

    const { id } = this.props;

    Broker.on(EventType.TERMINAL_ERROR(id), this._onError);

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

    this.xterm.on('resize', size => {
      if (!this._hasInitialSize) {
        this._hasInitialSize = true;

        const { state, errorLevel, error } = this.props.store.terminal;

        if (state === 'error' && this._showInitialError && errorLevel && error) {
          this._showError(error, errorLevel, false);
        }

        attach(this.xterm);
      } else {
        onResize(this.xterm, size);
      }
    });
  }

  componentWillUnmount() {
    _.forEach(this.reactions, r => r());

    if (UAT) {
      const { terminal } = this.props.store;

      terminal.reactComponent = null;
    }

    const { id } = this.props;

    Broker.off(EventType.TERMINAL_ERROR(id), this._onError);

    const { detach } = this.props;

    detach(this.xterm);

    this.xterm.destroy();
  }

  _showError = (error: string, level: TerminalErrorLevel, toaster: boolean = true) => {
    const { buffer } = this.xterm;
    const lastLine = buffer.translateBufferLineToString(buffer.ybase + buffer.y, true);
    let bgColor;
    let color;
    let className;

    if (level === terminalErrorLevels.warn) {
      bgColor = 'bgYellow';
      color = 'yellow';
      className = 'warning';
    } else {
      bgColor = 'bgRed';
      color = 'red';
      className = 'danger';
    }

    this.xterm.write(
      `${lastLine.length === 0 ? '' : '\r\n'}${chalk[bgColor].white(
        `${_.upperFirst(level)}:`,
      )} ${chalk[color](error)}\r\n`,
    );

    if (toaster) {
      const { type } = this.props.store.terminal;

      NewToaster.show({
        message: `${terminalDisplayNames[type]} Terminal: ${error}`,
        className,
        iconName: 'pt-icon-thumbs-down',
      });
    }
  };

  _onError = action.bound(({ error, level }: { error: string, level: TerminalErrorLevel }) => {
    const { terminal } = this.props.store;

    this._showInitialError = false;

    terminal.state = 'error';
    terminal.errorLevel = level;
    terminal.error = error;

    this._showError(error, level);
  });

  _onExecuteCommands = (all: boolean) => {
    const { store: { editorPanel, editors }, send } = this.props;
    const currEditor = editors.get(editorPanel.activeEditorId);

    if (!currEditor) return;

    const { doc } = currEditor;
    const code = all ? doc.getValue() : doc.getSelection();

    for (const line of code.split(doc.lineSeparator())) {
      line && setTimeout(() => send(line + '\r'));
    }
  };

  _onContextMenu = (e: SyntheticMouseEvent<*>) => {
    const menu = (
      <Menu>
        <MenuItem onClick={() => this._onExecuteCommands(false)} text="Execute Selected Commands" />
        <MenuItem onClick={() => this._onExecuteCommands(true)} text="Execute All Commands" />
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
