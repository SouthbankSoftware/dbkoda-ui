/**
* @Author: Michael Harrison <mike>
* @Date:   2017-04-11 13:24:35
* @Email:  mike@southbanksoftware.com
* @Last modified by:   mike
* @Last modified time: 2017-04-11 13:24:39
*/

/* eslint-disable react/no-string-refs */
/* eslint-disable react/no-array-index-key */
import React from 'react';
import {inject, observer} from 'mobx-react';

/**
 * Panel for wrapping the Info List.
 * @extends {React.Component}
 */
@inject('store')
@observer
export default class Info extends React.Component {
  static propTypes = {};
  constructor(props) {
    super(props);
    this.state = {
      hotkeys: [
        {
          key: 1,
          title: 'Auto-Complete',
          hotkey: 'Ctrl+Space'
        }, {
          key: 2,
          title: 'Fold / Unfold',
          hotkey: 'Ctrl+Q'
        }, {
          key: 3,
          title: 'Search in Editor',
          hotkey: 'Command+F'
        }, {
          key: 4,
          title: 'Search / Replace in Editor,
          hotkey: 'Command+Control+Shift+F'
        }
      ]
    };
  }

  render() {
    return (
      <div className="pt-dark infoPanel">
        <h3>Hotkeys</h3>
        <div className="hotkeyItems">
          {this
            .state
            .hotkeys
            .map((item) => {
              return (
                <div key={item.key} className="hotkeyItem">
                  <h5 className="hotkeyTitle">{item.title + ': '}</h5>
                  <p>{item.hotkey}</p>
                </div>
              );
            })}
        </div>
      </div>
    );
  }
}
