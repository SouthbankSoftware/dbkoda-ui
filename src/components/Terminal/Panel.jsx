/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-11-08T15:08:22+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2017-11-13T17:38:23+11:00
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
import attachAddon from 'xterm/lib/addons/attach/attach';
import fitAddon from 'xterm/lib/addons/fit/fit';
import searchAddon from 'xterm/lib/addons/search/search';
import winptyCompatAddon from 'xterm/lib/addons/winptyCompat/winptyCompat';
import 'xterm/build/xterm.css';
import './Panel.scss';

attachAddon(Xterm);
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
  data: {
    tabId: string,
  },
};

type State = {};

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
export default class Terminal extends React.PureComponent<Props, State> {
  reactions = [];
  resizeDetector: React.ElementRef<*>;
  container: React.ElementRef<*>;
  xterm: Xterm;
  socket: *;
  pid: *;

  componentDidMount() {
    this.reactions.push(
      reaction(
        () => {
          const { store: { outputPanel: { currentTab } }, data: { tabId } } = this.props;

          return currentTab === tabId;
        },
        (isActive) => {
          if (isActive) {
            // fix container size undetected issue when this component is mounted behind the scene
            this.resizeDetector.componentDidMount();
          }
        },
      ),
    );

    this.xterm = new Xterm();
    this.xterm.open(this.container);
    this.xterm.winptyCompatInit();

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
        this.socket = new WebSocket(`ws://localhost:3001/terminals/${pid}`);
        this.socket.onopen = () => {
          this.xterm.attach(this.socket);
        };
      });
    });
  }

  componentWillUnmount() {
    _.forEach(this.reactions, r => r());
    this.xterm.destroy();
  }

  _onExecuteCurrentEditorCodeHere = () => {
    const { editorPanel, editors } = this.props.store;
    const currEditor = editors.get(editorPanel.activeEditorId);

    if (!currEditor) return;

    let code = currEditor.doc.getValue();
    code = code.replace(/\n/g, '\r');
    code += '\r';

    this.socket.send(code);
  };

  _onContextMenu = (e: SyntheticMouseEvent<*>) => {
    const menu = (
      <Menu>
        <MenuItem
          onClick={this._onExecuteCurrentEditorCodeHere}
          text="Execute Current Editor Code Here"
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
