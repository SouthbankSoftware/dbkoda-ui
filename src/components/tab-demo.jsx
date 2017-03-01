import React from "react";
import {Tabs, TabList, Tab, TabPanel} from "@blueprintjs/core";
import { inject, observer,observable } from 'mobx-react'
let CodeMirror = require('react-codemirror');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/xml/xml');
require('codemirror/mode/markdown/markdown');

export default class TabDemo extends React.Component {

  render() {
    return (
      <Tabs>
        <TabList>
          <Tab>First tab</Tab>
          <Tab>Second tab</Tab>
          <Tab>Third tab</Tab>
          <Tab isDisabled={true}>Fourth tab</Tab>
        </TabList>
        <TabPanel>
          <OutputTab/>
        </TabPanel>
        <TabPanel>
          Second panel
        </TabPanel>
        <TabPanel>
          Third panel
        </TabPanel>
        <TabPanel>
          Fourth panel
        </TabPanel>
      </Tabs>
    );
  }
}


@observer
class OutputTab extends React.Component {
  // @observable commands = [];

  constructor(props) {
    super(props);
    this.state = {code: ''}
  }

  render() {
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
      onChange={(value) => this.setState({code: value})}
      options={options}/>);
  }

}