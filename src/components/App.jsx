import React from 'react';
import '../styles/normalize.css';
import '../../node_modules/@blueprintjs/core/dist/blueprint.css';
import '../styles/global.scss';
import {BlueprintDemo} from './blue-print-demo.jsx';
import {NavbarDemo} from './navbar-demo.jsx';

export default class App extends React.Component {
    render() {
      return (
        <div style={{textAlign: 'center'}}>
          <h1>DBEnvy UI Demo</h1>
          <NavbarDemo />
          <BlueprintDemo />
        </div>
        );
    }
}
