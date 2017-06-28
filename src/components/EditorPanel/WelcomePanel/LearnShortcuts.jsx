/*
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

/* eslint-disable react/no-string-refs */
import React from 'react';
import {inject, observer} from 'mobx-react';
import {GlobalHotkeys, TerminalHotkeys, OutputHotkeys, EditorHotkeys} from '#/common/hotkeys/hotkeyList.jsx';

/**
 * Panel for wrapping the Editor View and EditorToolbar.
 * @extends {React.Component}
 */
@inject('store')
@observer
export default class LearnShortcuts extends React.Component {
  static propTypes = {};
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const globalShortcuts = Object.values(GlobalHotkeys);
    const terminalShortcuts = Object.values(TerminalHotkeys);
    const outputShortcuts = Object.values(OutputHotkeys);
    const editorShortcuts = Object.values(EditorHotkeys);
    // const codeMirrorHotkeys = Object.values(CodeMirrorHotkeys);
    return (
      <div className="learnShortcutsWrapper">
        <div className="globalHotkeys">
          {globalShortcuts
            .map((item) => {
              return (
                <div className="hotkeyItem" key={item.description}>
                  <h4 className="hotkeyTitle">{item.combo}</h4>
                  <p className="hotkeyDescription>">{item.description}</p>
                </div>
              );
            })
          }
        </div>
        <div className="terminalHotkeys">
          {terminalShortcuts
            .map((item) => {
              return (
                <div className="hotkeyItem" key={item.description}>
                  <h4 className="hotkeyTitle">{item.combo}</h4>
                  <p className="hotkeyDescription>">{item.description}</p>
                </div>
              );
            })
          }
        </div>
        <div className="outputHotkeys">
          {outputShortcuts
            .map((item) => {
              return (
                <div className="hotkeyItem" key={item.description}>
                  <h4 className="hotkeyTitle">{item.combo}</h4>
                  <p className="hotkeyDescription>">{item.description}</p>
                </div>
              );
            })
          }
        </div>
        <div className="editorHotkeys">
          {editorShortcuts
            .map((item) => {
              return (
                <div className="hotkeyItem" key={item.description}>
                  <h4 className="hotkeyTitle">{item.combo}</h4>
                  <p className="hotkeyDescription>">{item.description}</p>
                </div>
              );
            })
          }
        </div>
      </div>
    );
  }
}
