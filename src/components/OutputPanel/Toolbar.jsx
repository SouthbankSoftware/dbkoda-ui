import React from 'react';
import {inject, observer} from 'mobx-react';
import {action} from 'mobx';

@inject('store')
@observer
export default class Toolbar extends React.Component {
  constructor(props) {
    super(props);
    this.clearOutput = this.clearOutput.bind(this);
  }

  @action clearOutput() {
    this.props.store.output = '';
  }

  render(props) {
    return (
      <nav className="pt-navbar pt-dark .modifier">
        <div className="pt-navbar-group pt-align-left">
          <div className="pt-navbar-heading">Query Output</div>
          <button
            className="pt-button pt-icon-disable"
            onClick={this.clearOutput}
            title="Clear Output (Shortcut+Keys)"
          />
          <button
            className="pt-button pt-disabled"
            onClick={this.props.showMore}
            title="Show More (Shortcut+Keys)"
            disabled="disabled">
            More
          </button>
        </div>
        <div className="pt-navbar-group pt-right-align"></div>
      </nav>
    );
  }
}
