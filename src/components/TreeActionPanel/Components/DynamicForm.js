/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-06T12:07:13+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-04-18T13:27:04+10:00
 */

/* eslint-disable */
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
  plugins() {
    return {
      dvr: {
        package: validatorjs,
        extend: $validator => {
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
const getFieldsFromDefinitions = ddd => {
  const result = {};

  const fields = [];
  const labels = {};
  const rules = {};
  const types = {};
  const disabled = {};

  for (const defField of ddd.Fields) {

    const fieldName = defField.name;
    fields.push(fieldName);

    const fieldLabel = defField.name;
    labels[fieldName] = fieldLabel;

    if (defField.readOnly) {
      disabled[fieldName] = true;
    }

    let fieldRules = 'string';
    if (defField.keyValue) {
      fieldRules += '|required'
    }

    types[fieldName] = defField.type;

    if (defField.type == 'Text') {
      rules[fieldName] = fieldRules;
    }

    if (defField.type == 'Table') {
      for (const col of defField.columns) {
        const colFieldName = fieldName + '[].' + col.name;
        fields.push(colFieldName);
        labels[colFieldName] = col.name;
        types[colFieldName] = col.type;
        rules[colFieldName] = 'string';
      }
    }
  }

  result.fields = fields;
  result.labels = labels;
  result.rules = rules;
  result.types = types;
  result.disabled = disabled;

  return result;
};

export const CreateForm = (treeActionStore, updateDynamicFormCode, executeCommandFunc) => {
  const treeAction = treeActionStore.treeAction;
  const treeNode = treeActionStore.treeNode;
  // Load the form definitions dynamically
  const ddd = require('../DialogDefinitions/' + treeAction + '.ddd.json'); //eslint-disable-line

  // Load the form functions to support the definitions dynamically
  const formFunctions = require('../Functions/' + treeAction + '.js')[treeAction]; //eslint-disable-line

  // load the form template
  const formTemplate = require('../Templates/' + treeAction + '.hbs'); //eslint-disable-line

  // set executeCommandFunc which will be called from Form Functions to get the data from controller.
  formFunctions.setExecuteFunction(executeCommandFunc);

  // get Fields for Mobx React Form
  const formDefs = getFieldsFromDefinitions(ddd);
  console.log(formDefs);

  // callback function to get the updated values from the form
  const formValueUpdates = values => {
    console.log('form new values:', values);
    if (treeActionStore) {
      const generatedCode = formTemplate(values);
      updateDynamicFormCode(generatedCode);
    }
  };

  // Get keyfield to prefill the form
  const keyField = ddd.Fields.filter(item => {
    if (item.keyValue) {
      return item.keyValue;
    }
    return false;
  });

  // Update the form after prefetching the data from controller
  const updatePrefilledData = data => {
    form.mobxForm.update(data);
  };

  // check if definitions has a keyField for prefetching data and send request to controller
  const getPrefilledFormData = () => {
    if (keyField && keyField.length > 0) {
      let keyValue = null;
      switch (keyField[0].name) {
        case 'UserId':
          if (treeNode.type == 'user') {
            keyValue = treeNode.json.db + '.' + treeNode.json.text;
          }
          break;
        default:
          keyValue = treeNode.text;
      }
      const PrefilledValues = formFunctions[ddd.DefaultValues.function](keyValue);
      PrefilledValues.then(updatePrefilledData);
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
