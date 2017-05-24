/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-05-22T14:34:57+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-23T15:19:22+10:00
 */

import { SyncService } from '#/common/SyncService';

export default class DetailsBuilder {
  treeNode: null;
  editor: null;
  /**
    * Resolve the prefetch arguments and return them as params
    * @param  {Array}  args     Arguments array as provided from DDD file
    * @return {Object}          Object containing params for prefetch function
    */
  resolveArguments = (args) => {
    const params = {};
    if (args.length > 0 && this.treeNode) {
      for (let i = 0; i < args.length; i += 1) {
        const arg = args[i];
        switch (arg.value) {
          case 'treeNode.parentDB':
            if (this.treeNode.type == 'user') {
              params[arg.name] = this.treeNode.json.db;
            } else if (this.treeNode.type == 'collection') {
              params[arg.name] = this.treeNode.refParent.json.text;
            } else if (this.treeNode.type == 'index') {
              params[arg.name] = this.treeNode.refParent.refParent.json.text;
            }
            break;

          case 'treeNode.parentCOL':
            if (this.treeNode.type == 'index') {
              params[arg.name] = this.treeNode.refParent.json.text;
            }
            break;
          default:
            params[arg.name] = this.treeNode.json.text;
        }
      }
    }
    return params;
  };
  getPrefilledData = (ddd, formFunctions) => {
    return new Promise((resolve, reject) => {
      if (ddd.DefaultValues) {
        let params = {};
        if (ddd.DefaultValues.arguments) {
          const args = ddd.DefaultValues.arguments;
          params = this.resolveArguments(args);
        }

        let PrefilledValues;
        if (
          ddd.DefaultValues.arguments && ddd.DefaultValues.arguments.length > 0
        ) {
          PrefilledValues = formFunctions[ddd.DefaultValues.function](params);
        } else {
          PrefilledValues = formFunctions[ddd.DefaultValues.function]();
        }

        if (typeof PrefilledValues === 'string') {
          let parseFunction;
          if (formFunctions[ddd.DefaultValues.function + '_parse']) {
            parseFunction = formFunctions[
              ddd.DefaultValues.function + '_parse'
            ];
          } else {
            parseFunction = (values) => {
              return values;
            };
          }
          SyncService.executeQuery(
            PrefilledValues,
            this.editor.shellId,
            this.editor.currentProfile
          )
            .then((res) => {
              const parsedValues = parseFunction(res);
              resolve(parsedValues);
            })
            .catch((reason) => {
              reject('Error in SyncService: ' + reason);
            });
        } else if (typeof PrefilledValues === 'object') {
          resolve(PrefilledValues);
        }
      } else {
        reject('No DefaultValues attribute available in DDD json file.');
      }
    });
  };
  /**
    * Function to create a dynamic form based on the tree action.
    * @param  {Object}   detailsStore       Store which contains all the information about selected tree action
    * @param  {Function} updateDynamicFormCode Callback function to send the generated code back to editor
    * @return {Promise}                        Promise which will be resolved once all the queries for prefetching are resolved.
    */
  createDetailsView = (detailsStore, editorForDetails) => {
    return new Promise((resolve, reject) => {
      try {
        this.editor = editorForDetails;
        const treeAction = this.editor.detailsView.treeAction;
        this.treeNode = this.editor.detailsView.treeNode;
        // Load the form definitions dynamically
        const ddd = require('./DetailsDefinitions/' + treeAction + '.ddd.json'); //eslint-disable-line

        // Load the form functions to support the definitions dynamically
        const formFunctions = require('./Functions/' + treeAction + '.js')[ //eslint-disable-line
          treeAction
        ];

        const detailsViewInfo = {
          title: ddd.Title,
          fields: ddd.Fields
        };

        const updatePrefilledData = (data) => {
          detailsViewInfo.values = data;
        };

        this.getPrefilledData(ddd, formFunctions).then((detData) => {
          updatePrefilledData(detData);
          detailsStore.detailsViewInfo = detailsViewInfo;
          resolve(detailsViewInfo);
        }).catch((reason) => {
          reject('getPrefilledData Error: ' + reason);
        });
      } catch (e) {
        reject('createDetailsView Error: ' + e.message);
      }
    });
  };
}
