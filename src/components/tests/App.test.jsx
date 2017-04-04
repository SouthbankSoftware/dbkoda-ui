/**
* @Author: Chris Trott <chris>
* @Date:   2017-03-03T09:47:22+11:00
* @Email:  chris@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2017-04-04T10:55:10+10:00
*/

import React from 'react';
import { shallow } from 'enzyme';
import { observable, useStrict } from 'mobx';
import App from '#/App';

describe('App', () => {
  let app;
  const layout = observable({
    overallSplitPos: '30%',
    leftSplitPos: '50%',
    rightSplitPos: '70%',
  });

  const drawer = observable({
    drawerOpen: false
  });

  beforeAll(() => {
    useStrict(true);

    app = shallow(<App.wrappedComponent layout={layout} drawer={drawer} />);
  });

  test('has a drawer', () => {
    expect(app.find('Drawer').length).toEqual(1);
  });

  test('has 3 split panels', () => {
    expect(app.find('SplitPane').length).toEqual(3);
  });
});
