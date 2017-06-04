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
import {GlobalHotkeys, TerminalHotkeys, OutputHotkeys, EditorHotkeys, CodeMirrorHotkeys} from '#/common/hotkeys/hotkeyList.jsx';

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
    const codeMirrorHotkeys = Object.values(CodeMirrorHotkeys);
    return (
      <div className="learnShortcutsWrapper">
        <div className="globalHotkeys">
          {globalShortcuts
            .map((item) => {
              return (
                <div className="hotkeyItem">
                  <h4 className="hotkeyTitle">{item.combo}</h4>
                  <p classNAme="hotkeyDescription>">{item.description}</p>
                </div>
              );
            })
          }
        </div>
        <div className="terminalHotkeys">
          {terminalShortcuts
            .map((item) => {
              return (
                <div className="hotkeyItem">
                  <h4 className="hotkeyTitle">{item.combo}</h4>
                  <p classNAme="hotkeyDescription>">{item.description}</p>
                </div>
              );
            })
          }
        </div>
        <div className="outputHotkeys">
          {outputShortcuts
            .map((item) => {
              return (
                <div className="hotkeyItem">
                  <h4 className="hotkeyTitle">{item.combo}</h4>
                  <p classNAme="hotkeyDescription>">{item.description}</p>
                </div>
              );
            })
          }
        </div>
        <div className="editorHotkeys">
          {editorShortcuts
            .map((item) => {
              return (
                <div className="hotkeyItem">
                  <h4 className="hotkeyTitle">{item.combo}</h4>
                  <p classNAme="hotkeyDescription>">{item.description}</p>
                </div>
              );
            })
          }
        </div>
      </div>
    );
  }
}
