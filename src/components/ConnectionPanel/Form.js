export default {
  fields: [{
    name: 'alias',
    label: 'Alias',
    placeholder: 'Alias',
    type: 'text',
    rules: 'required|string',
  }, {
    name: 'hostRadio',
    value: true,
    label: 'Host',
  },
    {
      name: 'host',
      placeholder: 'Hostname',
      type: 'text',
      rules: 'required|string',
    }, {
      name: 'port',
      type: 'number',
      rules: 'required|numeric',
      value: '27017',
    }, {
      name: 'urlRadio',
      label: 'URL',
      value: false,
    },
    {
      name: 'url',
      label: 'URL',
      value: '',
    }, {
      name: 'database',
      label: 'Database',
    }, {
      name: 'ssl',
      label: 'SSL',
    }, {
      name: 'sha',
      label: 'SCRAM-SHA-1(username/password)',
    }, {
      name: 'username',
      label: 'Username'
    }, {
      name: 'password',
      label: 'Password',
    }]
};
