/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-07-31T13:06:24+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-05-28T16:24:47+10:00
 */

import _ from 'lodash';
import { action, observable, runInAction } from 'mobx';
import uuidV1 from 'uuid';
import { EditorTypes } from '#/common/Constants';
import { featherClient } from '~/helpers/feathers';
import { Broker, EventType } from '~/helpers/broker';
import { ProfileStatus } from '#/common/Constants';
import StaticApi from './static';
import { performancePanelStatuses } from './PerformancePanel';

export type Profile = {
  id: string,
  // basic Form Fields
  alias: string,
  useBasicConfig: boolean, // might need to sanitize
  host: string,
  port: number,
  database: string,
  urlRadio: boolean, // true if connecting via URL
  hostRadio: boolean, // depricated but should be equal to (!urlRadio)
  url: string,
  ssl: boolean,
  sslAllowInvalidCertificates: boolean,
  sha: boolean,
  username: string,
  password: string,
  authenticationDatabase: string,
  // cluster Form Fields
  useClusterConfig: boolen, // flag to use cluster config instead of basic config
  hostsList: string,
  replicaSetName: string,
  w: string,
  wtimeoutMS: number,
  journal: boolen,
  readPref: string,
  urlClusterRadio: boolen, // true if connecting via Cluster URL
  urlCluster: string,
  databaseCluster: string,
  sslCluster: boolean,
  sslAllowInvalidCertificatesCluster: boolean,
  shaCluster: boolean,
  usernameCluster: string,
  passwordCluster: string,
  authenticationDatabaseCluster: string,
  // SSH Form Fields
  ssh: boolean,
  remoteHost: string, // host for ssh
  sshPort: number,
  remoteUser: string,
  remotePass: string,
  sshTunnel: boolean,
  keyRadio: boolean,
  passRadio: boolean, // depricated but inverse of keyRadio
  sshKeyFile: string,
  passPhrase: string,
  // SSH other variables
  sshLocalPort: number, // random local port for tunneling
  // Other Variables
  shellId: string,
  status: ProfileStatus,
  dbVersion: string,
  shellVersion: string,
  initialMsg: string,
  mongoType: string,
  authorization: boolean, // probably depricated variable
  bPassPhrase: boolean, // true if user has entered a passPhrase for the SSH key
  bRemotePass: boolen, // true if user has entered a remotePass for SSH
  bReconnect: boolean, // Boolean variable to be set when profile is reconnected from profileList
  test: boolean,
  usePasswordStore: boolean
};

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
    this.saveProfile = this.saveProfile.bind(this);
  }

  setToasterCallback(callBack: (strErrorCode: String, err: Error | null) => void) {
    this.toasterCallback = callBack;
  }

  getProfiles() {
    const { profiles } = this.profileStore;
    return profiles;
  }

  /**
   * validate connection form data
   *
   * @param data
   * @returns {boolean}
   */
  validateConnectionFormData(data: Profile): boolean {
    const { profiles } = this.profileStore;
    let validate = true;
    profiles.forEach(value => {
      if (value.alias === data.alias) {
        this.toasterCallback && this.toasterCallback('existingAlias');
        validate = false;
      }
    });
    return validate;
  }

  @action
  async connectProfile(data: Profile): Promise {
    const { profileList } = this.store;
    let { selectedProfile } = profileList;
    if (data && data.id) {
      selectedProfile = this.store.profileStore.profiles.get(data.id);
    }

    let edit = false;
    if (selectedProfile) {
      edit = true;
    }
    if (!edit && !this.validateConnectionFormData(data)) {
      runInAction('Turn off loading spinner in dialog.', () => {
        this.store.layout.alertIsLoading = false;
      });

      return Promise.reject(globalString('connection/validationError'));
    }
    const query = {};
    let connectionUrl;
    // fix to add hostRadio variable if it is not present
    if (data.hostRadio === null || data.hostRadio === undefined) {
      data.hostRadio = !data.urlRadio;
    }

    if (data.useClusterConfig) {
      connectionUrl = data.urlCluster;
      if (data.shaCluster) {
        query.username = data.usernameCluster;
        query.password = data.passwordCluster;
        query.authenticationDatabase = data.authenticationDatabaseCluster;
      }
      if (data.sslCluster) {
        connectionUrl.indexOf('?') > 0
          ? (connectionUrl += '&ssl=true')
          : (connectionUrl += '?ssl=true');
      }

      query.database = data.databaseCluster;
      query.ssl = data.sslCluster;
      query.sslAllowInvalidCertificates = data.sslAllowInvalidCertificatesCluster;
    } else {
      if (data.hostRadio) {
        // we can remove this check and use url by default but I kept it for the case of old profiles
        connectionUrl = StaticApi.mongoProtocol + data.host + ':' + data.port;
      } else if (data.urlRadio) {
        connectionUrl = data.url;
      }
      if (data.sha) {
        query.username = data.username;
        query.password = data.password;
        query.authenticationDatabase = data.authenticationDatabase;
      }
      if (data.ssl) {
        connectionUrl.indexOf('?') > 0
          ? (connectionUrl += '&ssl=true')
          : (connectionUrl += '?ssl=true');
      }

      query.database = data.database;
      query.ssl = data.ssl;
      query.sslAllowInvalidCertificates = data.sslAllowInvalidCertificates;
    }

    let terminalQuery = null;
    // fix to add passRadio variable if it is not present
    if (data.passRadio === null || data.passRadio === undefined) {
      data.passRadio = !data.keyRadio;
    }
    if (data.ssh) {
      query.ssh = data.ssh;
      query.sshTunnel = data.sshTunnel;
      query.sshPort = data.sshPort;
      query.remoteHost = data.host;
      query.remotePort = data.port;
      query.sshHost = data.remoteHost;
      query.remoteUser = data.remoteUser;
      query.localHost = '127.0.0.1';
      data.sshLocalPort = await StaticApi.getRandomPort();
      query.localPort = data.sshLocalPort;

      terminalQuery = {
        username: data.remoteUser,
        host: data.remoteHost,
        port: data.sshPort
      };

      if (data.sshTunnel) {
        connectionUrl = StaticApi.mongoProtocol + query.localHost + ':' + query.localPort;
      }
      if (data.passRadio) {
        query.remotePass = data.remotePass;
        terminalQuery.password = data.remotePass;
      } else if (data.keyRadio) {
        query.sshKeyFile = data.sshKeyFile;
        query.passPhrase = data.passPhrase;

        terminalQuery.privateKey = data.sshKeyFile;
        terminalQuery.passPhrase = data.passPhrase;
      }
    }

    query.url = connectionUrl;
    if (data.test) {
      query.test = data.test;
    }
    if (data.authorization) {
      query.authorization = data.authorization;
    }

    if (selectedProfile) {
      query.id = selectedProfile.id;
      query.shellId = selectedProfile.shellId;
    }
    query.usePasswordStore = this.config.settings.passwordStoreEnabled;

    profileList.creatingNewProfile = true;
    const service = featherClient().service('/mongo-connection');
    service.timeout = 30000;
    // Mark profile status as connecting
    if (selectedProfile) {
      runInAction('Mark profile status to connecting', () => {
        selectedProfile.status = ProfileStatus.CONNECTING;
      });
    }
    return service
      .create({}, { query })
      .then(res => {
        if (terminalQuery) {
          terminalQuery.profileId = res.id;
          this.api.addSshTerminal(terminalQuery, {
            switchToUponCreation: false,
            skipWhenExisting: true,
            eagerCreation: true
          });
        }
        runInAction('Turn off loading spinner in dialog.', () => {
          this.store.layout.alertIsLoading = false;
        });
        this.onSuccess(res, data);
      })
      .catch(err => {
        runInAction('Turn off loading spinner in dialog.', () => {
          this.store.layout.alertIsLoading = false;
          if (selectedProfile) {
            selectedProfile.status = ProfileStatus.CLOSED;
          }
        });
        l.error('Failed to add SSH Terminal:', err);
        this.onFail();
        this.toasterCallback && this.toasterCallback('connectionFail', err);
      });
  }

  @action
  onFail() {
    const { profileList } = this.store;
    profileList.creatingNewProfile = false;
  }

  /**
   * when connection successfully created, this method will add the new profile on store.
   */
  @action
  onSuccess(res: any, data: Profile) {
    const { profileList, editors } = this.store;
    const { profiles } = this.profileStore;
    const { selectedProfile } = profileList;
    let edit = false;
    if (selectedProfile && selectedProfile.id === res.id) {
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
      const { passwordStoreEnabled } = this.config.settings;
      const storeNeedsPassword = passwordStoreEnabled
        ? this.api.passwordApi.isProfileMissingFromStore(res.id)
        : false;
      const storeNeedsRemotePassword = passwordStoreEnabled
        ? this.api.passwordApi.isProfileMissingFromStore(`${res.id}-s`)
        : false;
      if (passwordStoreEnabled && storeNeedsPassword) {
        this.api.passwordApi.removeMissingStoreId(res.id);
      }
      if (passwordStoreEnabled && storeNeedsRemotePassword) {
        this.api.passwordApi.removeMissingStoreId(`${res.id}-s`);
      }
      const profileData = _.omit(data, ['password', 'passPhrase', 'remotePass', 'passwordCluster']);
      l.debug(profileData);
      const profile: Profile = {
        ...profileData,
        id: res.id,
        shellId: res.shellId,
        status: ProfileStatus.OPEN,
        initialMsg: res.output ? res.output.join('\r') : '',
        dbVersion: res.dbVersion,
        shellVersion: res.shellVersion,
        mongoType: res.mongoType
      };
      l.debug('profile:', profile);
      if (!data.bReconnect) {
        if (data.passPhrase && data.passPhrase != '') {
          profile.bPassPhrase = true;
        } else {
          profile.bPassPhrase = false;
        }
        if (data.remotePass && data.remotePass != '') {
          // removed (|| data.bRemotePass) because if a user is editing the profile he can remove the password if the server configuration has changed.
          profile.bRemotePass = true;
        } else {
          profile.bRemotePass = false;
        }
      }
      profiles.set(res.id, profile);
      profileList.selectedProfile = profiles.get(res.id);
      if (data.bReconnect) {
        Broker.emit(EventType.RECONNECT_PROFILE_CREATED, profiles.get(res.id));
        editors.forEach((value, _) => {
          if (value.shellId == res.shellId) {
            // the default shell is using the same shell id as the profile
            value.status = ProfileStatus.OPEN;
          } else if (value.profileId === res.id) {
            featherClient()
              .service('/mongo-shells')
              .create(
                {
                  id: res.id
                },
                {
                  query: {
                    shellId: value.shellId
                  }
                }
              )
              .then(() => {
                value.status = ProfileStatus.OPEN;
              })
              .catch(err => {
                l.error('failed to create shell connection', err);
              });
          }
        });
      } else {
        this.store.hideConnectionPane();
        Broker.emit(EventType.NEW_PROFILE_CREATED, profiles.get(res.id));
      }

      this.api.hasPerformancePanel(profile.id) &&
        this.api.transformPerformancePanel(profile.id, performancePanelStatuses.background);
    }
    this.toasterCallback && this.toasterCallback('connectionSuccess');
  }
  @action
  saveProfile(formData) {
    const { profileList } = this.store;
    const { profiles } = this.profileStore;
    const { selectedProfile } = profileList;
    const edit = selectedProfile !== undefined && selectedProfile !== null;

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
    this.store.hideConnectionPane();
  }

  /**
   * called when there is new connection profile get created.
   *
   * @param profile the newly created connection profile
   */
  @action.bound
  profileCreated(profile: Profile) {
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
      const doc = StaticApi.createNewDocumentObject(content, 'MongoScript');
      doc.lineSep = StaticApi.determineEol(content);

      const fileName = this.api.editorApi.getUnsavedEditorInternalFileName(EditorTypes.DEFAULT);
      const editorId = uuidV1();
      editors.set(
        editorId,
        observable(
          {
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
            doc,
            status: profile.status,
            path: null,
            type: EditorTypes.DEFAULT
          },
          {
            doc: observable.ref
          }
        )
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
