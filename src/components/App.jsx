/**
 * @Author: guiguan
 * @Date:   2017-03-07T13:47:00+11:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-03-07T18:35:03+11:00
 */

import React from 'react';
import SplitPane from 'react-split-pane';
import Drawer from 'react-motion-drawer';
import { Button } from '@blueprintjs/core';

import 'normalize.css/normalize.css';
import '@blueprintjs/core/dist/blueprint.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/ambiance.css';
import '../styles/global.scss';
import './App.scss';

// import {BlueprintDemo} from './blue-print-demo.jsx';
// import {NavbarDemo} from './navbar-demo.jsx';
// import {Codemirror} from './codemirror-demo.jsx';
// import TabDemo from './tab-demo.jsx';
//
// export default class App extends React.Component {
//   render() {
//     return (
//       <div>
//         <div style={{
//           textAlign: 'center'
//         }}>
//           <h1>DBEnvy UI Demo</h1>
//           <NavbarDemo/>
//         </div>
//         <div className="middleRow">
//           <div className="sidePanel">
//             <h1>Side Panel.</h1>
//           </div>
//           <div className="editorPanel">
//             <NavbarDemo />
//             <Codemirror />
//             <TabDemo/>
//           </div>
//           <div className="outputPanel">
//             <h1>
//               Output
//             </h1>
//           </div>
//         </div>
//       </div>
//     );
//   }
// }

export default class App extends React.Component {
  state = {
    drawerOpen: open,
  };

  render() {
    const { drawerOpen } = this.state;

    return (
      <div>
        <Drawer
          open={drawerOpen}
          width="36%"
          handleWidth={0}
          onChange={open => this.setState({ drawerOpen: open })}
        >
          <div
            style={{
              backgroundColor: 'white',
              width: '100%',
              height: '100%',
              display: 'flex',
              flex: '1 1 0%',
            }}
          >
            <p>Please close me!!!</p>
          </div>
        </Drawer>
        <SplitPane split="vertical" defaultSize="30%">
          <SplitPane split="horizontal" defaultSize="50%">
            <div>
              <Button
                iconName="pt-icon-menu-closed"
                onClick={() => {
                  this.setState({ drawerOpen: true });
                }}
              />
            </div>
            <div />
          </SplitPane>
          <SplitPane split="horizontal" defaultSize="70%">
            <div />
            <div />
          </SplitPane>
        </SplitPane>
      </div>
    );
  }
}
