/*
 * dbKoda - a modern, open source code editor, for MongoDB.
 * Copyright (C) 2017-2018 Southbank Software
 *
 * This file is part of dbKoda.
 *
 * dbKoda is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * dbKoda is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with dbKoda.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-03-30T09:57:22+11:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-08-28T14:57:08+10:00
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
import {DBKodaToaster} from '../common/Toaster';
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
        DBKodaToaster(Position.LEFT_BOTTOM).show({
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
      const profile = {
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
        ssh: data.ssh,
        remoteHost: data.remoteHost,
        remoteUser: data.remoteUser,
        passRadio: data.passRadio,
        keyRadio: data.keyRadio,
        sshKeyFile: data.sshKeyFile,
        initialMsg: res.output ? res.output.join('\r') : '',
        dbVersion: res.dbVersion,
        shellVersion: res.shellVersion,
        editorCount: 1
      };
      if ((data.passPhrase && data.passPhrase != '') || data.bPassPhrase) {
        profile.bPassPhrase = true;
      }
      if ((data.remotePass && data.remotePass != '') || data.bRemotePass) {
          profile.bRemotePass = true;
      }
      profiles.set(res.id, profile);
      profileList.selectedProfile = profiles.get(res.id);
      close();
      Broker.emit(EventType.NEW_PROFILE_CREATED, profiles.get(res.id));
    } else {
      message = globalString('connection/success');
    }
    DBKodaToaster(position).show({
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
    if (data.ssh) {
      query.ssh = data.ssh;
      query.remoteHost = data.host;
      query.remotePort = data.port;
      query.sshHost = data.remoteHost;
      query.remoteUser = data.remoteUser;
      query.localHost = '127.0.0.1';
      query.localPort = ProfileForm.getRandomPort();
      connectionUrl = ProfileForm.mongoProtocol + query.localHost + ':' + query.localPort;
      if (data.passRadio) {
        query.remotePass = data.remotePass;
      } else if (data.keyRadio) {
        query.sshKeyFile = data.sshKeyFile;
        query.passPhrase = data.passPhrase;
      }
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
        console.error(err);
        onFail();
        DBKodaToaster(Position.LEFT_BOTTOM).show({
          message: (<span dangerouslySetInnerHTML={{ __html: 'Error: ' + err.message }} />), // eslint-disable-line react/no-danger
          intent: Intent.DANGER,
          iconName: 'pt-icon-thumbs-down'
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
