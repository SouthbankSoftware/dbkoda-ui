/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-07-28T08:56:08+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-07-19T15:41:25+10:00
 *
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

import _ from 'lodash';
import { action, observable } from 'mobx';
import uuidV1 from 'uuid';
import { NewToaster } from '#/common/Toaster';
import { EditorTypes, DrawerPanes, ProfileStatus } from '#/common/Constants';
import { featherClient } from '~/helpers/feathers';
import camelise from '~/helpers/camelise';
import { NavPanes } from '#/common/Constants';

import StaticApi from './static';

export type Editor = {
  id: string,
  profileId: string,
  shellId: string,
  alias: string,
  currentProfile: string,
  fileName: string,
  initialMsg: string
};

export default class EditorApi {
  store;
  api;
  config;
  profileStore;
  constructor(store, api, config, profileStore) {
    this.store = store;
    this.api = api;
    this.config = config;
    this.profileStore = profileStore;
  }
  /**
   * Method for adding a new editor to an existing connection.
   *
   * @param {Object} options - options for creating new editor
   * @return {Promise}
   */
  @action.bound
  addEditor(options = {}) {
    try {
      let editorOptions = {};
      if (options.constructor.name == 'Object') {
        editorOptions = options;
      }
      this.store.startCreatingNewEditor();
      const profileId =
        options.profileId ||
        (this.store.editorToolbar.newEditorForTreeAction ||
        this.store.editorPanel.activeDropdownId == 'Default'
          ? this.store.profileList.selectedProfile.id
          : this.store.editorPanel.activeDropdownId);
      if (!editorOptions.type) {
        editorOptions.type = EditorTypes.DEFAULT;
      }
      if (!this.profileStore.profiles.has(profileId)) {
        NewToaster.show({
          message: globalString('editor/toolbar/addEditorError'),
          className: 'warning',
          icon: 'thumbs-down'
        });
        this.createNewEditorFailed();
        return null;
      }
      const shellService = featherClient().service('/mongo-shells');
      shellService.timeout = 30000;
      return shellService
        .create({ id: profileId })
        .then(res => {
          return this.setNewEditorState(res, editorOptions);
        })
        .catch(err => {
          this.createNewEditorFailed();
          // @TODO -> Object Object issue
          l.error(err);
          if (err.message == '[object Object]') {
            l.error('Error retrieved from Primus');
          } else {
            NewToaster.show({
              message: 'Error: ' + err.message,
              className: 'danger',
              icon: 'thumbs-down'
            });
            l.error('Error creating new editor:', err.message);
          }
        });
    } catch (err) {
      NewToaster.show({
        message: err.message,
        className: 'danger',
        icon: 'thumbs-down'
      });
      this.createNewEditorFailed();
    }
  }

  @action.bound
  openHomeTab() {
    this.store.setActiveNavPane(NavPanes.EDITOR);
  }

  @action.bound
  createNewEditorFailed() {
    this.store.editorPanel.creatingNewEditor = false;
    this.store.editorToolbar.newConnectionLoading = false;
  }

  /**
   * Get unsaved editor internal file name, a unique integer for the specified editor type
   *
   * @param type - editor type
   * @return an integer that is larger than any of the unsaved editor file names
   */
  getUnsavedEditorInternalFileName(type: string): number {
    let largestFileName = -1;

    for (const editor of this.store.editors.values()) {
      if (!editor.path && editor.type === type && editor.fileName > largestFileName) {
        largestFileName = editor.fileName;
      }
    }

    largestFileName += 1;
    return largestFileName;
  }

  /**
   * Get unsaved editor suggested file name when saving
   *
   * @param editor - editor Object
   * @return suggested file name
   */
  getUnsavedEditorSuggestedFileName = (editor: {}): string => {
    if (editor.type === 'drill') {
      return camelise(`new${this.getEditorDisplayName(editor)}`) + '.sql';
    }
    return camelise(`new${this.getEditorDisplayName(editor)}`) + '.js';
  };

  /**
   * Get editor display name. For example, tab title of an editor
   *
   * @param editor - editor Object
   * @return display name
   */
  getEditorDisplayName(editor: {}): string {
    if (editor.path) {
      return editor.fileName;
    }

    let prefix = null;
    if (editor.type === EditorTypes.TREE_ACTION) {
      prefix = 'Tree Action';
    } else if (editor.type === EditorTypes.SHELL_COMMAND) {
      prefix = 'Shell Command';
    } else if (editor.type === EditorTypes.AGGREGATE) {
      prefix = 'Aggregate Builder';
    } else if (editor.type === EditorTypes.DRILL) {
      prefix = 'Drill';
    }

    return prefix ? `${prefix} - ${editor.fileName}` : editor.fileName;
  }

  // Setting up editor after successful response from Controller, it's more than possible some of these
  // states could be removed or refactored eventually. Worth checking out when time allows.
  @action.bound
  setNewEditorState(res, options = {}) {
    const { content = '' } = options;
    options = _.omit(options, ['content']);
    const fileName = this.getUnsavedEditorInternalFileName(options.type);

    const editorId = uuidV1();

    const doc = StaticApi.createNewDocumentObject(content, 'MongoScript');
    doc.lineSep = StaticApi.determineEol(content);

    this.store.editors.set(
      editorId,
      observable(
        _.assign(
          {
            id: editorId,
            alias: this.profileStore.profiles.get(res.id).alias,
            profileId: res.id,
            shellId: res.shellId,
            currentProfile: res.id,
            fileName,
            executing: false,
            // TODO this `visible` is not used anymore. Needs a cleanup
            visible: true,
            shellVersion: res.shellVersion,
            // Scrape out 4.0 message that breaks all formatting.
            initialMsg: res.output
              ? res.output.join('\n').replace(/---((.|\n)*)db.enableFreeMonitoring\(\)/gi, '')
              : '',
            doc,
            status: ProfileStatus.OPEN,
            path: null,
            type: options.type
          },
          options
        ),
        {
          doc: observable.ref
        }
      )
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
      const treeEditor = this.store.editors.get(editorId);
      this.store.treeActionPanel.editors.set(editorId, treeEditor);
    }

    // Set left Panel State.
    if (options.type === EditorTypes.AGGREGATE) {
      this.store.drawer.drawerChild = DrawerPanes.AGGREGATE;
    } else if (options.type === EditorTypes.TREE_ACTION) {
      this.store.drawer.drawerChild = DrawerPanes.DYNAMIC;
    } else if (options.type === EditorTypes.SHELL_COMMAND) {
      this.store.drawer.drawerChild = DrawerPanes.BACKUP_RESTORE;
    } else {
      this.store.drawer.drawerChild = DrawerPanes.DEFAULT;
    }

    return editorId;
  }

  /**
   * Closes the new features dialog.
   */
  @action.bound
  closeNewFeaturesDialog() {
    l.info('Hide New Features Dialog');
    this.store.editorPanel.showNewFeaturesDialog = false;
  }

  @action.bound
  removeEditor(currEditor) {
    // @TODO -> Looks like during it's various reworks this entire function has been broken and stitched back together. Some refactoring needs to occur to ensure that when atab is closed a new tab is selected. @Mike.

    this.store.drawer.drawerChild = DrawerPanes.DEFAULT;
    // If Editor is not clean, prompt for save.
    if (!currEditor.doc.isClean() && currEditor.type != EditorTypes.SHELL_COMMAND) {
      this.store.editorPanel.showingSavingDialogEditorIds.push(currEditor.id);
      return;
    }

    // If the editor has an open shell, close it.
    if (currEditor && currEditor.status == ProfileStatus.OPEN) {
      featherClient()
        .service('/mongo-shells')
        .remove(currEditor.profileId, {
          query: {
            shellId: currEditor.shellId
          }
        })
        .then()
        .catch(err => {
          l.error('Failed to remove shell:', err);
        });
    }

    // Check if the editor closing is the currently active editor.
    if (currEditor.id == this.store.editorPanel.activeEditorId) {
      this.store.editorPanel.isRemovingCurrentTab = true;

      // Check if this is the last tab:
      if (this.store.editors.size == 1) {
        this.store.editorPanel.activeEditorId = 'Default';
        this.store.editorToolbar.isActiveExecuting = false;
      } else {
        // Show and select first entry in map.
        this.api.removeOutput(currEditor);
        this.store.editors.delete(currEditor.id);
        const editors = [...this.store.editors.entries()];
        this.store.editorPanel.activeEditorId = editors[0][1].id;
        this.store.editorToolbar.isActiveExecuting = editors[0][1].executing;

        const treeEditor = this.store.treeActionPanel.editors.get(currEditor.id);
        if (treeEditor) {
          this.store.treeActionPanel.editors.delete(treeEditor.id);
        }
        return;
      }
    } else {
      this.store.editorPanel.isRemovingCurrentTab = false;
    }
    this.api.removeOutput(currEditor);
    this.store.editors.delete(currEditor.id);
    const treeEditor = this.store.treeActionPanel.editors.get(currEditor.id);
    if (treeEditor) {
      this.store.treeActionPanel.editors.delete(treeEditor.id);
    }
  }
  @action.bound
  addDrillEditor(profile, options = {}) {
    const content = `/* Welcome to dbKoda Apache Drill integration
// From here, you can use SQL to query your MongoDB collections
// See http://bit.ly/dbKodadrill2 for an FAQ item on this topic.
//
// Type "SHOW TABLES" to get a list of collections that can be queried.
//
// Try "SELECT * FROM tablename LIMIT 10" to see table data
// Try "SELECT FLATTEN(array) FROM tablename LIMIT 10" to unwind embedded arrays
//
*/

SHOW TABLES
`;
    const fileName = this.getUnsavedEditorInternalFileName(options.type);

    const editorId = uuidV1();

    const doc = StaticApi.createNewDocumentObject(content, 'MongoScript');
    doc.lineSep = StaticApi.determineEol(content);

    this.store.editors.set(
      editorId,
      observable(
        _.assign(
          {
            id: editorId,
            alias: this.profileStore.profiles.get(profile.id).alias,
            profileId: profile.id,
            shellId: options.shellId,
            currentProfile: profile.id,
            fileName,
            executing: false,
            visible: true,
            shellVersion: profile.shellVersion,
            initialMsg: '', // profile.output ? profile.output.join('\n') : '',
            doc,
            status: ProfileStatus.OPEN,
            path: null,
            type: options.type,
            db: options.db
          },
          options
        ),
        {
          doc: observable.ref
        }
      )
    );
    if (this.api) {
      this.api.addDrillOutput(this.store.editors.get(editorId), options.output);
    }
    this.store.editorPanel.creatingNewEditor = false;
    this.store.editorToolbar.noActiveProfile = false;
    this.store.editorToolbar.id = profile.id;
    this.store.editorToolbar.shellId = options.shellId;
    this.store.editorToolbar.newConnectionLoading = false;
    this.store.editorPanel.shouldScrollToActiveTab = true;
    this.store.editorPanel.activeEditorId = editorId;
    this.store.editorToolbar.currentProfile = profile.id;
    this.store.editorToolbar.noActiveProfile = false;
    this.store.editorPanel.activeDropdownId = profile.id;
    this.store.newConnectionLoading = false;
    this.store.editorToolbar.isActiveExecuting = false;

    // Set left Panel State.
    if (options.type === EditorTypes.AGGREGATE) {
      this.store.drawer.drawerChild = DrawerPanes.AGGREGATE;
    } else if (options.type === EditorTypes.TREE_ACTION) {
      this.store.drawer.drawerChild = DrawerPanes.DYNAMIC;
    } else if (options.type === EditorTypes.SHELL_COMMAND) {
      this.store.drawer.drawerChild = DrawerPanes.BACKUP_RESTORE;
    } else {
      this.store.drawer.drawerChild = DrawerPanes.DEFAULT;
    }

    NewToaster.show({
      message: globalString('editor/toolbar/connectionSuccess'),
      icon: 'thumbs-up',
      className: 'success'
    });
    return editorId;
  }
}
