/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-07-31T14:53:10+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-08-01T10:36:25+10:00
 */

import { action } from 'mobx';

 export default class TreeApi {
   store;
   api;

   constructor(store, api) {
     this.store = store;
     this.api = api;

     this.addNewEditorForTreeAction = this.addNewEditorForTreeAction.bind(this);
   }

   @action
   addNewEditorForTreeAction = (options = {type: 'TreeAction'}) => {
     this.store.editorToolbar.newEditorForTreeAction = true;
     this.store.editorToolbar.newEditorTypeForTreeAction = options.type;
     this.store.treeActionPanel.newEditorCreated = false;
     this.api.addEditor({type: this.store.editorToolbar.newEditorTypeForTreeAction});
   };
 }
