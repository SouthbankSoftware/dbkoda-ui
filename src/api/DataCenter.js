/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-07-25T09:46:42+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-08-29T10:58:53+10:00
 */


import OutputApi from './Output';
import EditorApi from './Editor';
import ProfileApi from './Profile';
import TreeApi from './Tree';
import DrillApi from './Drill';

export default class DataCenter {
  store;
  outputApi;

  constructor(store) {
    this.store = store;
    this.outputApi = new OutputApi(store, this);
    this.editorApi = new EditorApi(store, this);
    this.profileApi = new ProfileApi(store, this);
    this.treeApi = new TreeApi(store, this);
    this.drillApi = new DrillApi(store, this);

    this.init = this.init.bind(this);

    // Output API public functions
    this.addOutput = this.outputApi.addOutput.bind(this);
    this.removeOutput = this.outputApi.removeOutput.bind(this);
    this.initJsonView = this.outputApi.initJsonView.bind(this);
    this.swapOutputShellConnection = this.outputApi.swapOutputShellConnection.bind(this);
    this.addDrillOutput = this.outputApi.addDrillOutput.bind(this);
    this.drillOutputAvailable = this.outputApi.drillOutputAvailable.bind(this);

    // Editor API public functions
    this.addEditor = this.editorApi.addEditor.bind(this);
    this.setNewEditorState = this.editorApi.setNewEditorState.bind(this);
    this.createNewEditorFailed = this.editorApi.createNewEditorFailed.bind(this);
    this.removeEditor = this.editorApi.removeEditor.bind(this);
    this.addDrillEditor = this.editorApi.addDrillEditor.bind(this);

    // Tree API public functions
    this.addNewEditorForTreeAction = this.treeApi.addNewEditorForTreeAction.bind(this);

    // Profile API public functions
    this.profileCreated = this.profileApi.profileCreated.bind(this);

    // Drill API public functions
    this.addNewEditorForDrill = this.drillApi.addNewEditorForDrill.bind(this);
    this.checkForExistingDrillProfile = this.drillApi.checkForExistingDrillProfile.bind(this);
    this.openEditorWithDrillProfileId = this.drillApi.openEditorWithDrillProfileId.bind(this);
  }

  init() {
    this.outputApi.init();
  }
}
