/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-07-31T13:06:24+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-01-18T15:54:19+11:00
 */

import { action, observable } from 'mobx';
import uuidV1 from 'uuid';
import { EditorTypes } from '#/common/Constants';
import { ProfileForm } from '#/ConnectionPanel/ProfileForm';
import { featherClient } from '~/helpers/feathers';
import { Broker, EventType } from '~/helpers/broker';
import EventLogging from '#/common/logging/EventLogging';
import { ProfileStatus, DrawerPanes } from '#/common/Constants';
import StaticApi from './static';


export default class ProfileApi {
  store;
  api;
  config;
  profileStore;
  toasterCallback;

  constructor(store, api, profileStore, config) {
    this.store = store;
    this.api = api;
    this.config = config;
    this.profileStore = profileStore;
    // this.profiles = profileStore.profiles;
    // this.profileList = store.profileList;

    this.setToasterCallback = this.setToasterCallback.bind(this);
    this.validateConnectionFormData = this.validateConnectionFormData.bind(this);
    this.connectProfile = this.connectProfile.bind(this);
    this.onFail = this.onFail.bind(this);
    this.onSuccess = this.onSuccess.bind(this);
    this.closeConnectionPane = this.closeConnectionPane.bind(this);
    this.saveProfile = this.saveProfile.bind(this);
  }

  setToasterCallback(fn) {
    this.toasterCallback = fn;
  }

  /**
   * validate connection form data
   *
   * @param data
   * @returns {boolean}
   */
  validateConnectionFormData(data) {
    const { profiles } = this.profileStore;
    let validate = true;
    profiles.forEach((value) => {
      if (value.alias === data.alias) {
        this.toasterCallback && this.toasterCallback('existingAlias');
        validate = false;
      }
    });
    return validate;
  }

  @action
  async connectProfile(data) {
    const { profileList } = this.store;
    const { selectedProfile } = profileList;
    let edit = false;
    if (selectedProfile) {
      edit = true;
    }
    if (!edit && !this.validateConnectionFormData(data)) {
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
      query.sshTunnel = data.sshTunnel;
      query.remoteHost = data.host;
      query.remotePort = data.port;
      query.sshHost = data.remoteHost;
      query.remoteUser = data.remoteUser;
      query.localHost = '127.0.0.1';
      data.sshLocalPort = await ProfileForm.getRandomPort();
      query.localPort = data.sshLocalPort;
      if (data.sshTunnel) {
        connectionUrl =
          ProfileForm.mongoProtocol + query.localHost + ':' + query.localPort;
      }
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
      query.password = data.password;
      query.authenticationDatabase = data.authenticationDatabase;
    }
    if (data.ssl) {
      connectionUrl.indexOf('?') > 0
        ? (connectionUrl += '&ssl=true')
        : (connectionUrl += '?ssl=true');
    }

    query.database = data.database;
    query.url = connectionUrl;
    query.ssl = data.ssl;
    query.sslAllowInvalidCertificates = data.sslAllowInvalidCertificates;
    query.test = data.test;
    query.authorization = data.authorization;
    if (selectedProfile) {
      query.id = selectedProfile.id;
      query.shellId = selectedProfile.shellId;
    }

    profileList.creatingNewProfile = true;
    const service = featherClient().service('/mongo-connection');
    service.timeout = 30000;
    return service
      .create({}, { query })
      .then((res) => {
        this.onSuccess(res, data);
      })
      .catch((err) => {
        console.error(err);
        this.onFail();
        this.toasterCallback && this.toasterCallback('connectionFail', err);
      });
  }

  @action
  onFail() {
    const { profileList } = this.store;
    if (this.config.settings.telemetryEnabled) {
      EventLogging.recordManualEvent(
        EventLogging.getTypeEnum().EVENT.CONNECTION_PANEL.NEW_PROFILE.FAILED,
        EventLogging.getFragmentEnum().PROFILES,
        globalString('connection/createProfileError')
      );
    }
    profileList.creatingNewProfile = false;
  }

  /**
   * when connection successfully created, this method will add the new profile on store.
   */
   @action
  onSuccess(res, data) {
    const { profileList } = this.store;
    const { profiles } = this.profileStore;
    const { selectedProfile } = profileList;
    let edit = false;
    if (selectedProfile) {
      edit = true;
    }
    profileList.creatingNewProfile = false;
    if (!data.test) {
      if (edit) {
        profiles.delete(selectedProfile.id);
        Broker.emit(EventType.createShellOutputEvent(res.id, res.shellId), {
          id: res.id,
          shellId: res.shellId,
          output: res.output.join('\n'),
          mongoType: res.mongoType
        });
      }
      const profile = {
        id: res.id,
        shellId: res.shellId,
        password: null,
        status: ProfileStatus.OPEN,
        database: data.database,
        authenticationDatabase: data.authenticationDatabase,
        alias: data.alias,
        authorization: data.authorization,
        host: data.host,
        hostRadio: data.hostRadio,
        port: data.port,
        ssl: data.ssl,
        sslAllowInvalidCertificates: data.sslAllowInvalidCertificates,
        test: data.test,
        url: data.url,
        urlRadio: data.urlRadio,
        username: data.username,
        sha: data.sha,
        ssh: data.ssh,
        sshTunnel: data.sshTunnel,
        remoteHost: data.remoteHost,
        remoteUser: data.remoteUser,
        sshLocalPort: data.sshLocalPort,
        passRadio: data.passRadio,
        keyRadio: data.keyRadio,
        sshKeyFile: data.sshKeyFile,
        initialMsg: res.output ? res.output.join('\r') : '',
        dbVersion: res.dbVersion,
        shellVersion: res.shellVersion,
        mongoType: res.mongoType
      };
      console.debug('profile:', profile);
      if ((data.passPhrase && data.passPhrase != '') || data.bPassPhrase) {
        profile.bPassPhrase = true;
      }
      if ((data.remotePass && data.remotePass != '') || data.bRemotePass) {
        profile.bRemotePass = true;
      }
      profiles.set(res.id, profile);
      profileList.selectedProfile = profiles.get(res.id);
      this.closeConnectionPane();
      Broker.emit(EventType.NEW_PROFILE_CREATED, profiles.get(res.id));
    }
    this.toasterCallback && this.toasterCallback('connectionSuccess');
  }
  @action
  closeConnectionPane() {
    this.store.setDrawerChild(DrawerPanes.DEFAULT);
  }
  @action
  saveProfile(formData) {
    const { profileList } = this.store;
    const { profiles } = this.profileStore;
    const { selectedProfile } = profileList;
    const edit = (selectedProfile !== undefined && selectedProfile !== null);

    const profile = { ...formData, status: ProfileStatus.CLOSED };
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
    this.closeConnectionPane();
  }

  /**
    * called when there is new connection profile get created.
    *
    * @param profile the newly created connection profile
    */
  @action.bound
  profileCreated(profile) {
    const { editors, editorToolbar, editorPanel } = this.store;
    let targetEditor = null;
    for (const editor of editors.values()) {
      if (profile.id === editor.profileId) {
        targetEditor = editor;
        break;
      }
    }
    if (!targetEditor) {
      const content = '';
      const doc = StaticApi.createNewDocumentObject(content);
      doc.lineSep = StaticApi.determineEol(content);

      const fileName = this.api.editorApi.getUnsavedEditorInternalFileName(EditorTypes.DEFAULT);
      const editorId = uuidV1();
      editors.set(
        editorId,
        observable({
          id: editorId,
          alias: profile.alias,
          profileId: profile.id,
          shellId: profile.shellId,
          currentProfile: profile.id,
          fileName,
          visible: true,
          executing: false,
          shellVersion: profile.shellVersion,
          initialMsg: profile.initialMsg,
          doc: observable.ref(doc),
          status: profile.status,
          path: null,
          type: EditorTypes.DEFAULT,
        }),
      );
      if (this.api) {
        this.api.addOutput(this.store.editors.get(editorId));
      }
      editorPanel.shouldScrollToActiveTab = true;
      editorPanel.activeEditorId = editorId;
    } else if (targetEditor.id !== editorPanel.activeEditorId) {
      editorPanel.shouldScrollToActiveTab = true;
      editorPanel.activeEditorId = targetEditor.id;
    }

    editorToolbar.noActiveProfile = false;
    editorToolbar.id = profile.id;
    editorToolbar.shellId = profile.shellId;
    editorToolbar.newConnectionLoading = false;
    editorPanel.activeDropdownId = profile.id;
    editorToolbar.currentProfile = profile.id;
    editorToolbar.noActiveProfile = false;
  }
}
