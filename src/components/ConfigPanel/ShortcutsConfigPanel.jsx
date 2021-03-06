/**
 * @Author: Michael Harrison <mike>, Guan Gui <guiguan>
 * @Date:   2018-07-11T14:18:05+10:00
 * @Email:  mike@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-07-12T23:35:21+10:00
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
import autobind from 'autobind-decorator';
import { AnchorButton } from '@blueprintjs/core';
import {
  GlobalHotkeys,
  TerminalHotkeys,
  OutputHotkeys,
  EditorHotkeys,
  CodeMirrorHotkeys
} from '#/common/hotkeys/hotkeyList.jsx';
import { withProps } from 'recompose';
import Icon from '~/styles/icons/color/keys-icon.svg';
import MenuEntry from './MenuEntry';
import './ShortcutsConfigPanel.scss';

const MenuIcon = <Icon id="keys-icon" />;

export const ShortcutsMenuEntry = withProps({ icon: MenuIcon, disableIndicator: true })(MenuEntry);

export default class ShortcutsConfigPanel extends React.Component<*> {
  state = {
    currentGroup: 'global'
  };

  @autobind
  getToolbarHotkeys(item) {
    let jsxObj = {};
    Object.values(item).map(subItem => {
      jsxObj += (
        <div className="hotkeyItem" key={subItem.description}>
          <h4 className="hotkeyTitle">{subItem.combo}</h4>
          <p className="hotkeyDescription>">{subItem.description}</p>
        </div>
      );
    });
    return jsxObj;
  }

  @autobind
  showGlobal() {
    this.setState({ currentGroup: 'global' });
  }

  @autobind
  showTerminal() {
    this.setState({ currentGroup: 'terminal' });
  }

  @autobind
  showOutput() {
    this.setState({ currentGroup: 'output' });
  }

  @autobind
  showEditor() {
    this.setState({ currentGroup: 'editor' });
  }

  @autobind
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
            {globalShortcuts.map(item => {
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
            {subkeys.map(item => {
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
            {terminalShortcuts.map(item => {
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
            {outputShortcuts.map(item => {
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
            {editorShortcuts.map(item => {
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
            {codemirrorShortcuts.map(item => {
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
    const global = false || this.state.currentGroup === 'global';
    const terminal = false || this.state.currentGroup === 'terminal';
    const output = false || this.state.currentGroup === 'output';
    const editor = false || this.state.currentGroup === 'editor';
    const textEditing = false || this.state.currentGroup === 'codemirror';

    return (
      <div className="ShortcutsConfigPanel">
        <div className="learnShortcutsWrapper">
          <div className="groupsList">
            <div className={'welcomeButtonWrapper selected_' + global}>
              <AnchorButton
                className="welcomeMenuButton welcomePageButton"
                onClick={this.showGlobal}
              >
                Global
              </AnchorButton>
            </div>
            <div className={'welcomeButtonWrapper selected_' + terminal}>
              <AnchorButton
                className="welcomeMenuButton welcomePageButton"
                onClick={this.showTerminal}
              >
                Terminal
              </AnchorButton>
            </div>
            <div className={'welcomeButtonWrapper selected_' + output}>
              <AnchorButton
                className="welcomeMenuButton welcomePageButton"
                onClick={this.showOutput}
              >
                Output
              </AnchorButton>
            </div>
            <div className={'welcomeButtonWrapper selected_' + editor}>
              <AnchorButton
                className="welcomeMenuButton welcomePageButton"
                onClick={this.showEditor}
              >
                Editor
              </AnchorButton>
            </div>
            <div className={'welcomeButtonWrapper selected_' + textEditing}>
              <AnchorButton className="welcomeMenuButton welcomePageButton" onClick={this.showCM}>
                Text Editing
              </AnchorButton>
            </div>
          </div>
          <div className="hotkeysList">{this.renderHotkeys()}</div>
        </div>
      </div>
    );
  }
}
