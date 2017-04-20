/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-05T15:56:11+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-04-20T13:58:29+10:00
 */

import React from 'react';
import { inject, observer } from 'mobx-react';
import { featherClient } from '~/helpers/feathers';
import View from './View';
import { CreateForm } from './Components/DynamicForm';

@inject('store')
@observer
export default class TreeActionPanel extends React.Component {
  componentWillMount() {
    const { treeActionPanel, updateDynamicFormCode } = this.props.store;
    this.dynamicForm = CreateForm(treeActionPanel, updateDynamicFormCode, this.executeCommand);
  }
  componentDidMount() {
    this.dynamicForm.getData();
  }
  executeCommand = (content) => {
    let id = null;
    let shell = null;
    this.props.store.profiles.forEach((value) => {
      if (value.alias == this.props.store.editorPanel.activeDropdownId) {
        shell = value.shellId;
        id = value.id;
      }
    });
    if (shell && id && shell != '' && id != '') {
      const service = featherClient().service('/mongo-sync-execution');
      service.timeout = 30000;
      return new Promise((resolve, reject) => {
        service
          .update(id, {
            shellId: shell, // eslint-disable-line
            commands: content,
          })
          .then((res) => {
            if (typeof res == 'string') {
              const json = JSON.parse(res);
              setTimeout(resolve, 300, json);
            } else {
              setTimeout(resolve, 300, res);
            }
          })
          .catch((reason) => {
            console.log('executeCommand:', 'Handle rejected promise (' + reason + ') here.');
            reject(reason);
          });
      });
    }
    return null;
  };
  dynamicForm;
  render() {
    console.log(this);
    return <View title={this.dynamicForm.title} mobxForm={this.dynamicForm.mobxForm} />;
  }
}
