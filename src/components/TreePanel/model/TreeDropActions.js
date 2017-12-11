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
 * @Date:   2017-03-17T10:29:12+11:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-09-11T09:07:51+10:00
 */

import Templates from '../templates/dragdrop';

export default class TreeDropActions {
  /**
   * Function to load a template based on the resolved template type
   * @param  {string} type - Type of the template to load
   * @return {Template}    - Handle Template to generate code based on context
   */
  static getTemplateByType(type, isSQL) {
    console.log(type, ' - ', isSQL);
    const templateId = Templates[type];
    let template;
    if (isSQL) {
      template = require('../templates/dragdropSQL/' + templateId); //eslint-disable-line
    } else {
      template = require('../templates/dragdrop/' + templateId); //eslint-disable-line
    }
    console.log(template);
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
      case 'config':
      case 'shard':
        {
          const server = treeNode.label.split(':');
          context = { host: server[0], port: server[1] };
        }
        break;
      case 'collection':
        context = { col: treeNode.label, db: treeNode.refParent.text };
        break;
      case 'index':
        context = {
          db: treeNode.refParent.refParent.text,
          col: treeNode.refParent.text,
        };
        break;
      case 'user':
        context = { text: treeNode.label.split('.')[1] };
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
      const template = TreeDropActions.getTemplateByType(treeNode.type, false);
      return template(context);
    } catch (e) {
      console.error(e);
      return '';
    }
  }

  static getSQLForTreeNode(treeNode) {
    try {
      const context = TreeDropActions.getContext(treeNode);
      const template = TreeDropActions.getTemplateByType(treeNode.type, true);
      return template(context);
    } catch (e) {
      console.error(e);
      return '';
    }
  }
}
