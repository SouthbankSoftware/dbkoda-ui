/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-05T15:56:11+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-04-11T16:36:25+10:00
 */

import React from 'react';
import { observe } from 'mobx';
import { inject, observer } from 'mobx-react';
import View from './View';
import { CreateForm } from './Components/PrefilledForm';

@inject('store')
@observer
export default class TreeActionPanel extends React.Component {
  populateFields(treeNode, treeAction) {
    const prefilledForm = CreateForm(treeNode, treeAction);
    this.props.store.setTreeActionForm(prefilledForm);
    return prefilledForm;
  }

  render() {
    const {treeActionPanel} = this.props.store;
    const prefilledForm = this.populateFields(treeActionPanel.treeNode, treeActionPanel.treeAction);
    return <View title={prefilledForm.title} mobxForm={prefilledForm.mobxForm} />;
  }
}
