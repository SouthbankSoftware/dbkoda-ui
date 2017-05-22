/**
* @Author: Chris Trott <chris>
* @Date:   2017-03-03T09:47:22+11:00
* @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-05-22T16:13:46+10:00
*/

import '~/stores/global';
import React from 'react';
import { shallow } from 'enzyme';
import { observable, useStrict } from 'mobx';
import globalizeInit from '#/tests/helpers/globalize.js';
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
    globalizeInit();
    app = shallow(<App.wrappedComponent layout={layout} />);
  });

  test('has 2 split panels', () => {
    expect(app.find('SplitPane').length).toEqual(2);
  });
});
