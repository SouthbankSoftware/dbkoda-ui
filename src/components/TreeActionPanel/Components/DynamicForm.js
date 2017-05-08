/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-06T12:07:13+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-08T12:44:27+10:00
 */

import MobxReactForm from 'mobx-react-form';
import validatorjs from 'validatorjs';

export class DynamicForm extends MobxReactForm {
  sendFormValues;
  validateFormValues;
  constructor(setup, options) {
    super(setup, options);
    this.sendFormValues = options.updates;
    this.validateFormValues = options.validate;
  }
  onSuccess(form) {
    // get field values
    const formValues = form.values();
    if (this.validateFormValues) {
      try {
        const valid = this.validateFormValues(formValues);
        if (valid && this.sendFormValues) {
          this.sendFormValues(formValues);
        }
      } catch (e) {
        form.invalidate(e.message);
      }
    }
  }
  onError(form) {
    // get all form errors
    // console.log('All form errors', form.errors());
    // invalidate the form with a custom error message
    form.invalidate('This is a generic error message!');
  }
  onValueChange(form) {
    if (form.isValid) {
      form.submit();
    }
    // console.log('Testing change:', this.values());
  }
  onFieldChange = field =>
    (e) => {
      e.preventDefault();
      field.onChange(e);
      field.state.form.submit();
    };
  bindings() {
    return {
      TextField: ({ $try, field, props }) => ({
        type: $try(props.type, field.type),
        id: $try(props.id, field.id),
        name: $try(props.name, field.name),
        value: $try(props.value, field.value),
        label: $try(props.label, field.label),
        placeholder: $try(props.placeholder, field.placeholder),
        error: field.validating
          ? props.validatingText
          : $try(props.error, field.error),
        errorStyle: field.validating
          ? { background: 'yellow', color: 'black' }
          : {},
        disabled: $try(props.disabled, field.disabled),
        onChange: $try(props.onChange, this.onFieldChange(field)),
        onBlur: $try(props.onBlur, field.onBlur),
        onFocus: $try(props.onFocus, field.onFocus),
        autoFocus: $try(props.autoFocus, field.autoFocus)
      }),
      SelectField: ({ $try, field, props }) => ({
        type: $try(props.type, field.type),
        id: $try(props.id, field.id),
        name: $try(props.name, field.name),
        value: $try(props.value, field.value),
        label: $try(props.label, field.label),
        placeholder: $try(props.placeholder, field.placeholder),
        error: field.validating
          ? props.validatingText
          : $try(props.error, field.error),
        errorStyle: field.validating
          ? { background: 'yellow', color: 'black' }
          : {},
        disabled: $try(props.disabled, field.disabled),
        onChange: $try(props.onChange, this.onFieldChange(field)),
        onBlur: $try(props.onBlur, field.onBlur),
        onFocus: $try(props.onFocus, field.onFocus),
        autoFocus: $try(props.autoFocus, field.autoFocus)
      })
    };
  }
  plugins() {
    return {
      dvr: {
        package: validatorjs,
        extend: ($validator) => {
          const messages = $validator.getMessages('en');
          messages.required = ':attribute field is required.';
          $validator.setMessages('en', messages);
        }
      }
    };
  }
}
const getField = (defField, formFunctions) => {
  const res = {};
  res.fieldName = defField.name;
  res.fieldLabel = (defField.label) ? defField.label : defField.name;
  res.fieldType = defField.type;
  res.fieldRules = '';
  if (defField.readOnly) {
    res.disabled = true;
  }

  if (defField.keyValue) {
    // if a field is a key value, it should be required
    res.fieldRules += 'required';
  }
  if (defField.rules) {
    if (res.fieldRules && res.fieldRules.length > 0) {
      res.fieldRules += '|';
    }
    res.fieldRules += defField.rules;
  }
  if (defField.lookup && formFunctions[defField.lookup]) {
    res.fieldQuery = formFunctions[defField.lookup]();
    res.fieldParseFn = defField.lookup + '_parse';
  }
  if (defField.type == 'Text') {
    if (res.fieldRules && res.fieldRules.length > 0) {
      res.fieldRules += '|';
    }
    res.fieldRules += 'string';
    res.fieldBinding = 'TextField';
  }
  if (defField.type == 'Select') {
    if (res.fieldRules && res.fieldRules.length > 0) {
      res.fieldRules += '|';
    }
    res.fieldRules += 'string';
    res.fieldBinding = 'SelectField';
  }
  return res;
};
const resolveQueries = (queries, executeQuery, result) => {
  return new Promise((resolve, reject) => {
    const query = queries.pop();
    executeQuery(query)
      .then((res) => {
        result[query] = res;
        if (queries.length > 0) {
          resolveQueries(queries, executeQuery, result)
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
  * create fields for MobxReactForm with the definitions provided by the user
  * @param  {json} ddd Dialog Definitions document
  * @return {json}     Mobx React Form Fields
  */
const getFieldsFromDefinitions = (ddd, formFunctions, executeQuery) => {
  return new Promise((resolve, reject) => {
    const result = {};

    const fields = [];
    const labels = {};
    const types = {};
    const rules = {};
    const bindings = {};
    const disabled = {};
    const options = {};
    const arrayLast = []; // an object to keep reference of array fields to add last element later before sending to the template.
    const queries = []; // array of all the queries required by fields.
    const queryFieldsHash = {};

    const setFormOptions = (fld, fldName) => {
      fields.push(fldName);
      labels[fldName] = fld.fieldLabel;
      types[fldName] = fld.fieldType;
      rules[fldName] = fld.fieldRules;
      if (fld.fieldBinding) {
        bindings[fldName] = fld.fieldBinding;
      }
      if (fld.disabled) disabled[fldName] = fld.disabled;

      if (fld.fieldQuery) {
        if (queries.indexOf(fld.fieldQuery) < 0) {
          queries.push(fld.fieldQuery);
        }
        queryFieldsHash[fldName] = {query: fld.fieldQuery, parseFn: fld.fieldParseFn};
      }
    };

    for (const defField of ddd.Fields) {
      const resField = getField(defField, formFunctions);
      setFormOptions(resField, resField.fieldName);

      if (defField.type == 'Table') {
        for (const col of defField.columns) {
          const colField = getField(col, formFunctions);
          const colFieldName = resField.fieldName + '[].' + colField.fieldName;
          setFormOptions(colField, colFieldName);
        }
        arrayLast.push(resField.fieldName);
      }
    }

    result.fields = fields;
    result.labels = labels;
    result.rules = rules;
    result.types = types;
    result.disabled = disabled;
    result.bindings = bindings;
    result.arrayLast = arrayLast;

    if (queries.length > 0) {
      resolveQueries(queries, executeQuery, {})
        .then((resQueries) => {
          for (const fldName in queryFieldsHash) {
            if (queryFieldsHash[fldName]) {
              const fldQuery = queryFieldsHash[fldName];
              const resOpts = resQueries[fldQuery.query];
              let arrOptions = [];
              if (formFunctions[fldQuery.parseFn]) {
                arrOptions = [''].concat(formFunctions[fldQuery.parseFn](resOpts));
              }
              options[fldName] = arrOptions;
            }
          }
          result.options = options;
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

export const CreateForm = (
  treeActionStore,
  updateDynamicFormCode,
  executeQuery
) => {
  const treeAction = treeActionStore.treeAction;
  const treeNode = treeActionStore.treeNode;
  // Load the form definitions dynamically
  const ddd = require('../DialogDefinitions/' + treeAction + '.ddd.json'); //eslint-disable-line

  // Load the form functions to support the definitions dynamically
  const formFunctions = require('../Functions/' + treeAction + '.js')[treeAction]; //eslint-disable-line

  // load the form template
  const formTemplate = require('../Templates/' + treeAction + '.hbs'); //eslint-disable-line

  return new Promise((resolve, reject) => {
    // get Fields for Mobx React Form
    getFieldsFromDefinitions(ddd, formFunctions, executeQuery)
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
        }

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
            const params = {};
            if (ddd.DefaultValues.arguments) {
              const args = ddd.DefaultValues.arguments;
              for (let i = 0; i < args.length; i += 1) {
                const arg = args[i];
                switch (arg.value) {
                  case 'treeNode.parentDB':
                    if (treeNode.type == 'user') {
                      params[arg.name] = treeNode.json.db;
                    } else if (treeNode.type == 'collection') {
                      params[arg.name] = treeNode.refParent.json.text;
                    } else if (treeNode.type == 'index') {
                      params[arg.name] = treeNode.refParent.refParent.json.text;
                    }
                    break;

                  case 'treeNode.parentCOL':
                    if (treeNode.type == 'index') {
                      params[arg.name] = treeNode.refParent.json.text;
                    }
                    break;
                  default:
                    params[arg.name] = treeNode.json.text;
                }
              }
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
          mobxForm: new DynamicForm(formDefs, { updates: formValueUpdates, validate: formInputValidate }),
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
};
