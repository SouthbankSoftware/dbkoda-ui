let React = require('react');
let CodeMirror = require('react-codemirror');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/xml/xml');
require('codemirror/mode/markdown/markdown');


export const Codemirror = React.createClass({
  getInitialState () {
    return {code: '// Welcome to DBEnvy!'};
  },
  updateCode (newCode) {
    this.setState({code: newCode});
  },
  render () {
    let options = {
      mode: 'text/javascript',
      matchBrackets: true,
      json: true,
      jsonld: true,
      smartIndent: true,
      theme: 'ambiance',
      typescript: true,
      lineNumbers: true
    };
    return (<CodeMirror
      value={this.state.code}
      onChange={this.updateCode}
      options={options}/>);
  }
});
