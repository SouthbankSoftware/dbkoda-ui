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
 * @Last modified by:   wahaj
 * @Last modified time: 2017-08-23T15:15:10+10:00
 */

/**
 * profile form class
 */
import MobxReactForm from 'mobx-react-form';
import validatorjs from 'validatorjs';
import _ from 'lodash';
import autobind from 'autobind-decorator';

export class ProfileForm extends MobxReactForm {
  static mongoProtocol = 'mongodb://';

  static getRandomPort() {
    if (GetRandomPort) {
      return GetRandomPort(6000, 7000, '127.0.0.1');
    }
    return new Promise().resolve(Math.floor(Math.random() * 7000) + 6000);
  }

  onInit() {
    // add dynamic validation on each field

    this.$('hostRadio').observe({
      key: 'value',
      call: ({ form, change }) => {
        this.addHostRules(form, change.newValue);
        form.validate();
      },
    });
    this.$('urlRadio').observe({
      key: 'value',
      call: ({ form, change }) => {
        this.addUrlRules(form, change.newValue);
        form.validate();
      },
    });
    this.$('sha').observe({
      key: 'value',
      call: ({ form, change }) => {
        this.addAuthenticationRules(form, change.newValue);
        form.validate();
      },
    });
    this.$('ssh').observe({
      key: 'value',
      call: ({ form, change }) => {
        this.addSshRules(form, change.newValue);
        form.validate();
      },
    });
  }

  addUrlRules(form, value) {
    if (value) {
      form.$('url').set('rules', 'regex:/^mongodb:///');
    } else {
      form.$('url').set('rules', '');
    }
  }

  addAuthenticationRules(form, value) {
    if (value) {
      form.$('username').set('rules', 'required|string');
      form.$('password').set('rules', 'required|string');
    } else {
      form.$('username').set('rules', '');
      form.$('password').set('rules', '');
    }
  }

  addHostRules(form, value) {
    if (value) {
      form.$('host').set('rules', 'required|string');
      form.$('port').set('rules', 'required|numeric');
    } else {
      form.$('host').set('rules', '');
      form.$('port').set('rules', '');
    }
  }

  addSshRules(form, value) {
    if (value) {
      form.$('remoteHost').set('rules', 'required|string');
      form.$('remoteUser').set('rules', 'required|string');
      this.$('keyRadio').observe({
        key: 'value',
        call: ({ form, change }) => {
          this.addKeyRules(form, change.newValue);
          form.validate();
        },
      });
      this.$('passRadio').observe({
        key: 'value',
        call: ({ form, change }) => {
          this.addRemotePassRules(form, change.newValue);
          form.validate();
        },
      });
      this.addKeyRules(form, form.$('keyRadio').value);
      this.addRemotePassRules(form, form.$('passRadio').value);
    } else {
      form.$('remoteHost').set('rules', '');
      form.$('remoteUser').set('rules', '');
      this.addKeyRules(form, false);
      this.addRemotePassRules(form, false);
    }
    form.validate();
  }

  addKeyRules(form, value) {
    if (value) {
      form.$('sshKeyFile').set('rules', 'required|string');
    } else {
      form.$('sshKeyFile').set('rules', '');
    }
  }
  addRemotePassRules(form, value) {
    if (value) {
      form.$('remotePass').set('rules', 'required|string');
    } else {
      form.$('remotePass').set('rules', '');
    }
  }

  @autobind
  onSuccess(form) {
    this.connect({ ...this.createFormData(form), test: false });
  }

  @autobind
  onTest() {
    this.test({ ...this.createFormData(this), test: true });
  }

  @autobind
  onSave() {
    this.save({ ...this.createFormData(this) });
  }

  createFormData(form) {
    const formValues = { ...form.values() };
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
    const errorMsg = [];
    const error = form.errors();
    _.keys(error).forEach((key) => {
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
          const messages = $validator.getMessages('en');
          messages.required = globalString('connection/form/requiredMessage');
          $validator.setMessages('en', messages);
        },
      },
    };
  }
}

export const Form = {
  fields: [
    {
      name: 'alias',
      label: 'Alias',
      placeholder: 'Alias',
      value: 'Connection - 1',
      type: 'text',
      rules: 'required|string',
    },
    {
      name: 'hostRadio',
      value: true,
      label: 'Host',
    },
    {
      name: 'host',
      placeholder: 'Hostname',
      value: 'localhost',
      type: 'text',
      rules: 'string',
      label: 'Host',
    },
    {
      name: 'port',
      type: 'number',
      rules: 'numeric',
      value: '27017',
      label: ':',
    },
    {
      name: 'urlRadio',
      label: 'URI',
      value: false,
    },
    {
      name: 'url',
      label: 'URI',
      placeholder: 'mongodb://',
      rules: 'regex:/^mongodb:///',
      value: 'mongodb://',
    },
    {
      name: 'database',
      label: 'Database',
      value: 'admin',
    },
    {
      name: 'authenticationDatabase',
      label: 'Authentication Database',
      value: '',
    },
    {
      name: 'ssl',
      value: false,
      label: 'SSL',
    },
    {
      name: 'sslAllowInvalidCertificates',
      value: false,
      label: 'Allow Invalid Certificates',
    },
    {
      name: 'sha',
      value: false,
      label: 'SCRAM-SHA-1(username/password)',
    },
    {
      name: 'username',
      label: 'Username',
      placeholder: 'Username',
    },
    {
      name: 'password',
      label: 'Password',
      placeholder: 'Password',
      type: 'password',
    },
    {
      name: 'ssh',
      value: false,
      label: 'SSH Tunnel',
    },
    {
      name: 'remoteHost',
      placeholder: 'SSH Host',
      type: 'text',
      rules: 'string',
      label: 'SSH Host',
    },
    {
      name: 'remoteUser',
      label: 'Username',
      placeholder: 'Remote Username',
    },
    {
      name: 'passRadio',
      value: false,
      label: 'Password',
    },
    {
      name: 'remotePass',
      label: 'Password',
      placeholder: 'Remote Password',
      type: 'password',
    },
    {
      name: 'keyRadio',
      value: true,
      label: 'Key',
    },
    {
      name: 'sshKeyFile',
      label: 'Key',
      placeholder: 'Private Key File',
    },
    {
      name: 'passPhrase',
      label: 'Phrase',
      placeholder: 'Passphrase(optional)',
      type: 'password',
    },
  ],
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
  fields[19].value = profile.authenticationDatabase;
  fields[7].value = profile.ssl;
  fields[20].value = profile.sslAllowInvalidCertificates;
  fields[8].value = profile.sha;
  fields[9].value = profile.username;
  fields[10].value = profile.password;
  fields[11].value = profile.ssh;
  fields[12].value = profile.remoteHost;
  fields[13].value = profile.remoteUser;
  fields[14].value = profile.passRadio;
  fields[15].value = profile.remotePass;
  fields[16].value = profile.keyRadio;
  fields[17].value = profile.sshKeyFile;
  fields[18].value = profile.passPhrase;
  return fields;
};

/**
 * create form data on profile panel.
 *
 * @param formData
 */
export const createForm = (profile = null) => {
  const formData =
    profile === null ? Form.fields : createFormFromProfile(profile);
  return new ProfileForm({ fields: formData });
};
