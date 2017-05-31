/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-03-30T09:57:22+11:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-05-22T14:23:36+10:00
 */

/**
 * create new profile form and handle connection
 */
import React from 'react';
import {action} from 'mobx';
import {inject, observer} from 'mobx-react';
import {Intent, Position} from '@blueprintjs/core';
import EventLogging from '#/common/logging/EventLogging';
import uuidV1 from 'uuid/v1';
import {createForm, ProfileForm} from './ProfileForm';
import Panel from './Panel';
import {featherClient} from '../../helpers/feathers';
import {DBCodaToaster} from '../common/Toaster';
import {Broker, EventType} from '../../helpers/broker';
import {ProfileStatus, DrawerPanes} from '.././common/Constants';

const ConnectionPanel = ({
                           profiles,
                           profileList,
                           setDrawerChild,
                           userPreferences,
                         }) => {
  const selectedProfile = profileList.selectedProfile;
  let edit = false;
  if (profileList.selectedProfile) {
    edit = true;
  }
  const form = createForm(selectedProfile);

  /**
   * validate connection form data
   *
   * @param data
   * @returns {boolean}
   */
  const validateConnectionFormData = (data) => {
    let validate = true;
    profiles.forEach((value) => {
      if (value.alias === data.alias) {
        DBCodaToaster(Position.LEFT_BOTTOM).show({
          message: globalString('connection/existingAlias'),
          intent: Intent.DANGER,
          iconName: 'pt-icon-thumbs-down',
        });
        validate = false;
      }
    });
    return validate;
  };

  const close = action(() => {
    console.log('close connection panel');
    setDrawerChild(DrawerPanes.DEFAULT);
  });
  /**
   * when connection successfully created, this method will add the new profile on store.
   */
  const onSuccess = action((res, data) => {
    profileList.creatingNewProfile = false;
    console.log('connect successfully ', res);
    let message = globalString('connection/success');
    let position = Position.LEFT_BOTTOM;
    if (!data.test) {
      if (edit) {
        profiles.delete(selectedProfile.id);
        Broker.emit(EventType.createShellOutputEvent(res.id, res.shellId), {id: res.id, shellId: res.shellId, output:res.output.join('\n')});
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
        initialMsg: res.output ? res.output.join('\r') : '',
        dbVersion: res.dbVersion,
        shellVersion: res.shellVersion,
        editorCount: 1
      });
      profileList.selectedProfile = profiles.get(res.id);
      close();
      Broker.emit(EventType.NEW_PROFILE_CREATED, profiles.get(res.id));
    } else {
      message = globalString('', message);
    }
    DBCodaToaster(position).show({
      message,
      intent: Intent.SUCCESS,
      iconName: 'pt-icon-thumbs-up',
    });
  });

  const onFail = action(() => {
    if (userPreferences.telemetryEnabled) {
      EventLogging.recordManualEvent(
        EventLogging.getTypeEnum().EVENT.CONNECTION_PANEL.NEW_PROFILE.FAILED,
        EventLogging.getFragmentEnum().PROFILES,
        globalString('connection/createProfileError'),
      );
    }
    profileList.creatingNewProfile = false;
  });

  const connect = action((data) => {
    if (!edit && !validateConnectionFormData(data)) {
      return Promise.reject(globalString('connection/validationError'));
    }
    const query = {};
    let connectionUrl;
    if (data.hostRadio) {
      connectionUrl = ProfileForm.mongoProtocol + data.host + ':' + data.port;
    } else if (data.urlRadio) {
      connectionUrl = data.url;
    }
    if (data.sha) {
      query.username = data.username;
      query.password = data.password;
    }
    if (data.ssl) {
      connectionUrl.indexOf('?') > 0 ? connectionUrl += '&ssl=true' : connectionUrl += '?ssl=true';
    }
    query.database = data.database;
    query.url = connectionUrl;
    query.ssl = data.ssl;
    query.test = data.test;
    query.authorization = data.authorization;
    if (selectedProfile) {
      query.id = selectedProfile.id;
      query.shellId = selectedProfile.shellId;
    }
    profileList.creatingNewProfile = true;
    console.log('Q: ', query);
    const service = featherClient().service('/mongo-connection');
    service.timeout = 30000;
    return service.create({}, {query})
      .then((res) => {
        onSuccess(res, data);
      })
      .catch((err) => {
        console.log(err.stack);
        onFail();
        DBCodaToaster(Position.LEFT_BOTTOM).show({
          message: err.message,
          intent: Intent.DANGER,
          iconName: 'pt-icon-thumbs-down',
        });
      });
  });

  const save = action((formData) => {
    const profile = {...formData, status: ProfileStatus.CLOSED};
    if (edit) {
      profile.id = selectedProfile.id;
      profile.shellId = selectedProfile.shellId;
      profiles.delete(profile.id);
    }
    if (!profile.id) {
      profile.id = uuidV1();
    }
    if (!profile.shellId) {
      profile.shellId = uuidV1();
    }
    profiles.set(profile.id, profile);
    close();
  });

  return (
    <Panel
      form={form}
      close={close}
      edit={edit}
      connect={connect}
      profiles={profiles}
      save={save}
      title={edit ? globalString('connection/editHeading') : globalString('connection/createHeading')}
    />
  );
};

export default inject(allStores => ({
  profiles: allStores.store.profiles,
  profileList: allStores.store.profileList,
  setDrawerChild: allStores.store.setDrawerChild,
  userPreferences: allStores.store.userPreferences,
}))(observer(ConnectionPanel));
