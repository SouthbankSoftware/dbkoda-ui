/* @flow
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
import { Tree } from '@blueprintjs/core';

type Props = {};

export default class DataTree extends React.Component<Props> {
  // static defaultProps = {};

  // constructor(props) {
  //   super(props);
  // }

  render() {
    return (
      <div className="DataTree">
        <Tree
          contents={[
            {
              hasCaret: false,
              iconName: 'pt-icon-numerical',
              label: '_id',
            },
            {
              hasCaret: false,
              iconName: 'pt-icon-numerical',
              label: 'CustId',
            },
            {
              iconName: 'pt-icon-folder-open',
              isExpanded: true,
              label: 'lineItems',
              childNodes: [
                {
                  iconName: 'pt-icon-folder-open',
                  isExpanded: true,
                  label: '0',
                  childNodes: [
                    {
                      hasCaret: false,
                      iconName: 'pt-icon-numerical',
                      label: 'prodId',
                    },
                    {
                      hasCaret: false,
                      iconName: 'pt-icon-font',
                      label: 'prodName',
                    },
                    {
                      hasCaret: false,
                      iconName: 'pt-icon-numerical',
                      label: 'prodCount',
                    },
                    {
                      hasCaret: false,
                      iconName: 'pt-icon-numerical',
                      label: 'Cost',
                    },
                  ],
                },
                {
                  iconName: 'pt-icon-folder-close',
                  isExpanded: false,
                  label: '1',
                  childNodes: [],
                },
                {
                  iconName: 'pt-icon-folder-close',
                  isExpanded: false,
                  label: '2',
                  childNodes: [],
                },
                {
                  iconName: 'pt-icon-folder-close',
                  isExpanded: false,
                  label: '3',
                  childNodes: [],
                },
              ],
            },
            {
              hasCaret: false,
              iconName: 'pt-icon-font',
              label: 'orderStatus',
            },
          ]}
        />
      </div>
    );
  }
}
