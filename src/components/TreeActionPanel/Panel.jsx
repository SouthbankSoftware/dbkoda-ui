/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-05T15:56:11+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-22T12:52:54+10:00
 */

import React from 'react';

import { action, observable, runInAction } from 'mobx';
import { inject, observer } from 'mobx-react';
import { DrawerPanes } from '#/common/Constants';
import View from './View';
import FormBuilder from './FormBuilder';


@inject('store')
@observer
export default class TreeActionPanel extends React.Component {
  componentWillMount() {
    const { treeActionPanel, updateDynamicFormCode } = this.props.store;

    const profile = this.props.store.profileList.selectedProfile;
    if (profile && profile.status == 'OPEN') {
      const editor = this.props.store.editors.get(
        this.props.store.treeActionPanel.treeActionEditorId
      );
      const formBuilder = new FormBuilder();
      this.formPromise = formBuilder.createForm(
        treeActionPanel,
        updateDynamicFormCode,
        editor
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
    } else {
      runInAction('reset to default view', () => {
        this.props.store.setDrawerChild(DrawerPanes.DEFAULT);
        this.props.store.treeActionPanel.treeActionEditorId = '';
        this.props.store.treeActionPanel.isNewFormValues = false;
      });
    }
  }

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
