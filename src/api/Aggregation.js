/**
 * @flow
 *
 * @Author: Michael <Mike>
 * @Date:   2018-05-09T10:39:44+11:00
 * @Email:  mike@southbanksoftware.com
 * @Last modified by:   Mike
 * @Last modified time: 2018-05-09T10:56:32+10:00
 *
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
 */

/* eslint import/no-dynamic-require: warn */

// import { Broker, EventType } from '~/helpers/broker';
// import { featherClient } from '~/helpers/feathers';
// import { NewToaster } from '#/common/Toaster';

import { action } from 'mobx';
import { DrawerPanes } from '#/common/Constants';

export default class AggregationApi {
  store: *;
  api: *;

  constructor(store: *, api: *) {
    this.store = store;
    this.api = api;
  }

  /**
   * Generates valid Mongo Code using Handlebars and the Details MobX-Form.
   *
   * @param {Object} editorObject - Editor Object to generate handlebars code for.
   */
  generateCode(editorObject: any) {
    const os = require('os').release();
    let newLine = '\n';
    if (os.match(/Win/gi)) {
      newLine = '\r\n';
    }

    let codeString = 'use ' + editorObject.collection.refParent.text + ';' + newLine;

    // First add Start block.
    if (
      editorObject.blockList &&
      editorObject.blockList[0] &&
      editorObject.blockList[0].type.toUpperCase() === 'START'
    ) {
      // $FlowFixMe
      const formTemplate = require('#/AggregateViews/AggregateBlocks/BlockTemplates/Start.hbs');
      codeString += formTemplate(editorObject.blockList[0].fields) + ';' + newLine;
    }
    codeString += 'db.getCollection("' + editorObject.collection.text + '").aggregate([' + newLine;
    let pipelineString = '[';

    const selectedBlockIndex = editorObject.selectedBlock;
    // Then add all other blocks.
    editorObject.blockList.map((block, index) => {
      if (!(block.type.toUpperCase() === 'START')) {
        if (block.byoCode) {
          if (block.code) {
            block.code.replace(/\r\n/g, newLine);
            block.code.replace(/\n/g, newLine);
            if (index > selectedBlockIndex) {
              const blockString = '/*' + block.code.replace(/\r\n/g, newLine) + ', */' + newLine;
              codeString += blockString;
              pipelineString += blockString;
            } else {
              const blockString = block.code.replace(/\r\n/g, newLine) + ',' + newLine;
              codeString += blockString;
              pipelineString += blockString;
            }
          }
        } else {
          // $FlowFixMe
          const formTemplate = require('#/AggregateViews/AggregateBlocks/BlockTemplates/' +
            block.type +
            '.hbs');
          if (index > selectedBlockIndex) {
            codeString += '/*' + formTemplate(block.fields) + ', */' + newLine;
            pipelineString += '/*' + formTemplate(block.fields) + ', */' + newLine;
          } else {
            codeString += formTemplate(block.fields) + ',' + newLine;
            pipelineString += formTemplate(block.fields) + ',' + newLine;
          }
        }
      }
    });

    codeString += '],';
    codeString += '{';
    pipelineString += ']';

    if (
      editorObject.blockList &&
      editorObject.blockList[0] &&
      editorObject.blockList[0].type.toUpperCase() === 'START'
    ) {
      codeString += 'allowDiskUse: ' + editorObject.blockList[0].fields.DiskUsage;
    }
    codeString += '}';
    codeString += ');';

    if (this.store.aggregateBuilder.includeCreateView) {
      codeString += `${newLine}${newLine}db.createView('${this.store.aggregateBuilder.viewName}','${
        editorObject.collection.text
      }', ${pipelineString});${newLine}`;
    }

    return codeString;
  }

  @action.bound
  onHideLeftPanelClicked() {
    this.store.setDrawerChild(DrawerPanes.DEFAULT);
  }

  @action.bound
  onShowLeftPanelClicked() {
    this.store.setDrawerChild(DrawerPanes.AGGREGATE);
  }
}
