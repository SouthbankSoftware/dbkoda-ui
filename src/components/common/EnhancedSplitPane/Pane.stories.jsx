/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2018-05-23T11:55:14+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-05-29T20:41:35+10:00
 *
 * dbKoda - a modern, open source code editor, for MongoDB.
 * Copyright (C) 2017-2018 Southbank Software
 *
 * This file is part of dbKoda.
 *
 * dbKoda is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * dbKoda is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with dbKoda.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, text, number, select, boolean, array } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import styled from 'styled-components';
import { withStateHandlers } from 'recompose';
// mimicking the same css env as in app
import 'normalize.css/normalize.css';
import '~/styles/global.scss';
import '#/App.scss';
import EnhancedSplitPane from './';

const RenderTest = ({ className, text }) => {
  action('rerendered')();
  return <div className={className}>{text}</div>;
};

const StyledRenderTest = styled(RenderTest)`
  color: whitesmoke;
`;

const ControlledEsp = withStateHandlers(
  () => ({
    size: EnhancedSplitPane.defaultProps.defaultSize,
    resizerState: EnhancedSplitPane.defaultProps.resizerState
  }),
  {
    onDragFinished: () => size => {
      action('onDragFinished')(size);
      return { size };
    },
    onResizerStateChanged: () => (state, prevState) => {
      action('onResizerStateChanged')(state, prevState);
      return { resizerState: state };
    }
  }
)(EnhancedSplitPane);

storiesOf('EnhancedSplitPane', module)
  .addDecorator(withKnobs)
  .add(
    'controlled component',
    () => (
      <ControlledEsp
        split={select('split', ['vertical', 'horizontal'], 'vertical')}
        primary={select('primary', ['first', 'second'], 'first')}
        minSize={number('minSize', 100)}
        maxSize={number('maxSize', 400)}
        allowResize={boolean('allowResize', EnhancedSplitPane.defaultProps.allowResize)}
        allowedResizerState={array(
          'allowedResizerState',
          EnhancedSplitPane.defaultProps.allowedResizerState
        )}
      >
        <StyledRenderTest
          text={text(
            'leftPanel',
            'The styled method works perfectly on all of your own or any third-party components as well, as long as they pass the className prop to their rendered sub-components, which should pass it too, and so on. Ultimately, the className must be passed down the line to an actual DOM node for the styling to take any effect.'
          )}
        />
        <StyledRenderTest
          text={text(
            'rightPanel',
            "Quite frequently you might want to use a component, but change it slightly for a single case. Now you could pass in an interpolated function and change them based on some props, but that's quite a lot of effort for overriding the styles once. To do this in an easier way you can call extend on the component to generate another. You style it like any other styled component. It overrides duplicate styles from the initial component and keeps the others around. Here we use the button from the last section and create a special one, extending it with some colour-related styling."
          )}
        />
      </ControlledEsp>
    ),
    {
      notes: {
        markdown: `\`size\` and \`resizerState\` are controlled inputs
`
      }
    }
  )
  .add('uncontrolled component', () => (
    <EnhancedSplitPane
      split={select('split', ['vertical', 'horizontal'], 'vertical')}
      primary={select('primary', ['first', 'second'], 'first')}
      minSize={number('minSize', 100)}
      defaultSize={number('defaultSize', EnhancedSplitPane.defaultProps.defaultSize)}
      defaultResizerState={select(
        'defaultResizerState',
        EnhancedSplitPane.defaultProps.allowedResizerState,
        EnhancedSplitPane.defaultProps.defaultResizerState
      )}
      maxSize={number('maxSize', 400)}
      allowResize={boolean('allowResize', EnhancedSplitPane.defaultProps.allowResize)}
      allowedResizerState={array(
        'allowedResizerState',
        EnhancedSplitPane.defaultProps.allowedResizerState
      )}
      onChange={action('onChange')}
    >
      <StyledRenderTest
        text={text(
          'leftPanel',
          'The styled method works perfectly on all of your own or any third-party components as well, as long as they pass the className prop to their rendered sub-components, which should pass it too, and so on. Ultimately, the className must be passed down the line to an actual DOM node for the styling to take any effect.'
        )}
      />
      <StyledRenderTest
        text={text(
          'rightPanel',
          "Quite frequently you might want to use a component, but change it slightly for a single case. Now you could pass in an interpolated function and change them based on some props, but that's quite a lot of effort for overriding the styles once. To do this in an easier way you can call extend on the component to generate another. You style it like any other styled component. It overrides duplicate styles from the initial component and keeps the others around. Here we use the button from the last section and create a special one, extending it with some colour-related styling."
        )}
      />
    </EnhancedSplitPane>
  ));
