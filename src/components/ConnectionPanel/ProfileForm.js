/**
 * profile form class
 */
import MobxReactForm from 'mobx-react-form';
import validatorjs from 'validatorjs';
import _ from 'lodash';

export class ProfileForm extends MobxReactForm {

  static mongoProtocol = 'mongodb://';

  onInit() {
    // add dynamic validation on each field
    this.$('hostRadio').observe({
      key: 'value',
      call: ({form, field, change}) => {
        if (change.newValue) {
          form.$('host').set('rules', 'required|string');
          form.$('port').set('rules', 'required|numeric');
        } else {
          form.$('host').set('rules', '');
          form.$('port').set('rules', '');
        }
        form.validate();
      },
    });
    this.$('urlRadio').observe({
      key: 'value',
      call: ({form, field, change}) => {
        if (change.newValue) {
          form.$('url').set('rules', 'regex:/^mongodb:\/\//');
        } else {
          form.$('url').set('rules', '');
        }
        form.validate();
      },
    });
    this.$('sha').observe({
      key: 'value',
      call: ({form, change}) => {
        if (change.newValue) {
          form.$('username').set('rules', 'required|string');
          form.$('password').set('rules', 'required|string');
        } else {
          form.$('username').set('rules', '');
          form.$('password').set('rules', '');
        }
        form.validate();
      }
    })
  }

  onSuccess(form) {
    this.connect({...this.createFormData(form), test: false});
  }

  onTest() {
    this.test({...this.createFormData(this), test: true});
  }

  createFormData(form) {
    const formValues = {...form.values()};
    return {
      ...formValues,
      authorization: true,
      test: false,
    };
  }

  onError(form) {
    // get all form errors
    console.log('All form errors', form.errors());
    // invalidate the form with a custom error message
    let errorMsg = [];
    const error = form.errors();
    _.keys(error).forEach(key => {
      if (error[key]) {
        errorMsg.push(error[key]);
      }
    });
    form.invalidate('Form has error.');
  }

  plugins() {
    return {
      dvr: {
        package: validatorjs,
        extend: ($validator) => {
          // here we can access the `validatorjs` instance
          var messages = $validator.getMessages('en');
          messages.required = ':attribute field is required.';
          $validator.setMessages('en', messages);
        },
      },
    };
  }

}

export const Form = {
  fields: [{
    name: 'alias',
    label: 'Alias',
    placeholder: 'Alias',
    value: 'Connection - 1',
    type: 'text',
    rules: 'required|string',
  }, {
    name: 'hostRadio',
    value: false,
    label: 'Host',
  }, {
    name: 'host',
    placeholder: 'Hostname',
    type: 'text',
    rules: 'string',
    label: 'Host',
  }, {
    name: 'port',
    type: 'number',
    rules: 'numeric',
    value: '27017',
    label: 'Port',
  }, {
    name: 'urlRadio',
    label: 'URL',
    value: true,
  }, {
    name: 'url',
    label: 'URL',
    placeholder: 'mongodb://',
    rules: 'regex:/^mongodb:\/\//',
    value: 'mongodb://ec2-13-54-17-227.ap-southeast-2.compute.amazonaws.com',
  }, {
    name: 'database',
    label: 'Database',
    value: 'admin',
  }, {
    name: 'ssl',
    label: 'SSL',
  }, {
    name: 'sha',
    value: false,
    label: 'SCRAM-SHA-1(username/password)',
  }, {
    name: 'username',
    label: 'Username',
    value: 'dbenvy',
  }, {
    name: 'password',
    label: 'Password',
    type: 'password',
  }]
};

export const createFormFromProfile = (profile) => {
  const fields = JSON.parse(JSON.stringify(Form.fields));
  fields[0].value = profile.alias;
  fields[1].value = profile.hostRadio;
  fields[2].value = profile.host;
  fields[3].value = profile.port;
  fields[4].value = profile.urlRadio;
  fields[5].value = profile.url;
  fields[6].value = profile.database;
  fields[7].value = profile.ssl;
  fields[8].value = profile.sha;
  fields[9].value = profile.username;
  fields[10].value = profile.password;
  return fields;
};

/**
 * create form data on profile panel.
 *
 * @param formData
 */
export const createForm = (profile = null) => {
  const formData = profile === null ? Form.fields : createFormFromProfile(profile);
  return new ProfileForm({fields: formData});
};
