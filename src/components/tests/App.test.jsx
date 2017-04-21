/**
* @Author: Chris Trott <chris>
* @Date:   2017-03-03T09:47:22+11:00
* @Email:  chris@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-04-21T10:45:13+10:00
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

  beforeAll(() => {
    useStrict(true);

    app = shallow(<App.wrappedComponent layout={layout} />);
  });

  test('has 2 split panels', () => {
    expect(app.find('SplitPane').length).toEqual(2);
  });
});
