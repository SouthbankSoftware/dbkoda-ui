import React from 'react';
import '../styles/global.scss';
import {BlueprintDemo} from './blue-print-demo.jsx';

export default class App extends React.Component {
    render() {
      return (
        <div style={{textAlign: 'center'}}>
          <h1>DBEnvy UI</h1>
          <BlueprintDemo/>
        </div>
        );
    }
}
