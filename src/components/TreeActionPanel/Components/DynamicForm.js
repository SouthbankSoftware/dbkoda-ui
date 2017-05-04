/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-06T12:07:13+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-04T13:42:05+10:00
 */

import MobxReactForm from 'mobx-react-form';
import validatorjs from 'validatorjs';

export class DynamicForm extends MobxReactForm {
  sendFormValues;
  constructor(setup, options) {
    super(setup, options);
    this.sendFormValues = options.updates;
  }
  onSuccess(form) {
    // get field values
    if (this.sendFormValues) {
      this.sendFormValues(form.values());
    }
  }
  onError(form) {
    // get all form errors
    // console.log('All form errors', form.errors());
    // invalidate the form with a custom error message
    form.invalidate('This is a generic error message!');
  }
  onValueChange(form) {
    form.submit();
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
        error: field.validating ? props.validatingText : $try(props.error, field.error),
        errorStyle: field.validating ? { background: 'yellow', color: 'black' } : {},
        disabled: $try(props.disabled, field.disabled),
        onChange: $try(props.onChange, this.onFieldChange(field)),
        onBlur: $try(props.onBlur, field.onBlur),
        onFocus: $try(props.onFocus, field.onFocus),
        autoFocus: $try(props.autoFocus, field.autoFocus),
      }),
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
        },
      },
    };
  }
}

/**
  * create fields for MobxReactForm with the definitions provided by the user
  * @param  {json} ddd Dialog Definitions document
  * @return {json}     Mobx React Form Fields
  */
const getFieldsFromDefinitions = (ddd) => {
  const result = {};

  const fields = [];
  const labels = {};
  const types = {};
  const rules = {};
  const bindings = {};
  const disabled = {};
  const arrayLast = [];     // an object to keep reference of array fields to add last element later before sending to the template.

  const getField = (defField) => {
    const res = {};
    res.fieldName = defField.name;
    res.fieldLabel = defField.name;
    res.fieldType = defField.type;
    res.fieldRules = '';
    if (defField.readOnly) {
      res.disabled = true;
    }

    if (defField.keyValue) {
      res.fieldRules += 'required';
    }
    if (defField.rules) {
      if (res.fieldRules && res.fieldRules.length > 0) {
        res.fieldRules += '|';
      }
      res.fieldRules += defField.rules;
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

  for (const defField of ddd.Fields) {
    const resField = getField(defField);

    fields.push(resField.fieldName);
    labels[resField.fieldName] = resField.fieldLabel;
    types[resField.fieldName] = resField.fieldType;
    rules[resField.fieldName] = resField.fieldRules;
    if (resField.fieldBinding) bindings[resField.fieldName] = resField.fieldBinding;
    if (resField.disabled) disabled[resField.fieldName] = resField.disabled;

    if (defField.type == 'Table') {
      for (const col of defField.columns) {
        const colField = getField(col);
        const colFieldName = resField.fieldName + '[].' + colField.fieldName;
        fields.push(colFieldName);
        labels[colFieldName] = colField.fieldLabel;
        types[colFieldName] = colField.fieldType;
        rules[colFieldName] = colField.fieldRules;
        bindings[colFieldName] = colField.fieldBinding;
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

  return result;
};

export const CreateForm = (treeActionStore, updateDynamicFormCode, executeQuery) => {
  const treeAction = treeActionStore.treeAction;
  const treeNode = treeActionStore.treeNode;
  // Load the form definitions dynamically
  const ddd = require('../DialogDefinitions/' + treeAction + '.ddd.json'); //eslint-disable-line

  // Load the form functions to support the definitions dynamically
  const formFunctions = require('../Functions/' + treeAction + '.js')[treeAction]; //eslint-disable-line

  // load the form template
  const formTemplate = require('../Templates/' + treeAction + '.hbs'); //eslint-disable-line

  // // set executeQuery which will be called from Form Functions to get the data from controller.
  // formFunctions.setExecuteFunction(executeQuery);

  // get Fields for Mobx React Form
  const formDefs = getFieldsFromDefinitions(ddd);
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

  // Get keyfield to prefill the form
  // const keyField = ddd.Fields.filter((item) => {
  //   if (item.keyValue) {
  //     return item.keyValue;
  //   }
  //   return false;
  // });

  // Update the form after prefetching the data from controller
  const updatePrefilledData = (data) => {
    form.mobxForm.update(data);         //eslint-disable-line
  };

  const defaultParseFunction = (values) => {
    return values;
  };

  // check if definitions has a keyField for prefetching data and send request to controller
  const getPrefilledFormData = () => {
    // let keyValues = [];
    // if (keyField && keyField.length > 0) {
    //   switch (keyField[0].name) {
    //     case 'UserId':
    //       if (treeNode.type == 'user') {
    //         keyValue = treeNode.json.db + '.' + treeNode.json.text;
    //       }
    //       break;
    //     default:
    //       keyValue = treeNode.text;
    //   }
    // }

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
      if (ddd.DefaultValues.arguments && ddd.DefaultValues.arguments.length > 0) {
        PrefilledValues = formFunctions[ddd.DefaultValues.function](params);
      } else {
        PrefilledValues = formFunctions[ddd.DefaultValues.function]();
      }

      if (typeof PrefilledValues === 'string') {
        let parseFunction;
        if (formFunctions[ddd.DefaultValues.function + '_parse']) {
          parseFunction = formFunctions[ddd.DefaultValues.function + '_parse'];
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
    mobxForm: new DynamicForm(formDefs, { updates: formValueUpdates }),
    getData: getPrefilledFormData,
  };
  treeActionStore.form = form;

  return form;
};
