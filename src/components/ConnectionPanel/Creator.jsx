/**
 * create new profile form and handle connection
 */
import React from 'react';
import {action} from 'mobx';
import {inject, observer} from 'mobx-react';
import {Intent, Position} from '@blueprintjs/core';
import {createForm} from './ProfileForm';
import Panel from './Panel';
import {featherClient} from '../../helpers/feathers';
import {DBenvyToaster} from '../common/Toaster';

const form = createForm();

const Creator = ({profiles, editors, editorPanel, editorToolbar}) => {

  const connect = (data) => {
    return featherClient()
      .service('/mongo-connection')
      .create({}, {
        query: data
      })
      .then((res) => {
        console.log('get response', res);
        let message = 'Connection Success!';
        let position = Position.LEFT_BOTTOM;
        if (!data.test) {
          position = Position.RIGHT_TOP;
          form.reset();
          profiles
            .set(res.id, {...data, shellId: res.shellId, password: '******', status: 'OPEN'});
          setTimeout(setEditorStatus(res, data), 100);
        } else {
          message = 'Test ' + message;
        }
        DBenvyToaster(position).show({
          message,
          intent: Intent.SUCCESS,
          iconName: 'pt-icon-thumbs-up'
        });
      });
  };

  const setEditorStatus = action((res, data) => {
    editors // eslint-disable-line react/prop-types
      .set(res.id, {
        id: res.id,
        alias: data.alias,
        shellId: res.shellId,
        visible: true
      });
    editorToolbar.noActiveProfile = false;
    editorToolbar.id = res.id;
    editorToolbar.shellId = res.shellId;
    editorToolbar.newConnectionLoading = false;
    editorPanel.activeEditorId = data.alias + ' (' + res.shellId + ')';
    editorPanel.activeDropdownId = data.alias;
    editorToolbar.currentProfile = res.id;
    editorToolbar.noActiveProfile = false;
  });

  return (
    <Panel form={form} connect={connect}/>
  );
}

export default inject(allStores => ({
  profiles: allStores.store.profiles,
  editors: allStores.store.editors,
  editorPanel: allStores.store.editorPanel,
  editorToolbar: allStores.store.editorToolbar,
}))(observer(Creator));
