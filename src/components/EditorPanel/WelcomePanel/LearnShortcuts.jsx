/**
* @Author: Michael Harrison <mike>
* @Date:   2017-04-10 14:32:37
* @Email:  mike@southbanksoftware.com
* @Last modified by:   mike
* @Last modified time: 2017-04-10 14:32:40
*/

/* eslint-disable react/no-string-refs */
import React from 'react';
import {inject, observer} from 'mobx-react';
import {AnchorButton} from '@blueprintjs/core';
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
    this.state = {
      currentGroup: 'global'
    };

    this.getToolbarHotkeys = this.getToolbarHotkeys.bind();
    this.showGlobal = this.showGlobal.bind(this);
    this.showTerminal = this.showTerminal.bind(this);
    this.showOutput = this.showOutput.bind(this);
    this.showEditor = this.showEditor.bind(this);
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
                  console.log('JSX Object: ', jsxObj);
                  return jsxObj;
  }

  showGlobal() {
    this.setState({currentGroup: 'global'});
  }
  showTerminal() {
    this.setState({currentGroup: 'terminal'});
  }
  showOutput() {
    this.setState({currentGroup: 'output'});
  }
  showEditor() {
    this.setState({currentGroup: 'editor'});
  }

  renderHotkeys() {
    const globalShortcuts = Object.values(GlobalHotkeys);
    const terminalShortcuts = Object.values(TerminalHotkeys);
    const outputShortcuts = Object.values(OutputHotkeys);
    const editorShortcuts = Object.values(EditorHotkeys);
    const subkeys = Object.values(GlobalHotkeys.editorToolbarHotkeys);
    switch (this.state.currentGroup) {
      case 'global':
        return (
          <div className="globalHotkeys">
            {globalShortcuts
            .map((item) => {
              console.log(item);
              if ('saveFile' in item) {
                return;
              }
              return (
                <div className="hotkeyItem" key={item.description}>
                  <h4 className="hotkeyTitle">{item.combo}</h4>
                  <p className="hotkeyDescription>">{item.description}</p>
                </div>
              );
            })
          }
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
      );
      case 'output':
      return (
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
      );
      case 'editor':
      return (
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
      );
    }
  }

  render() {
    // const codeMirrorHotkeys = Object.values(CodeMirrorHotkeys);
    return (
      <div className="learnShortcutsWrapper">
        <div className="groupsList" >
          <div className="welcomeButtonWrapper">
            <AnchorButton
              className="welcomeMenuButton welcomePageButton"
              onClick={this.showGlobal}>Global</AnchorButton>
          </div>
          <div className="welcomeButtonWrapper">
            <AnchorButton
              className="welcomeMenuButton welcomePageButton"
              onClick={this.showTerminal}>Terminal</AnchorButton>
          </div>
          <div className="welcomeButtonWrapper">
            <AnchorButton
              className="welcomeMenuButton welcomePageButton"
              onClick={this.showOutput}>Output</AnchorButton>
          </div>
          <div className="welcomeButtonWrapper">
            <AnchorButton
              className="welcomeMenuButton welcomePageButton"
              onClick={this.showEditor}>Editor</AnchorButton>
          </div>
        </div>
        <div className="hotkeysList">
          {this.renderHotkeys()}
        </div>
      </div>
    );
  }
}
