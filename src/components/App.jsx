import React from 'react';

import '../../node_modules/normalize.css/normalize.css';
import '../../node_modules/@blueprintjs/core/dist/blueprint.css';
import '../../node_modules/codemirror/lib/codemirror.css';
import '../../node_modules/codemirror/theme/ambiance.css';
import '../styles/global.scss';
import {BlueprintDemo} from './blue-print-demo.jsx';
import {NavbarDemo} from './navbar-demo.jsx';
import {Codemirror} from './codemirror-demo.jsx';

export default class App extends React.Component {
  render() {
    return (
      <div>
        <div style={{
          textAlign: 'center'
        }}>
          <h1>DBEnvy UI Demo</h1>
          <NavbarDemo/>
        </div>
        <div className="middleRow">
          <div className="sidePanel">
            <h1>Side Panel.</h1>
          </div>
          <div className="editorPanel">
            <h1>Editor</h1>
            <Codemirror />
          </div>
          <div className="outputPanel">
            <h1>
              Output
            </h1>
          </div>
        </div>
      </div>
    );
  }
}
