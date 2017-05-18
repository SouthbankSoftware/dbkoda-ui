/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-05T15:56:11+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-18T09:59:36+10:00
 */

import React from 'react';
import EJSON from 'mongodb-extended-json';
import { action, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import { featherClient } from '~/helpers/feathers';
import { DrawerPanes } from '#/common/Constants';
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
    this.formPromise
      .then((res) => {
        this.dynamicForm = res;
        this.showForm(true);
        this.dynamicForm.getData();
      })
      .catch((reason) => {
        this.updateMsg(reason);
      });
  }
  executeCommand = (content) => {
    console.log('Query:', content);
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
              res = res.replace(/[\r\n\t]*/g, '');
              console.log('Result: ', res);
              res = res.replace(/ObjectId\((\"\w*\")\)/g, '$1');
              try {
                const ejson = EJSON.parse(res);
                resolve(ejson);
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
  @action.bound
  close(e) {
    e.preventDefault();
    this.props.store.setDrawerChild(DrawerPanes.DEFAULT);
    this.props.store.treeActionPanel.treeActionEditorId = '';
    this.props.store.treeActionPanel.isNewFormValues = false;
  }
  render() {
    console.log(this);
    return (
      <div className="dynamic-form">
        {this.bForm && <View
          title={this.dynamicForm.title}
          mobxForm={this.dynamicForm.mobxForm}
        />}
        {!this.bForm &&
          <div>
            <div className="tree-msg-div">
              <span>{this.msg}</span>
            </div>
            <button
              className="pt-button pt-intent-primary right-button"
              onClick={this.close}
            >
              Close
            </button>
          </div>}
      </div>
    );
  }
}
