/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-07-31T14:53:10+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-07-31T15:25:42+10:00
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
   addNewEditorForTreeAction = ({type = 'shell'}) => {
     this.store.editorToolbar.newEditorForTreeAction = true;
     this.store.editorToolbar.newEditorTypeForTreeAction = type;
     this.store.treeActionPanel.newEditorCreated = false;
     this.api.addEditor({type: this.store.editorToolbar.newEditorTypeForTreeAction});
   };
 }
