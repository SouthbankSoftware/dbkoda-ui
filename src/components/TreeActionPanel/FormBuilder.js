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
 */

/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-05-09T09:20:44+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-08-25T12:22:04+10:00
 */

/* eslint import/no-dynamic-require: warn */

import { SyncService } from '#/common/SyncService';
import { DynamicForm } from './Components/DynamicForm';

export default class FormBuilder {
  resolveArguments;
  editor: null;
  /**
   * Resolves the definition field into Mobx React Form field
   * @param  {Object} defField      Field object from DDD filter
   * @param  {Array}  formFunctions Array of function from the supporting DDD file
   * @return {Object}               Field Object for Mobx React Form
   */
  getField = (defField, formFunctions) => {
    const res = {};
    res.fieldName = defField.name;
    res.fieldLabel = defField.label ? defField.label : defField.name;
    res.fieldType = defField.type;
    res.fieldTooltip = defField.tooltip ? defField.tooltip : null;
    res.fieldRules = '';
    if (defField.readOnly) {
      res.disabled = true;
    }

    if (defField.keyValue) {
      // if a field is a key value, it should be required
      res.fieldRules += 'required';
    }
    if (Object.prototype.hasOwnProperty.call(defField, 'default')) {
      res.fieldDefault = defField.default;
    }
    if (Object.prototype.hasOwnProperty.call(defField, 'defaultValue')) {
      res.fieldDefaultValue = defField.defaultValue;
    }
    if (defField.rules) {
      if (res.fieldRules && res.fieldRules.length > 0) {
        res.fieldRules += '|';
      }
      res.fieldRules += defField.rules;
    }
    if (defField.lookup && formFunctions[defField.lookup]) {
      let params = {};
      if (defField.lookup_arguments) {
        params = this.resolveArguments(defField.lookup_arguments);
        res.fieldQuery = formFunctions[defField.lookup](params);
      } else {
        res.fieldQuery = formFunctions[defField.lookup]();
      }
      res.fieldParseFn = defField.lookup + '_parse';
    }
    if (defField.type == 'Text') {
      res.fieldBinding = 'TextField';
    }
    if (defField.type == 'Select') {
      res.fieldBinding = 'SelectField';
    }
    if (defField.type == 'Boolean') {
      res.fieldBinding = 'BooleanField';
    }
    if (defField.type == 'Numeric') {
      res.fieldBinding = 'NumericField';
      res.fieldMin = Object.prototype.hasOwnProperty.call(defField, 'min')
        ? defField.min
        : null;
      res.fieldMax = Object.prototype.hasOwnProperty.call(defField, 'max')
        ? defField.max
        : null;
    }
    if (defField.type == 'Combo') {
      res.fieldBinding = 'ComboField';
      if (Object.prototype.hasOwnProperty.call(defField, 'multi')) {
        res.multi = defField.multi;
      }
    }
    if (defField.type == 'Table') {
      if (Object.prototype.hasOwnProperty.call(defField, 'maxColumns')) {
        res.maxColumns = defField.maxColumns;
      }
    }
    return res;
  };
  /**
   * Function to resolve all the queries for the fieldset one by one
   * @param  {Array}    queries       Array of queries for the fieldset
   * @param  {Object}   result        Result Object to be populated as the queries resolve one by one
   * @return {Promise}                Promise to be resolved after all the queries have been resolved
   */
  resolveQueries = (queries, result) => {
    return new Promise((resolve, reject) => {
      const query = queries.pop();
      if (query.dontRun) {
        result[query] = query;
        if (queries.length > 0) {
          this.resolveQueries(queries, result)
            .then((result) => {
              resolve(result);
            })
            .catch((reason) => {
              reject(reason);
            });
        } else {
          resolve(query);
        }
      } else {
        SyncService.executeQuery(
          query,
          this.editor.shellId,
          this.editor.profileId,
        )
          .then((res) => {
            result[query] = res;
            if (queries.length > 0) {
              this.resolveQueries(queries, result)
                .then((result) => {
                  resolve(result);
                })
                .catch((reason) => {
                  reject(reason);
                });
            } else {
              resolve(result);
            }
          })
          .catch((reason) => {
            reject(reason);
          });
      }
    });
  };
  /**
   * Function to get Mobx React Form Fields from the Dialog Defininition document
   * @param  {Object}   ddd           Object containing fields defined in DDD document
   * @param  {Object}   formFunctions Array of function from the supporting DDD file
   * @return {Promise}                Promise to be resolved after all fields has been generated
   */
  getFieldsFromDefinitions = (ddd, formFunctions) => {
    return new Promise((resolve, reject) => {
      const result = {};
      result.fields = [];
      result.labels = {};
      result.rules = {};
      result.types = {};
      result.disabled = {};
      result.bindings = {};
      result.arrayLast = []; // an object to keep reference of array fields to add last element later before sending to the template.
      result.multiCombo = []; // an object to keep reference of fields which are multi value combo fields
      result.options = {};
      result.values = {};

      const queries = []; // array of all the queries required by fields.
      const queryFieldsHash = {};

      const setFormOptions = (fld, fldName) => {
        // Function to set the field resolved from getField function in the result for mobx-react-form
        result.fields.push(fldName);
        result.labels[fldName] = fld.fieldLabel;
        result.types[fldName] = fld.fieldType;
        result.rules[fldName] = fld.fieldRules;
        if (fld.fieldBinding) {
          result.bindings[fldName] = fld.fieldBinding;
        }
        if (fld.fieldTooltip) {
          result.options[fldName] = { tooltip: fld.fieldTooltip };
        }
        if (fld.disabled) result.disabled[fldName] = fld.disabled;

        if (Object.prototype.hasOwnProperty.call(fld, 'fieldDefault')) {
          result.values[fldName] = fld.fieldDefault;
        }
        if (Object.prototype.hasOwnProperty.call(fld, 'fieldMin')) {
          if (result.options[fldName]) {
            result.options[fldName].min = fld.fieldMin;
          } else {
            result.options[fldName] = { min: fld.fieldMin };
          }
        }
        if (Object.prototype.hasOwnProperty.call(fld, 'fieldMax')) {
          if (result.options[fldName]) {
            result.options[fldName].max = fld.fieldMax;
          } else {
            result.options[fldName] = { max: fld.fieldMax };
          }
        }
        if (Object.prototype.hasOwnProperty.call(fld, 'fieldDefaultValue')) {
          if (result.options[fldName]) {
            result.options[fldName].defaultValue = fld.fieldDefaultValue;
          } else {
            result.options[fldName] = { defaultValue: fld.fieldDefaultValue };
          }
        }
        if (Object.prototype.hasOwnProperty.call(fld, 'multi')) {
          if (result.options[fldName]) {
            result.options[fldName].multi = fld.multi;
          } else {
            result.options[fldName] = { multi: fld.multi };
          }
          result.multiCombo.push(fldName);
        }
        if (Object.prototype.hasOwnProperty.call(fld, 'maxColumns')) {
          if (result.options[fldName]) {
            result.options[fldName].maxColumns = fld.maxColumns;
          } else {
            result.options[fldName] = { maxColumns: fld.maxColumns };
          }
        }

        if (fld.fieldQuery) {
          if (queries.indexOf(fld.fieldQuery) < 0) {
            queries.push(fld.fieldQuery);
          }
          queryFieldsHash[fldName] = {
            query: fld.fieldQuery,
            parseFn: fld.fieldParseFn,
          };
        }
      };

      // traverse all the fields and generate the fields for mobx-react-form
      for (const defField of ddd.Fields) {
        const resField = this.getField(defField, formFunctions);
        setFormOptions(resField, resField.fieldName);

        if (defField.type == 'Table') {
          for (const col of defField.columns) {
            const colField = this.getField(col, formFunctions);
            const colFieldName =
              resField.fieldName + '[].' + colField.fieldName;
            setFormOptions(colField, colFieldName);
          }
          result.arrayLast.push(resField.fieldName); // this is utilized after the form has returned the input document for the template
        } else if (defField.type == 'Group') {
          for (const member of defField.members) {
            const memField = this.getField(member, formFunctions);
            const memFieldName = resField.fieldName + '.' + memField.fieldName;
            setFormOptions(memField, memFieldName);
          }
          if (!defField.label || defField.label == '') {
            result.labels[resField.fieldName] = '--nolabel--';
          }
        }
      }

      // if there are db queries resolve them and update the options for select fields
      if (queries.length > 0) {
        this.resolveQueries(queries, {})
          .then((resQueries) => {
            for (const fldName in queryFieldsHash) {
              if (queryFieldsHash[fldName]) {
                const fldQuery = queryFieldsHash[fldName];
                let resOpts = resQueries[fldQuery.query];
                let arrOptions = [];
                if (resQueries === fldQuery.query) {
                  resOpts = resQueries;
                } else if (resQueries === queryFieldsHash[fldName].query) {
                  resOpts = resQueries;
                } else if (!resOpts) {
                  resOpts = resQueries;
                }
                if (formFunctions[fldQuery.parseFn]) {
                  try {
                    arrOptions = [''].concat(
                      formFunctions[fldQuery.parseFn](resOpts),
                    );
                  } catch (e) {
                    console.error(e.stack);
                  }
                }
                if (result.options[fldName]) {
                  result.options[fldName].dropdown = arrOptions;
                } else {
                  result.options[fldName] = { dropdown: arrOptions };
                }
              }
            }
            if (this.editor.type.toUpperCase() === 'AGGREGATE') {
              const block = this.editor.blockList[this.editor.selectedBlock];
              if (this.editor.aggregateID && block.customFields) {
                Object.keys(block.customFields).map((field) => {
                  block.customFields[field].map((value) => {
                    result.options[field].dropdown.unshift(value);
                  });
                });
              }
            }
            resolve(result);
          })
          .catch((reason) => {
            reject(reason);
          });
      } else {
        resolve(result);
      }
    });
  };

  /**
   * Function to create a dynamic form based on the tree action.
   * @param  {Function} resolveArguments      Callback function to get the params for field queried based on the DDD
   * @param  {Function} updateDynamicFormCode Callback function to send the generated code back to editor
   * @param  {Object}   editorObject          Instance of the editor on which to execute queries
   * @param  {String}   formAction            Action to load by Form Builder
   * @return {Promise}                        Promise which will be resolved once all the queries for prefetching are resolved.
   */
  createForm = (
    resolveArguments,
    updateDynamicFormCode,
    editorObject,
    formAction,
  ) => {
    try {
      let treeAction;
      let ddd;
      let formFunctions;
      let formTemplate;
      if (formAction.aggregate) {
        treeAction = formAction.action;
        this.resolveArguments = resolveArguments;
        this.editor = editorObject;
        // Load the form definitions dynamically
        // eslint-disable-next-line
        ddd = require('../AggregateViews/AggregateBlocks/BlockDefinitions/' +
          treeAction +
          '.ddd.json');
        // Load the form functions to support the definitions dynamically
        // eslint-disable-next-line
        formFunctions = require('../AggregateViews/AggregateBlocks/BlockFunctions/' +
          treeAction +
          '.js')[treeAction];
        // load the form template
        // eslint-disable-next-line
        formTemplate = require('../AggregateViews/AggregateBlocks/BlockTemplates/' +
          treeAction +
          '.hbs');
      } else {
        treeAction = formAction;
        this.resolveArguments = resolveArguments;
        this.editor = editorObject;
        // Load the form definitions dynamically
        ddd = require('./DialogDefinitions/' + treeAction + '.ddd.json'); //eslint-disable-line
        // Load the form functions to support the definitions dynamically
        formFunctions = require('./Functions/' + treeAction + '.js')[ //eslint-disable-line
          treeAction
        ];
        // load the form template
        formTemplate = require('./Templates/' + treeAction + '.hbs'); //eslint-disable-line
      }

      return new Promise((resolve, reject) => {
        // get Fields for Mobx React Form

        this.getFieldsFromDefinitions(ddd, formFunctions)
          .then((formDefs) => {
            const traverseMultiCombo = (fldArray, frmVals, bMerge = true) => {
              if (fldArray.length > 1) {
                let pFld = fldArray.shift();
                if (pFld.indexOf('[]') > 0) {
                  pFld = pFld.replace('[]', '');
                  for (const cFlds of frmVals[pFld]) {
                    const cloneFldArray = fldArray.slice(0); // done the clone because parent field is an array and has multiple childs
                    traverseMultiCombo(cloneFldArray, cFlds, bMerge);
                  }
                  fldArray.shift();
                } else {
                  traverseMultiCombo(fldArray, frmVals[pFld], bMerge);
                }
              } else {
                const mFld = fldArray.shift();
                if (bMerge) {
                  if (frmVals[mFld].length > 0) {
                    frmVals[mFld] = frmVals[mFld].join('|');
                  }
                } else if (mFld && frmVals[mFld]) {
                  frmVals[mFld] = frmVals[mFld].split('|');
                }
              }
            };
            // callback function to get the updated values from the form
            const formValueUpdates = (values) => {
              if (formDefs.arrayLast.length > 0) {
                for (const fld of formDefs.arrayLast) {
                  if (values[fld].length > 0) {
                    const idx = values[fld].length - 1;
                    values[fld][idx].last = 1;
                    if (values[fld][idx - 1] && values[fld][idx - 1].last) {
                      values[fld][idx - 1].last = 0;
                    }
                  }
                }
              }

              if (formDefs.multiCombo.length > 0) {
                for (const fld of formDefs.multiCombo) {
                  if (fld.indexOf('.') > 0) {
                    // support for one child field so we can handle multiCombo in table/group fields
                    const arrCFlds = fld.split('.');
                    traverseMultiCombo(arrCFlds, values, false);
                  } else {
                    traverseMultiCombo([fld], values, false);
                  }
                }
              }
              if (updateDynamicFormCode) {
                if (formAction.aggregate) {
                  updateDynamicFormCode(values, editorObject);
                } else {
                  const generatedCode = formTemplate(values);
                  updateDynamicFormCode(generatedCode);
                }
              }
            };

            // callback function to validate the input document
            const formInputValidate = (values) => {
              if (ddd && ddd.Validate && formFunctions[ddd.Validate]) {
                return formFunctions[ddd.Validate](values);
              }
              return true;
            };

            // Update the form after prefetching the data from controller
            const updatePrefilledData = (data) => {
              if (formDefs.multiCombo.length > 0) {
                for (const fld of formDefs.multiCombo) {
                  if (fld.indexOf('.') > 0) {
                    // support for one child field so we can handle multiCombo in table/group fields
                    const arrCFlds = fld.split('.');
                    traverseMultiCombo(arrCFlds, data);
                  } else {
                    traverseMultiCombo([fld], data);
                  }
                }
              }
              form.mobxForm.update(data); //eslint-disable-line
              form.mobxForm.submit(); //eslint-disable-line
            };

            const defaultParseFunction = (values) => {
              return values;
            };

            // check if definitions has a keyField for prefetching data and send request to controller
            // Method for pre-filling form:
            const getPrefilledFormData = () => {
              if (
                formAction.aggregate &&
                editorObject.blockList[editorObject.selectedBlock].modified
              ) {
                // Prefill fields with data from store.
                const blockFields =
                  editorObject.blockList[editorObject.selectedBlock].fields;
                updatePrefilledData(blockFields);
              } else if (ddd.DefaultValues) {
                // Else fill with default values.
                let params = {};
                if (ddd.DefaultValues.arguments) {
                  const args = ddd.DefaultValues.arguments;
                  params = this.resolveArguments(args);
                }
                let PrefilledValues;
                if (
                  ddd.DefaultValues.arguments &&
                  ddd.DefaultValues.arguments.length > 0
                ) {
                  PrefilledValues = formFunctions[ddd.DefaultValues.function](
                    params,
                  );
                } else {
                  PrefilledValues = formFunctions[ddd.DefaultValues.function]();
                }
                if (typeof PrefilledValues === 'string') {
                  let parseFunction;
                  if (formFunctions[ddd.DefaultValues.function + '_parse']) {
                    parseFunction =
                      formFunctions[ddd.DefaultValues.function + '_parse'];
                  } else {
                    parseFunction = defaultParseFunction;
                  }
                  SyncService.executeQuery(
                    PrefilledValues,
                    this.editor.shellId,
                    this.editor.profileId,
                  ).then((res) => {
                    const parsedValues = parseFunction(res);
                    updatePrefilledData(parsedValues);
                  });
                } else if (typeof PrefilledValues === 'object') {
                  updatePrefilledData(PrefilledValues);
                }
              }
            };

            // create a DynamicForm instance with the fields definitions and callback function
            const form = {
              title: ddd.Title,
              mobxForm: new DynamicForm(formDefs, {
                updates: formValueUpdates,
                validate: formInputValidate,
              }),
              getData: getPrefilledFormData,
            };
            resolve(form);
          })
          .catch((reason) => {
            reject(reason);
          });
      });
    } catch (e) {
      return new Promise().reject(e.message);
    }
  };
}
