/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-05T15:56:11+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-04-18T10:43:37+10:00
 */

import React from 'react';
import { inject, observer } from 'mobx-react';
import { featherClient } from '~/helpers/feathers';
import View from './View';
import { CreateForm } from './Components/DynamicForm';

@inject('store')
@observer
export default class TreeActionPanel extends React.Component {
  executeCommand = (content) => {
    let id = null;
    let shell = null;
    const editor = this.props.store.editors.get(
      this.props.store.treeActionPanel.treeActionEditorId,
    );
    id = editor.id;
    shell = editor.shellId;
    if (shell && id && shell != '' && id != '') {
      const service = featherClient().service('/mongo-sync-execution');
      service.timeout = 30000;
      return service.update(id, {
        shellId: shell, // eslint-disable-line
        commands: content,
      });
    }
    return null;

    // return new Promise((resolve, reject) => {
    //   console.log(content);
    //   resolve([
    //     {
    //       _id: 'admin.guy',
    //       user: 'guy',
    //       db: 'admin',
    //       credentials: {
    //         'SCRAM-SHA-1': {
    //           iterationCount: 10000,
    //           salt: 'sjNrJJJC2I8tOCakO791pw==',
    //           storedKey: '8hpBguJRQD+YSe6uuiWZM2VzC5A=',
    //           serverKey: 'SNVyV9eX+L91QRAMU5Z9yxT2nvM=',
    //         },
    //       },
    //       roles: [
    //         {
    //           role: 'userAdminAnyDatabase',
    //           db: 'admin',
    //         },
    //         {
    //           role: 'readWriteAnyDatabase',
    //           db: 'admin',
    //         },
    //         {
    //           role: 'dbAdminAnyDatabase',
    //           db: 'admin',
    //         },
    //         {
    //           role: 'clusterAdmin',
    //           db: 'admin',
    //         },
    //       ],
    //     },
    //   ]);
    // });
  };

  render() {
    console.log(this);
    const { treeActionPanel, updateDynamicFormCode } = this.props.store;
    const dynamicForm = CreateForm(treeActionPanel, updateDynamicFormCode, this.executeCommand);
    return <View title={dynamicForm.title} mobxForm={dynamicForm.mobxForm} />;
  }
}
