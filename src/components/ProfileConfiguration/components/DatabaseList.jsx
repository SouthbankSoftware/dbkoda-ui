import React from 'react';

import './DatabaseList.scss';

export default class DatabaseList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {items: []};
  }

  componentDidMount() {
    this.setDatabaseList(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.setDatabaseList(nextProps);
  }

  setDatabaseList(properties) {
    if (properties.performancePanel && properties.performancePanel.databases) {
      this.setState({items: properties.performancePanel.databases});
    }
  }

  render() {
    return (
      <div className="profile-config-database-list">
        <div className="profile-db-list-title">
          {globalString(
            'performance/profiling/configuration/database-list-title'
          )}
        </div>
        <div className="profile-db-list">
          {this.state.items.map(item => {
            return <div>{item.name}</div>;
          })}
        </div>
      </div>
    );
  }
}
