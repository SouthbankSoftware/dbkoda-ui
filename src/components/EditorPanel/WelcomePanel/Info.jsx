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
import {AnchorButton} from '@blueprintjs/core';

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
      tips: [
        {
          key: 1,
          title: (
            <a href="https://docs.mongodb.com/">MongoDB Documentation</a>
          ),
          content: ''
        }, {
          key: 2,
          title: (
            <a href="https://github.com/SouthbankSoftware/dbcoda">dbCoda Documentation</a>
          ),
          content: ''
        }, {
          key: 3,
          title: 'A link to some stuff: ',
          content: (
            <a href="https://mail.google.com/">Google.</a>
          )
        }, {
          key: 4,
          title: 'A button that opens preferences or something.',
          content: (<AnchorButton className="pt-button pt-icon-chevron-right pt-intent-primary" />)
        }
      ]
    };
  }

  render() {
    return (
      <div className="pt-dark infoPanel">
        <h3 className="optInBoldDBCoda">Getting Started...</h3>
        <div className="hotkeyItems">
          {this
            .state
            .tips
            .map((item) => {
              return (
                <div key={item.key} className="hotkeyItem">
                  <h5 className="hotkeyTitle">{item.title}</h5>
                  {item.content}
                </div>
              );
            })}
        </div>
      </div>
    );
  }
}
