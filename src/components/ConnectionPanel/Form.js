export default {
  fields: [{
    name: 'alias',
    label: 'Alias',
    placeholder: 'Alias',
    type: 'text',
    rules: 'required|string',
  }, {
    name: 'host',
    label: 'Host',
    placeholder: 'Hostname',
    type: 'text',
    rules: 'required|string',
  }, {
    name: 'port',
    label: 'Port',
    type: 'number',
    rules: 'required|numeric',
    value: '27017',
  }, {
    name: 'url',
    label: 'URL',

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
