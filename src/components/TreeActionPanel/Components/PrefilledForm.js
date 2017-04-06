/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-06T12:07:13+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-04-06T16:48:33+10:00
 */


 import MobxReactForm from 'mobx-react-form';
 import validatorjs from 'validatorjs';
 import _ from 'lodash';
 import {featherClient} from '~/helpers/feathers';

 export class PrefilledForm extends MobxReactForm {

   onSuccess(form) {
     console.log('Form is valid! Send the request here.');
      // get field values
      console.log('Form Values!', form.values());
   }
   onError(form) {
     // get all form errors
    console.log('All form errors', form.errors());
    // invalidate the form with a custom error message
    form.invalidate('This is a generic error message!');
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
     const service = featherClient().service('/mongo-shells');
     service.timeout = 30000;
     service.get(id, {
       shellId: shell, // eslint-disable-line
       commands: content
     }).then((res) => {
       resolve(res);
     }).catch((reason) => {
       reject(reason);
     }
     );
   });
 };

 export const CreateForm = (treeNode, treeAction) => {
   const fields = require('../DialogDefinitions/' + treeAction + '.ddd.json');  //eslint-disable-line
   const formFunctions = require('../Functions/' + treeAction + '.js')[treeAction]; //eslint-disable-line
   formFunctions.setExecuteFunction(executeCommand);
   const form = new PrefilledForm({fields: formData});
   return form;
 };
