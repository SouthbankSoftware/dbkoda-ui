import React from 'react';

export default class OutputToolbar extends React.Component {
  render(props) {
    return (
      <nav className="pt-navbar pt-dark .modifier">
        <div className="pt-navbar-group pt-align-left">
          <div className="pt-navbar-heading">Query Output</div>
          <button
            className="pt-button pt-icon-disable"
            onClick={this.props.clearOutput}
            title="Clear Output (Shortcut+Keys)"
          />
          <button
            className="pt-button"
            onClick={this.props.showMore}
            title="Show More (Shortcut+Keys)">
            Show More
          </button>
        </div>
        <div className="pt-navbar-group pt-right-align"></div>
      </nav>
    );
  }
}
