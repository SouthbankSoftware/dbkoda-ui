/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-07-28T08:56:08+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-08-15T11:10:53+10:00
 */

 import { action, observable } from 'mobx';
 import uuidV1 from 'uuid';
 import { Intent } from '@blueprintjs/core';
 import { featherClient } from '~/helpers/feathers';
 import { NewToaster } from '#/common/Toaster';
 import EventLogging from '#/common/logging/EventLogging';
 import { ProfileStatus } from '#/common/Constants';
 import { DrawerPanes } from '#/common/Constants';

 import StaticApi from './static';

export default class EditorApi {
  store;
  api;
  constructor(store, api) {
    this.store = store;
    this.api = api;

    this.addEditor = this.addEditor.bind(this);
    this.createNewEditorFailed = this.createNewEditorFailed.bind(this);
    this.setNewEditorState = this.setNewEditorState.bind(this);
  }
  /**
   * Method for adding a new editor to an existing connection.
   *
   * @param {Object} options - options for creating new editor
   * @return {Promise}
   */
  @action
  addEditor(options = {}) {
    try {
      let editorOptions = {};
      if (options.constructor.name == 'Object') {
        editorOptions = options;
      }
      this.store.startCreatingNewEditor();
      const profileTitle = this.store.editorToolbar.newEditorForTreeAction
        ? this.store.profileList.selectedProfile.id
        : this.store.editorPanel.activeDropdownId;
      let profileId = 'UNKNOWN';
      this.store.profiles.forEach((value) => {
        if (value.id == profileTitle) {
          profileId = value.id;
        }
      });
      if (!editorOptions.type) {
        editorOptions.type = 'shell';
      }
      if (profileId == 'UNKNOWN') {
        if (this.store.userPreferences.telemetryEnabled) {
          EventLogging.recordManualEvent(
            EventLogging.getTypeEnum().EVENT.EDITOR_PANEL.NEW_EDITOR
              .FAILED_DEFAULT,
            EventLogging.getFragmentEnum().EDITORS,
            'Cannot create new Editor for Default Tab.',
          );
        }
        NewToaster.show({
          message: globalString('editor/toolbar/addEditorError'),
          intent: Intent.WARNING,
          iconName: 'pt-icon-thumbs-down',
        });
        this.createNewEditorFailed();
        return null;
      }
      return featherClient()
        .service('/mongo-shells')
        .create({ id: profileId })
        .then((res) => {
          return this.setNewEditorState(res, editorOptions);
        })
        .catch((err) => {
          if (this.store.userPreferences.telemetryEnabled) {
            EventLogging.recordManualEvent(
              EventLogging.getTypeEnum().ERROR,
              EventLogging.getFragmentEnum().EDITORS,
              err.message,
            );
          }
          this.store.createNewEditorFailed();
          // Object Object issue
          console.log(err);
          if (err.message == '[object Object]') {
            console.log('Error retrieved from Primus');
          } else {
            NewToaster.show({
              message: 'Error: ' + err.message,
              intent: Intent.DANGER,
              iconName: 'pt-icon-thumbs-down',
            });
          }
        });
    } catch (err) {
      if (this.store.userPreferences.telemetryEnabled) {
        EventLogging.recordManualEvent(
          EventLogging.getTypeEnum().ERROR,
          EventLogging.getFragmentEnum().EDITORS,
          err.message,
        );
      }
      NewToaster.show({
        message: err.message,
        intent: Intent.DANGER,
        iconName: 'pt-icon-thumbs-down',
      });
      this.createNewEditorFailed();
    }
  }

  @action
  createNewEditorFailed = () => {
    this.store.editorPanel.creatingNewEditor = false;
    this.store.editorToolbar.newConnectionLoading = false;
  };

  // Setting up editor after successful response from Controller, it's more than possible some of these
  // states could be removed or refactored eventually. Worth checking out when time allows.
  @action
  setNewEditorState = (res, options = {}) => {
    const { content = '' } = options;
    options = _.omit(options, ['content']);
    let fileName = `new${this.store.profiles.get(res.id).editorCount}.js`;
    if (options.type === 'aggregate') {
      fileName = 'Aggregate Builder';
    }

    const editorId = uuidV1();
    this.store.profiles.get(res.id).editorCount += 1;

    const doc = StaticApi.createNewDocumentObject(content);
    doc.lineSep = StaticApi.determineEol(content);

    this.store.editors.set(
      editorId,
      observable(
        _.assign(
          {
            id: editorId,
            alias: this.store.profiles.get(res.id).alias,
            profileId: res.id,
            shellId: res.shellId,
            currentProfile: res.id,
            fileName,
            executing: false,
            visible: true,
            shellVersion: res.shellVersion,
            initialMsg: res.output ? res.output.join('\n') : '',
            doc: observable.ref(doc),
            status: ProfileStatus.OPEN,
            path: null,
            type: options.type
          },
          options,
        ),
      ),
    );
    if (this.api) {
      this.api.addOutput(this.store.editors.get(editorId));
    }
    this.store.editorPanel.creatingNewEditor = false;
    this.store.editorToolbar.noActiveProfile = false;
    this.store.editorToolbar.id = res.id;
    this.store.editorToolbar.shellId = res.shellId;
    this.store.editorToolbar.newConnectionLoading = false;
    this.store.editorPanel.shouldScrollToActiveTab = true;
    this.store.editorPanel.activeEditorId = editorId;
    this.store.editorToolbar.currentProfile = res.id;
    this.store.editorToolbar.noActiveProfile = false;
    this.store.editorPanel.activeDropdownId = res.id;
    this.store.newConnectionLoading = false;
    this.store.editorToolbar.isActiveExecuting = false;

    if (this.store.editorToolbar.newEditorForTreeAction) {
      this.store.editorToolbar.newEditorForTreeAction = false;
      this.store.treeActionPanel.treeActionEditorId = editorId;
      this.store.treeActionPanel.newEditorCreated = true;
      const treeEditor = this.store.editors.get(editorId);
      treeEditor.fileName = 'Tree Action';
      this.store.treeActionPanel.editors.set(editorId, treeEditor);
    }

    // Set left Panel State.
    if (options.type === 'aggregate') {
      this.store.drawer.drawerChild = DrawerPanes.AGGREGATE;
    } else if (options.type === 'TreeAction') {
      this.store.drawer.drawerChild = DrawerPanes.DYNAMIC;
    } else if (options.type === 'os') {
      this.store.drawer.drawerChild = DrawerPanes.BACKUP_RESTORE;
    } else {
      this.store.drawer.drawerChild = DrawerPanes.DEFAULT;
    }

    NewToaster.show({
      message: globalString('editor/toolbar/connectionSuccess'),
      intent: Intent.SUCCESS,
      iconName: 'pt-icon-thumbs-up',
    });
    return editorId;
  };
}
