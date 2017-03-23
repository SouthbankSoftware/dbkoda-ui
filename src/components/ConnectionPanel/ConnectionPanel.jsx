/**
 * create new profile form and handle connection
 */
import React from 'react';
import { action } from 'mobx';
import { inject, observer } from 'mobx-react';
import { Intent, Position } from '@blueprintjs/core';
import { createForm, createFromFromProfile } from './ProfileForm';
import Panel from './Panel';
import { featherClient } from '../../helpers/feathers';
import { DBenvyToaster } from '../common/Toaster';

const ConnectionPanel = (
  { profiles, editors, editorPanel, editorToolbar, profileList, layout },
) => {
  let selectedProfile = profileList.selectedProfile;
  let edit = false;
  if (profileList.selectedProfile) {
    edit = true;
  }
  console.log('this is edit ', edit);
  const form = createForm(selectedProfile);
  form.connect = action((data) => {
    if (!edit && !validateConnectionFormData(data)) {
      return;
    }
    profileList.creatingNewProfile = true;
    console.log('create connection ', data);
    return featherClient()
      .service('/mongo-connection')
      .create({}, {
        query: data,
      })
      .then((res) => {
        onSuccess(res, data);
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

  const onSuccess = action((res, data) => {
    profileList.creatingNewProfile = false;
    console.log('get response', res);
    let message = 'Connection Success!';
    let position = Position.LEFT_BOTTOM;
    if (!data.test) {
      if (edit) {
        profiles.delete(selectedProfile.id);
      }
      position = Position.RIGHT_TOP;
      form.reset();
      profiles.set(res.id, {
        ...data,
        id: res.id,
        shellId: res.shellId,
        password: null,
        status: 'OPEN',
      });
      close();
      setTimeout(setEditorStatus(res, data), 100);
    } else {
      message = 'Test ' + message;
    }
    DBenvyToaster(position).show({
      message,
      intent: Intent.SUCCESS,
      iconName: 'pt-icon-thumbs-up',
    });
  });

  const close = action(() => {
    layout.drawerOpen = false;
  });

  const setEditorStatus = action((res, data) => {
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

  return <Panel form={form} close={close} />;
};

export default inject(allStores => ({
  profiles: allStores.store.profiles,
  editors: allStores.store.editors,
  editorPanel: allStores.store.editorPanel,
  editorToolbar: allStores.store.editorToolbar,
  profileList: allStores.store.profileList,
  layout: allStores.store.layout,
}))(observer(ConnectionPanel));
