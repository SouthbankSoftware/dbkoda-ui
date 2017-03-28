/**
 * create new profile form and handle connection
 */
import React from 'react';
import {action} from 'mobx';
import {inject, observer} from 'mobx-react';
import {Intent, Position} from '@blueprintjs/core';
import {createForm, createFromFromProfile, ProfileForm} from './ProfileForm';
import Panel from './Panel';
import {featherClient} from '../../helpers/feathers';
import {DBenvyToaster} from '../common/Toaster';
import {Broker, EventType} from '../../helpers/broker';
import {ProfileStatus} from '.././common/Constants';

const ConnectionPanel = ({profiles, profileList, layout},) => {
  let selectedProfile = profileList.selectedProfile;
  let edit = false;
  if (profileList.selectedProfile) {
    edit = true;
  }
  const form = createForm(selectedProfile);
  const connect = action((data) => {
    if (!edit && !validateConnectionFormData(data)) {
      return Promise.reject('Validation failed.');
    }
    const query = {};
    let connectionUrl;
    if (data.hostRadio) {
      connectionUrl = ProfileForm.mongoProtocol + data.host + ':' + data.port;
    } else if (data.urlRadio) {
      connectionUrl = data.url;
    }
    if (data.sha) {
      const split = connectionUrl.split(ProfileForm.mongoProtocol);
      connectionUrl = ProfileForm.mongoProtocol + data.username + ':' + data.password + '@' + split[1];
    }
    if (data.database) {
      connectionUrl = connectionUrl + '/' + data.database;
    }
    query.url = connectionUrl;
    query.ssl = data.ssl;
    query.test = data.test;
    query.authorization = data.authorization;
    if(selectedProfile){
      query.id = selectedProfile.id;
      query.shellId = selectedProfile.shellId;
    }
    return featherClient()
      .service('/mongo-connection')
      .create({}, {
        query,
      })
      .then((res) => {
        onSuccess(res, data);
      })
      .catch((err) => {
        DBenvyToaster(Position.LEFT_BOTTOM).show({
          message: err.message,
          intent: Intent.DANGER,
          iconName: 'pt-icon-thumbs-down',
        });
      });
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

  /**
   * when connection successfully created, this method will add the new profile on store.
   */
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
        id: res.id,
        shellId: res.shellId,
        password: null,
        status: ProfileStatus.OPEN,
        database: data.database,
        alias: data.alias,
        authorization: data.authorization,
        host: data.host,
        hostRadio: data.hostRadio,
        port: data.port,
        ssl: data.ssl,
        test: data.test,
        url: data.url,
        urlRadio: data.urlRadio,
        username: data.username,
        sha: data.sha,
      });
      close();
      Broker.emit(EventType.NEW_PROFILE_CREATED, profiles.get(res.id));
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

  return <Panel form={form} close={close} connect={connect}
                title={edit ? 'Edit Connection' : 'Create New Connection'}/>;
};

export default inject(allStores => ({
  profiles: allStores.store.profiles,
  profileList: allStores.store.profileList,
  layout: allStores.store.layout,
}))(observer(ConnectionPanel));
