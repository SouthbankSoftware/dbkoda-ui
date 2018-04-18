import React from 'react';

import './DatabaseList.scss';

export default class DatabaseList extends React.Component {
  render() {
    return (
      <div className="profile-config-database-list">
        <div className="profile-db-list-title">
          {globalString(
            'performance/profiling/configuration/database-list-title'
          )}
        </div>
        <div className="profile-db-list">
          {this.props.databases.map(db => {
            return <div>{db.name}</div>;
          })}
        </div>
      </div>
    );
  }
}
