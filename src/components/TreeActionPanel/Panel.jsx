/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-05T15:56:11+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-04T19:06:47+10:00
 */

import React from 'react';
import { action, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import { featherClient } from '~/helpers/feathers';
import View from './View';
import { CreateForm } from './Components/DynamicForm';

@inject('store')
@observer
export default class TreeActionPanel extends React.Component {
  componentWillMount() {
    const { treeActionPanel, updateDynamicFormCode } = this.props.store;
    this.formPromise = CreateForm(
      treeActionPanel,
      updateDynamicFormCode,
      this.executeCommand
    );
    this.formPromise.then((res) => {
      this.dynamicForm = res;
      this.showForm(true);
      this.dynamicForm.getData();
    });
  }
  executeCommand = (content) => {
    console.log('-------------Command:', content);
    let id = null;
    let shell = null;
    const editor = this.props.store.editors.get(
      this.props.store.treeActionPanel.treeActionEditorId
    );
    shell = editor.shellId;
    id = editor.currentProfile;
    if (shell && id && shell != '' && id != '') {
      const service = featherClient().service('/mongo-sync-execution');
      service.timeout = 30000;
      return new Promise((resolve, reject) => {
        service
          .update(id, {
            shellId: shell,
            commands: content
          })
          .then((res) => {
            console.log('----------Result:', res);
            if (typeof res == 'string') {
              res = res.replace(/[\r\n]*/g, '');
              try {
                const json = JSON.parse(res);
                resolve(json);
              } catch (e) {
                console.log(e);
                resolve({});
              }
            } else {
              resolve(res);
            }
          })
          .catch((reason) => {
            console.log(
              'executeCommand:',
              'Handle rejected promise (' + reason + ') here.'
            );
            reject(reason);
          });
      });
    }
    return null;
  };
  formPromise;
  dynamicForm;
  @observable bForm = false;
  @action showForm(value) {
    this.bForm = value;
  }
  render() {
    console.log(this);
    return (
      <div>
        {this.bForm && <View
          title={this.dynamicForm.title}
          mobxForm={this.dynamicForm.mobxForm}
        />}
      </div>
    );
  }
}
