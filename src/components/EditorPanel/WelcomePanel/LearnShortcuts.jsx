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
      shortcuts: [
        {
          indexKey: 1,
          title: 'Auto-Complete',
          key: 'Ctrl + Space',
          description: 'Opens the Auto-Complete Menu in the editor window at your current cursor positio' +
              'n.'
        }, {
          indexKey: 2,
          title: 'Stop Execution',
          key: 'Shift + S',
          description: 'Stop execution of a command in the currently selected editor tab.'
        }, {
          indexKey: 3,
          title: 'Stop Execution',
          key: 'Shift + S',
          description: 'Stop execution of a command in the currently selected editor tab.'
        }, {
          indexKey: 4,
          title: 'Stop Execution',
          key: 'Shift + S',
          description: 'Stop execution of a command in the currently selected editor tab.'
        }, {
          indexKey: 5,
          title: 'Stop Execution',
          key: 'Shift + S',
          description: 'Stop execution of a command in the currently selected editor tab.'
        }, {
          indexKey: 6,
          title: 'Stop Execution',
          key: 'Shift + S',
          description: 'Stop execution of a command in the currently selected editor tab.'
        }
      ]

    };
  }

  render() {
    return (
      <div className="learnShortcutsWrapper">
        {this
          .state
          .shortcuts
          .map((item) => {
            return (
              <div key={item.indexKey} className="hotkeyItem">
                <h4 className="hotkeyTitle">{item.title} - {item.key}</h4>
                <p classNAme="hotkeyDescription>">{item.description}</p>
              </div>
            );
          })
        }
      </div>
    );
  }
}
