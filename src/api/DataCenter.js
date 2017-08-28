/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-07-25T09:46:42+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-08-28T15:45:29+10:00
 */


import OutputApi from './Output';
import EditorApi from './Editor';
import ProfileApi from './Profile';
import TreeApi from './Tree';

export default class DataCenter {
  store;
  outputApi;

  constructor(store) {
    this.store = store;
    this.outputApi = new OutputApi(store, this);
    this.editorApi = new EditorApi(store, this);
    this.profileApi = new ProfileApi(store, this);
    this.treeApi = new TreeApi(store, this);

    this.init = this.init.bind(this);

    this.addOutput = this.outputApi.addOutput.bind(this);
    this.removeOutput = this.outputApi.removeOutput.bind(this);
    this.initJsonView = this.outputApi.initJsonView.bind(this);
    this.swapOutputShellConnection = this.outputApi.swapOutputShellConnection.bind(this);

    this.addEditor = this.editorApi.addEditor.bind(this);
    this.setNewEditorState = this.editorApi.setNewEditorState.bind(this);
    this.createNewEditorFailed = this.editorApi.createNewEditorFailed.bind(this);

    this.addNewEditorForTreeAction = this.treeApi.addNewEditorForTreeAction.bind(this);

    this.profileCreated = this.profileApi.profileCreated.bind(this);
  }

  init() {
    this.outputApi.init();
  }
}
