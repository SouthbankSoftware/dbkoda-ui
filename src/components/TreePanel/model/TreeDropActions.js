/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-17T10:29:12+11:00
* @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-02T12:07:38+10:00
*/

import Templates from '../templates/dragdrop';

export default class TreeDropActions {
  /**
   * Function to load a template based on the resolved template type
   * @param  {string} type - Type of the template to load
   * @return {Template}    - Handle Template to generate code based on context
   */
  static getTemplateByType(type) {
    const templateId = Templates[type];
    const template = require('../templates/dragdrop/'+ templateId); //eslint-disable-line
    return template;
  }
  /**
   * get context for handlebars template
   * @param  {TreeNode} treeNode  - selected treenode dragged by the user
   * @return {Object}             - object containing necessory information for the template.
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
  /**
   * Function to get the code specific to TreeNode type
   * @param  {TreeNode} treeNode - selected node for which the user wants to generate code
   * @return {String}            - generated code
   */
  static getCodeForTreeNode(treeNode) {
    try {
      const context = TreeDropActions.getContext(treeNode);
      const template = TreeDropActions.getTemplateByType(treeNode.type);
      return template(context);
    } catch (e) {
      console.log(e);
      return '';
    }
  }
}
