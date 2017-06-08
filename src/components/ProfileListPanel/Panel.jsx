/**
* @Author: Michael Harrison <mike>
* @Date:   2017-03-15 13:33:53
* @Email:  mike@southbanksoftware.com
 * @Last modified by:   mike
 * @Last modified time: 2017-03-15 13:33:46
*/

/* eslint-disable react/no-string-refs */
/* eslint-disable react/prop-types */
import React from 'react';
import {inject, observer} from 'mobx-react';
import DBKodaIcon from '../../styles/icons/dbkoda-logo.svg';
import Toolbar from './Toolbar.jsx';
import ListView from './ListView.jsx';
import './styles.scss';

@inject('store')
@observer
export default class Panel extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="pt-dark profileListPanel">
        <Toolbar ref="toolbar" />
        <ListView />
        <DBKodaIcon className="dbCodaLogo" width={20} height={20} />
      </div>

    );
  }
}
