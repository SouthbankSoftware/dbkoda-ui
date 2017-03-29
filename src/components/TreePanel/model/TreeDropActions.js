/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-17T10:29:12+11:00
* @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-03-29T14:30:35+11:00
*/

const Templates = require('../templates/dragdrop');

export default class TreeDropActions {
  static getTemplateByType(type) {
    const templateId = Templates[type];
    const template = require('../templates/dragdrop/'+ templateId); //eslint-disable-line
    console.log(template);
    return template;
  }
  /**
   * get context for handlebars template
   * @param  TreeNode treeNode  selected treenode dragged by the user
   * @return object   context   object containing necessory information for the template.
   */
  static getContext(treeNode) {
    let context = {};
    switch (treeNode.type) {
      case 'config': {
          const server = treeNode.label.split(':');
          context = { host: server[0], port: server[1]};
        }
        break;
      case 'collection':
        context = {col: treeNode.label, db: treeNode.refParent.text};
        break;
      case 'index':
        context = { db: treeNode.refParent.refParent.text, col: treeNode.refParent.text };
        break;
      default:
        context = { text: treeNode.label };
        break;
    }
    return context;
  }
  static getCodeForTreeNode(treeNode) {
    const context = TreeDropActions.getContext(treeNode);
    const template = TreeDropActions.getTemplateByType(treeNode.type);
    return template(context);
  }
}
