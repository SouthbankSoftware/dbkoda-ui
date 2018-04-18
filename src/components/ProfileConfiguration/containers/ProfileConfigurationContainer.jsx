import {inject, observer} from 'mobx-react';
import React from 'react';
import {autorun} from 'mobx';

import ProfileConfiguration from '../components/ProfileConfigurationComponent';

@inject(({store, api}) => {
  return {
    store,
    api,
  };
})
@observer
class ProfileConfigurationContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {databases: []};
  }

  componentDidMount() {
    this._autorunDisposer = autorun(() => {
      const {profilingPanel} = this.props.store;
      if (profilingPanel.databases) {
        this.setState({databases: profilingPanel.databases});
      }
    });
  }

  componentWillUnmount() {
    this._autorunDisposer && this._autorunDisposer();
  }

  render() {
    return (
      <ProfileConfiguration
        databases={this.state.databases}
        showPerformancePanel={this.props.showPerformancePanel}
        performancePanel={this.props.store.performancePanel}
      />
    );
  }
}

export default ProfileConfigurationContainer;
