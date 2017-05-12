/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-05-09T09:20:44+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-12T11:14:23+10:00
 */

import { DynamicForm } from './Components/DynamicForm';

export default class FormBuilder {
  treeNode: null;
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
    }
    if (defField.type == 'Combo') {
      res.fieldBinding = 'ComboField';
    }
    return res;
  };
  /**
   * Function to resolve all the queries for the fieldset one by one
   * @param  {Array}    queries       Array of queries for the fieldset
   * @param  {Function} executeQuery  Callback function to execute the queries
   * @param  {Object}   result        Result Object to be populated as the queries resolve one by one
   * @return {Promise}                Promise to be resolved after all the queries have been resolved
   */
  resolveQueries = (queries, executeQuery, result) => {
    return new Promise((resolve, reject) => {
      const query = queries.pop();
      executeQuery(query)
        .then((res) => {
          result[query] = res;
          if (queries.length > 0) {
            this.resolveQueries(queries, executeQuery, result)
              .then((result) => {
                resolve(result);
              })
              .catch((reason) => {
                console.log(
                  'resolveQueries:',
                  'Handle rejected promise (' + reason + ') here.'
                );
                reject(reason);
              });
          } else {
            resolve(result);
          }
        })
        .catch((reason) => {
          console.log(
            'resolveQueries:',
            'Handle rejected promise (' + reason + ') here.'
          );
          reject(reason);
        });
    });
  };
  /**
   * Function to get Mobx React Form Fields from the Dialog Defininition document
   * @param  {Object}   ddd           Object containing fields defined in DDD document
   * @param  {Object}   formFunctions Array of function from the supporting DDD file
   * @param  {Function} executeQuery  Callback function to execute the queries
   * @return {Promise}                Promise to be resolved after all fields has been generated
   */
  getFieldsFromDefinitions = (ddd, formFunctions, executeQuery) => {
    return new Promise((resolve, reject) => {
      const result = {};
      result.fields = [];
      result.labels = {};
      result.rules = {};
      result.types = {};
      result.disabled = {};
      result.bindings = {};
      result.arrayLast = []; // an object to keep reference of array fields to add last element later before sending to the template.
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

        if (fld.fieldQuery) {
          if (queries.indexOf(fld.fieldQuery) < 0) {
            queries.push(fld.fieldQuery);
          }
          queryFieldsHash[fldName] = {
            query: fld.fieldQuery,
            parseFn: fld.fieldParseFn
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
            const colFieldName = resField.fieldName +
              '[].' +
              colField.fieldName;
            setFormOptions(colField, colFieldName);
          }
          result.arrayLast.push(resField.fieldName); // this is utilized after the form has returned the input document for the template
        }
      }

      // if there are db queries resolve them and update the options for select fields
      if (queries.length > 0) {
        this.resolveQueries(queries, executeQuery, {})
          .then((resQueries) => {
            for (const fldName in queryFieldsHash) {
              if (queryFieldsHash[fldName]) {
                const fldQuery = queryFieldsHash[fldName];
                const resOpts = resQueries[fldQuery.query];
                let arrOptions = [];
                if (formFunctions[fldQuery.parseFn]) {
                  try {
                    arrOptions = [''].concat(
                      formFunctions[fldQuery.parseFn](resOpts)
                    );
                  } catch (e) {
                    console.log(e.stack);
                  }
                }
                if (result.options[fldName]) {
                  result.options[fldName].dropdown = arrOptions;
                } else {
                  result.options[fldName] = { dropdown: arrOptions };
                }
              }
            }
            resolve(result);
          })
          .catch((reason) => {
            console.log(
              'getFieldsFromDefinitions:',
              'Handle rejected promise (' + reason + ') here.'
            );
            reject(reason);
          });
      } else {
        resolve(result);
      }
    });
  };
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
  /**
   * Function to create a dynamic form based on the tree action.
   * @param  {Object}   treeActionStore       Store which contains all the information about selected tree action
   * @param  {Function} updateDynamicFormCode Callback function to send the generated code back to editor
   * @param  {Function} executeQuery          Callback function to execute prefetching queries
   * @return {Promise}                        Promise which will be resolved once all the queries for prefetching are resolved.
   */
  createForm = (treeActionStore, updateDynamicFormCode, executeQuery) => {
    try {
      const treeAction = treeActionStore.treeAction;
      this.treeNode = treeActionStore.treeNode;
      // Load the form definitions dynamically
      const ddd = require('./DialogDefinitions/' + treeAction + '.ddd.json'); //eslint-disable-line

      // Load the form functions to support the definitions dynamically
      const formFunctions = require('./Functions/' + treeAction + '.js')[     //eslint-disable-line
        treeAction
      ];

      // load the form template
      const formTemplate = require('./Templates/' + treeAction + '.hbs'); //eslint-disable-line

      return new Promise((resolve, reject) => {
        // get Fields for Mobx React Form
        this.getFieldsFromDefinitions(ddd, formFunctions, executeQuery)
          .then((formDefs) => {
            console.log(formDefs);

            // callback function to get the updated values from the form
            const formValueUpdates = (values) => {
              console.log('form new values:', values);
              if (formDefs.arrayLast.length > 0) {
                for (const fld of formDefs.arrayLast) {
                  if (values[fld].length > 0) {
                    const idx = values[fld].length - 1;
                    values[fld][idx].last = 1;
                  }
                }
              }
              if (treeActionStore) {
                const generatedCode = formTemplate(values);
                updateDynamicFormCode(generatedCode);
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
              form.mobxForm.update(data); //eslint-disable-line
            };

            const defaultParseFunction = (values) => {
              return values;
            };

            // check if definitions has a keyField for prefetching data and send request to controller
            const getPrefilledFormData = () => {
              if (ddd.DefaultValues) {
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
                    params
                  );
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
                    parseFunction = defaultParseFunction;
                  }
                  executeQuery(PrefilledValues).then((res) => {
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
                validate: formInputValidate
              }),
              getData: getPrefilledFormData
            };
            treeActionStore.form = form;

            resolve(form);
          })
          .catch((reason) => {
            console.log(
              'CreateForm:',
              'Handle rejected promise (' + reason + ') here.'
            );
            reject(reason);
          });
      });
    } catch (e) {
      return new Promise().reject(e.message);
    }
  };
}
