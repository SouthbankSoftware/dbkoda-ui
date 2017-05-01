/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-05T15:56:11+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-01T09:55:59+10:00
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
    this.dynamicForm = CreateForm(
      treeActionPanel,
      updateDynamicFormCode,
      this.executeCommand
    );
  }
  componentDidMount() {
    this.dynamicForm.getData();
  }
  executeCommand = (content) => {
    const execute = (content) => {
      let id = null;
      let shell = null;
      const editor = this.props.store.editors.get(
        this.props.store.treeActionPanel.treeActionEditorId
      );
      shell = editor.shellId;
      id = editor.id;
      if (shell && id && shell != '' && id != '') {
        const service = featherClient().service('/mongo-sync-execution');
        service.timeout = 30000;
        return new Promise((resolve, reject) => {
          service
            .update(id, {
              shellId: shell, // eslint-disable-line
              commands: content
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

    if (this.props.store.treeActionPanel.treeActionEditorId != '') {
      execute(content);
    } else {
      setTimeout(this.executeCommand, 500, content);
    }
  };
  dynamicForm;
  render() {
    console.log(this);
    return (
      <View
        title={this.dynamicForm.title}
        mobxForm={this.dynamicForm.mobxForm}
      />
    );
  }
}
