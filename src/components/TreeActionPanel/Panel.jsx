/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-05T15:56:11+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-10T13:38:42+10:00
 */

import React from 'react';
import { action, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import { featherClient } from '~/helpers/feathers';
import View from './View';
import FormBuilder from './FormBuilder';

@inject('store')
@observer
export default class TreeActionPanel extends React.Component {
  componentWillMount() {
    const { treeActionPanel, updateDynamicFormCode } = this.props.store;
    const formBuilder = new FormBuilder();
    this.formPromise = formBuilder.createForm(
      treeActionPanel,
      updateDynamicFormCode,
      this.executeCommand
    );
    this.formPromise.then((res) => {
      this.dynamicForm = res;
      this.showForm(true);
      this.dynamicForm.getData();
    }).catch((reason) => {
      this.updateMsg(reason);
    });
  }
  executeCommand = (content) => {
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
  @observable msg = '';
  @observable bForm = false;
  @action showForm(value) {
    this.bForm = value;
  }
  @action updateMsg(value) {
    this.msg = value;
  }
  render() {
    console.log(this);
    return (
      <div>
        {this.bForm && <View
          title={this.dynamicForm.title}
          mobxForm={this.dynamicForm.mobxForm}
        />}
        {!this.bForm &&
          <div className="tree-msg-div">
            <span>{this.msg}</span>
          </div>}
      </div>
    );
  }
}
