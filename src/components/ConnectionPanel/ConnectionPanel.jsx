/**
 * create new profile form and handle connection
 */
import React from 'react';
import { action } from 'mobx';
import { inject, observer } from 'mobx-react';
import { Intent, Position } from '@blueprintjs/core';
import { createForm } from './ProfileForm';
import Panel from './Panel';
import { featherClient } from '../../helpers/feathers';
import { DBenvyToaster } from '../common/Toaster';

const form = createForm();

const ConnectionPanel = (
  { profiles, editors, editorPanel, editorToolbar, profileList, layout },
) => {
  const connect = action((data) => {
    if (!validateConnectionFormData(data)) {
      return;
    }
    profileList.creatingNewProfile = true;
    return featherClient()
      .service('/mongo-connection')
      .create({}, {
        query: data,
      })
      .then((res) => {
        profileList.creatingNewProfile = false;
        console.log('get response', res);
        let message = 'Connection Success!';
        let position = Position.LEFT_BOTTOM;
        if (!data.test) {
          position = Position.RIGHT_TOP;
          form.reset();
          profiles.set(res.id, {
            ...data,
            shellId: res.shellId,
            password: '******',
            status: 'OPEN',
          });
          setTimeout(setEditorStatus(res, data), 100);
        } else {
          message = 'Test ' + message;
        }
        DBenvyToaster(position).show({
          message,
          intent: Intent.SUCCESS,
          iconName: 'pt-icon-thumbs-up',
        });
      })
      .catch((err) => {
        console.log('connection failed ', err);
        profileList.creatingNewProfile = false;
        DBenvyToaster(Position.LEFT_BOTTOM).show({
          message: err.message,
          intent: Intent.DANGER,
          iconName: 'pt-icon-thumbs-down',
        });
      });
  });

  const setEditorStatus = action((res, data) => {
    layout.drawerOpen = false;
    editors.set(res.id, {
      // eslint-disable-line react/prop-types
      id: res.id,
      alias: data.alias,
      shellId: res.shellId,
      visible: true,
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

  /**
   * validate connection form data
   *
   * @param data
   * @returns {boolean}
   */
  const validateConnectionFormData = (data) => {
    let validate = true;
    profiles.forEach((value, key) => {
      if (value.alias === data.alias) {
        DBenvyToaster(Position.LEFT_BOTTOM).show({
          message: 'Alias already existed.',
          intent: Intent.DANGER,
          iconName: 'pt-icon-thumbs-down',
        });
        validate = false;
      }
    });
    return validate;
  };

  return <Panel form={form} connect={connect} />;
};

export default inject(allStores => ({
  profiles: allStores.store.profiles,
  editors: allStores.store.editors,
  editorPanel: allStores.store.editorPanel,
  editorToolbar: allStores.store.editorToolbar,
  profileList: allStores.store.profileList,
  layout: allStores.store.layout,
}))(observer(ConnectionPanel));
