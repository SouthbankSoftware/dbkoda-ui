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
import { inject, observer } from 'mobx-react';
import { AnchorButton } from '@blueprintjs/core';
import {
  GlobalHotkeys,
  TerminalHotkeys,
  OutputHotkeys,
  EditorHotkeys,
  CodeMirrorHotkeys,
} from '#/common/hotkeys/hotkeyList.jsx';

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
    this.state = {
      currentGroup: 'global',
    };

    this.getToolbarHotkeys = this.getToolbarHotkeys.bind();
    this.showGlobal = this.showGlobal.bind(this);
    this.showTerminal = this.showTerminal.bind(this);
    this.showOutput = this.showOutput.bind(this);
    this.showEditor = this.showEditor.bind(this);
    this.showCM = this.showCM.bind(this);
  }

  getToolbarHotkeys(item) {
    let jsxObj = {};
    Object.values(item).map((subItem) => {
      jsxObj += (
        <div className="hotkeyItem" key={subItem.description}>
          <h4 className="hotkeyTitle">{subItem.combo}</h4>
          <p className="hotkeyDescription>">{subItem.description}</p>
        </div>
      );
    });
    return jsxObj;
  }

  showGlobal() {
    this.setState({ currentGroup: 'global' });
  }
  showTerminal() {
    this.setState({ currentGroup: 'terminal' });
  }
  showOutput() {
    this.setState({ currentGroup: 'output' });
  }
  showEditor() {
    this.setState({ currentGroup: 'editor' });
  }
  showCM() {
    this.setState({ currentGroup: 'codemirror' });
  }

  renderHotkeys() {
    const globalShortcuts = Object.values(GlobalHotkeys);
    const terminalShortcuts = Object.values(TerminalHotkeys);
    const outputShortcuts = Object.values(OutputHotkeys);
    const editorShortcuts = Object.values(EditorHotkeys);
    const codemirrorShortcuts = Object.values(CodeMirrorHotkeys);
    const subkeys = Object.values(GlobalHotkeys.editorToolbarHotkeys);
    switch (this.state.currentGroup) {
      case 'global':
        return (
          <div className="globalHotkeys">
            {globalShortcuts.map((item) => {
              if ('saveFile' in item) {
                return;
              }
              return (
                <div className="hotkeyItem" key={item.description}>
                  <h4 className="hotkeyTitle">{item.combo}</h4>
                  <p className="hotkeyDescription>">{item.description}</p>
                </div>
              );
            })}
            {subkeys.map((item) => {
              return (
                <div className="hotkeyItem" key={item.description}>
                  <h4 className="hotkeyTitle">{item.combo}</h4>
                  <p className="hotkeyDescription>">{item.description}</p>
                </div>
              );
            })}
          </div>
        );
      default:
      case 'terminal':
        return (
          <div className="terminalHotkeys">
            {terminalShortcuts.map((item) => {
              return (
                <div className="hotkeyItem" key={item.description}>
                  <h4 className="hotkeyTitle">{item.combo}</h4>
                  <p className="hotkeyDescription>">{item.description}</p>
                </div>
              );
            })}
          </div>
        );
      case 'output':
        return (
          <div className="outputHotkeys">
            {outputShortcuts.map((item) => {
              return (
                <div className="hotkeyItem" key={item.description}>
                  <h4 className="hotkeyTitle">{item.combo}</h4>
                  <p className="hotkeyDescription>">{item.description}</p>
                </div>
              );
            })}
          </div>
        );
      case 'editor':
        return (
          <div className="editorHotkeys">
            {editorShortcuts.map((item) => {
              return (
                <div className="hotkeyItem" key={item.description}>
                  <h4 className="hotkeyTitle">{item.combo}</h4>
                  <p className="hotkeyDescription>">{item.description}</p>
                </div>
              );
            })}
          </div>
        );
      case 'codemirror':
        return (
          <div className="codemirrorHotkeys">
            {codemirrorShortcuts.map((item) => {
              return (
                <div className="hotkeyItem" key={item.description}>
                  <h4 className="hotkeyTitle">{item.combo}</h4>
                  <p className="hotkeyDescription>">{item.description}</p>
                </div>
              );
            })}
          </div>
        );
    }
  }

  render() {
    // const codeMirrorHotkeys = Object.values(CodeMirrorHotkeys);
    return (
      <div className="learnShortcutsWrapper">
        <div className="groupsList">
          <div className="welcomeButtonWrapper">
            <AnchorButton className="welcomeMenuButton welcomePageButton" onClick={this.showGlobal}>
              Global
            </AnchorButton>
          </div>
          <div className="welcomeButtonWrapper">
            <AnchorButton
              className="welcomeMenuButton welcomePageButton"
              onClick={this.showTerminal}
            >
              Terminal
            </AnchorButton>
          </div>
          <div className="welcomeButtonWrapper">
            <AnchorButton className="welcomeMenuButton welcomePageButton" onClick={this.showOutput}>
              Output
            </AnchorButton>
          </div>
          <div className="welcomeButtonWrapper">
            <AnchorButton className="welcomeMenuButton welcomePageButton" onClick={this.showEditor}>
              Editor
            </AnchorButton>
          </div>
          <div className="welcomeButtonWrapper">
            <AnchorButton className="welcomeMenuButton welcomePageButton" onClick={this.showCM}>
              Text Editing
            </AnchorButton>
          </div>
        </div>
        <div className="hotkeysList">{this.renderHotkeys()}</div>
      </div>
    );
  }
}
