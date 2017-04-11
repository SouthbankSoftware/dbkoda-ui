/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-05T12:08:41+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-04-10T10:42:26+10:00
 */

import { CreateForm } from '#/TreeActionPanel/Components/PrefilledForm';


export default class TreeActionsProxy {
  static createDialogByType(treeNode, action) {
    console.log('dialogByType:', treeNode.type, action);

    const form = CreateForm(treeNode, action);
    console.log(form.values());
    }
}