/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-17T10:29:12+11:00
* @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-03-21T12:53:51+11:00
*/

const Templates = require('./templates');

export default class CodeGeneration {
  static getTemplateByType(type) {
    const templateId = Templates[type];
    const template = require('./templates/'+ templateId); //eslint-disable-line
    return template;
  }

  static getCodeForTreeNode(treeNode) {
    let context = {};
    const template = CodeGeneration.getTemplateByType(treeNode.type);
    switch (treeNode.type) {
      case 'config': {
          const server = treeNode.label.split(':');
          context = { host: server[0], port: server[1]};
        }
        break;
      case 'index':
        context = { text: treeNode.refParent.text };
        break;
      default:
        context = { text: treeNode.label };
        break;
    }
    return template(context);
  }
}
