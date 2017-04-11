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
import News from './News.jsx';
import Info from './Info.jsx';
import './Welcome.scss';


/**
 * Panel for wrapping the Editor View and EditorToolbar.
 * @extends {React.Component}
 */
@inject('store')
@observer
export default class Panel extends React.Component {
  static propTypes = {};
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="welcomePanelWrapper">
        <h1>Welcome to DBEnvy</h1>
        <div className="pt-dark welcomePanel">
          <News />
          <Info />
        </div>
      </div>
    );
  }
}
