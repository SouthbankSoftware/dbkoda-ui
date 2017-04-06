/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-05T15:56:11+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-04-06T17:27:34+10:00
 */

import React from 'react';
import { inject } from 'mobx-react';
import View from './View';

@inject('store')
export default class TreeActionPanel extends React.Component {
  constructor(props) {
    super(props);

    this.populateFields();
  }

  populateFields() {
    
  }

  render() {
    return <View />;
  }
}
