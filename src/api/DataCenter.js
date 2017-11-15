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
 *
 *
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-07-25T09:46:42+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2017-11-14T15:53:26+11:00
 */

import _ from 'lodash';
import OutputApi from './Output';
import TerminalApi from './Terminal';
import EditorApi from './Editor';
import ProfileApi from './Profile';
import TreeApi from './Tree';
import DrillApi from './Drill';

export default class DataCenter {
  store;
  config;
  outputApi;
  profiles;

  constructor(store, config, profiles) {
    this.store = store;
    this.config = config;
    this.profiles = profiles;
    this.outputApi = new OutputApi(store, this, profiles);
    this.terminalApi = new TerminalApi(store, this);
    this.editorApi = new EditorApi(store, this, config, profiles);
    this.profileApi = new ProfileApi(store, this, profiles);
    this.treeApi = new TreeApi(store, this);
    this.drillApi = new DrillApi(store, this);

    this.init = this.init.bind(this);

    // TODO this is basically a mixin pattern, use a mixin lib instead of typing heedlessly here? :D

    // Output API public functions
    this.addOutput = this.outputApi.addOutput.bind(this);
    this.removeOutput = this.outputApi.removeOutput.bind(this);
    this.initJsonView = this.outputApi.initJsonView.bind(this);
    this.swapOutputShellConnection = this.outputApi.swapOutputShellConnection.bind(this);
    this.addDrillOutput = this.outputApi.addDrillOutput.bind(this);
    this.drillOutputAvailable = this.outputApi.drillOutputAvailable.bind(this);

    // Terminal public APIs
    _.assign(
      this,
      _.pick(this.terminalApi, [
        'getTerminalTabId',
        'addTerminal',
        'removeTerminal',
        'removeAllTerminalsForProfile',
      ]),
    );

    // Editor API public functions
    this.addEditor = this.editorApi.addEditor.bind(this);
    this.setNewEditorState = this.editorApi.setNewEditorState.bind(this);
    this.createNewEditorFailed = this.editorApi.createNewEditorFailed.bind(this);
    this.getUnsavedEditorInternalFileName = this.editorApi.getUnsavedEditorInternalFileName.bind(
      this,
    );
    this.getUnsavedEditorSuggestedFileName = this.editorApi.getUnsavedEditorSuggestedFileName.bind(
      this,
    );
    this.getEditorDisplayName = this.editorApi.getEditorDisplayName.bind(this);
    this.removeEditor = this.editorApi.removeEditor.bind(this);
    this.addDrillEditor = this.editorApi.addDrillEditor.bind(this);
    this.openConfigTab = this.editorApi.openConfigTab.bind(this);

    // Tree API public functions
    this.addNewEditorForTreeAction = this.treeApi.addNewEditorForTreeAction.bind(this);

    // Profile API public functions
    this.profileCreated = this.profileApi.profileCreated.bind(this);

    // Drill API public functions
    this.addNewEditorForDrill = this.drillApi.addNewEditorForDrill.bind(this);
    this.checkForExistingDrillProfile = this.drillApi.checkForExistingDrillProfile.bind(this);
    this.openEditorWithDrillProfileId = this.drillApi.openEditorWithDrillProfileId.bind(this);
    this.deleteProfileFromDrill = this.drillApi.deleteProfileFromDrill.bind(this);
  }

  init() {
    this.outputApi.init();
  }
}
