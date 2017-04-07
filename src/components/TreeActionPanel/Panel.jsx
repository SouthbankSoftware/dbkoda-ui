/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-05T15:56:11+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-04-07T14:33:43+10:00
 */

import React from 'react';
import { inject, observer } from 'mobx-react';
import View from './View';
import { CreateForm, PrefilledForm } from './Components/PrefilledForm';

@inject('store')
@observer
export default class TreeActionPanel extends React.Component {
  populateFields(treeNode, treeAction) {
    return CreateForm(treeNode, treeAction);
  }

  render() {
    const {drawer} = this.props.store;
    const form = this.populateFields(drawer.treeNode, drawer.treeAction);
    return <View title={form.title} form={form.mobxForm} />;
  }
}
