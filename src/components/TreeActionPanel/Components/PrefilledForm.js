/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-06T12:07:13+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-04-11T16:26:47+10:00
 */

 /* eslint-disable */
 import MobxReactForm from 'mobx-react-form';
 import validatorjs from 'validatorjs';
 import {featherClient} from '~/helpers/feathers';

 export class PrefilledForm extends MobxReactForm {

   onSuccess(form) {
      // get field values
      console.log('Form Values!', form.values());
   }
   onError(form) {
     // get all form errors
    console.log('All form errors', form.errors());
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
         extend: ($validator) => {
           const messages = $validator.getMessages('en');
           messages.required = ':attribute field is required.';
           $validator.setMessages('en', messages);
         },
       },
     };
   }
 }

 const executeCommand = (content) => {
   return new Promise((resolve, reject) => {
    //  const service = featherClient().service('/mongo-shells');
    //  service.timeout = 30000;
    //  service.get(id, {
    //    shellId: shell, // eslint-disable-line
    //    type: 'cmd',
    //    commands: content
    //  }).then((res) => {
    //    resolve(res);
    //  }).catch((reason) => {
    //    reject(reason);
    //  }
    //  );
     console.log(content);
     resolve([{
       _id: 'testWahaj',
       db: 'testDB',
       user: 'testwahaj-user',
       customData: '{"TEST":"TEST123"}',
       roles: [{role:'admin', db:'testDB'}, {role:'user', db:'test123'}]
     }]);
   });
 };


 const getFieldsFromDefinitions = (ddd, treeNode) => {
   const nodeValue = treeNode.text;
   const fields = [];

   for (const defField of ddd.Fields) {
     const formField = {};
     formField.name = defField.name;
     formField.label = defField.name;
     formField.type = defField.type;

     if (defField.keyValue) {
       formField.value = nodeValue;
     }
     if (defField.readOnly) {
       formField.readonly = true;
     }
     if (defField.type == 'Table') {
       formField.fields = [];
       for (const col of defField.columns) {
         const colField = {};
         colField.name = col.name;
         colField.label = col.name;
         colField.type = col.type;
         formField.fields.push(colField);
       }
     }
     fields.push(formField);
   }
   return fields;
 };

 export const CreateForm = (treeNode, treeAction) => {
   const ddd = require('../DialogDefinitions/' + treeAction + '.ddd.json');  //eslint-disable-line
   const formFunctions = require('../Functions/' + treeAction + '.js')[treeAction]; //eslint-disable-line
   formFunctions.setExecuteFunction(executeCommand);

   const formFields = getFieldsFromDefinitions(ddd, treeNode);
   const form = {title: ddd.Title, mobxForm: new PrefilledForm({fields: formFields})};
   const updatePrefilledData = (data) => {
       for (const key in data) {
         if (Object.prototype.hasOwnProperty.call(data, key)) {
           console.log('wahaj', key, data[key]);
           form.mobxForm.$(key).set('value', data[key]);
         }
       }
   };
   // Get keyfield to prefill the form
   const keyField = ddd.Fields.filter((item) => {
     if (item.keyValue) { return item.keyValue; }
     return false;
   });
   if (keyField) {
     const PrefilledValues = formFunctions[ddd.DefaultValues.function](treeNode.text);
     PrefilledValues.then(updatePrefilledData);
   }
   return form;
 };
