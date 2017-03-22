/**
 * profile form classs
 */
import MobxReactForm from 'mobx-react-form';

export class ProfileForm extends MobxReactForm {

  static mongoProtocol = 'mongodb://';

  onInit() {
    this.$('hostRadio').observe({
      key: 'value',
      call: ({form, field, change}) => {
        form.$('urlRadio').set('value', change.oldValue);
      },
    });
    this.$('urlRadio').observe({
      key: 'value',
      call: ({form, field, change}) => {
        form.$('hostRadio').set('value', change.oldValue);
      },
    });
  }

  onSuccess(form) {
    this.connect({...this.createFormData(form), test: false});
  }

  onTest() {
    this.testConnect({...this.createFormData(this), test: true});
  }

  createFormData(form) {
    const formValues = form.values();
    let connectionUrl;
    if (formValues.hostRadio) {
      connectionUrl = ProfileForm.mongoProtocol + formValues.host + ':' + formValues.port;
    } else if (formValues.urlRadio) {
      connectionUrl = formValues.url;
    }
    if (formValues.sha) {
      const split = connectionUrl.split(ProfileForm.mongoProtocol);
      connectionUrl = ProfileForm.mongoProtocol + formValues.username + ':' + formValues.password + '@' + split[1];
    }
    return {
      url: connectionUrl,
      database: formValues.database,
      authorization: true,
      test: false,
      alias: formValues.alias
    };
  }

  onError(form) {
    // get all form errors
    console.log('All form errors', form.errors());
    // invalidate the form with a custom error message
    form.invalidate('This is a generic error message!');
  }

  // plugins() {
  //   return {
  //     dvr: {
  //       package: validatorjs,
  //     },
  //   };
  // }

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
  }, {
    name: 'port',
    type: 'number',
    rules: 'numeric',
    value: '27017',
  }, {
    name: 'urlRadio',
    label: 'URL',
    value: true,
  }, {
    name: 'url',
    label: 'URL',
    placeholder: 'mongodb://',
    value: 'mongodb://ec2-13-54-17-227.ap-southeast-2.compute.amazonaws.com',
  }, {
    name: 'database',
    label: 'Database',
    value: 'test',
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

