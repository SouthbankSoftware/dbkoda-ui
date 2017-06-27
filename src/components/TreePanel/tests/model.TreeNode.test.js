/*
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

/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-03-21T15:38:33+11:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-04-10T10:25:03+10:00
 */

// import React from 'react';
// import { shallow } from 'enzyme';
// import { observable, useStrict } from 'mobx';
// import { Provider } from 'mobx-react';
// import renderer from 'react-test-renderer';
import TreeNode from '#/TreePanel/model/TreeNode';
// import Store from '~/stores/global';

describe('TreeNode', () => {
  const treeJson = {
    text: 'Databases',
    children: [
      {
        text: 'DBEnvyLoad',
        type: 'database',
        children: [
          {
            text: 'orders',
            type: 'collection',
            children: [
              {
                text: 'CustId_1',
                type: 'index',
              },
            ],
          },
          {
            text: 'products',
            type: 'collection',
          },
          {
            text: 'bstatestat',
            type: 'collection',
            children: [
              {
                text: 'statid_1',
                type: 'index',
              },
            ],
          },
        ],
      },
      {
        text: 'TestDB',
      },
    ],
  };

  const treeNode = new TreeNode(treeJson);

  test('should have a label', () => {
    expect(treeNode.text).toEqual('Databases');
  });
  test('should have childNodes', () => {
    expect(treeNode.allChildNodes.size).toEqual(2);
  });
  test('should return a type', () => {
    expect(TreeNode.getNodeType(treeJson)).toEqual('databases');
  });

  const treeNode1 = new TreeNode(treeJson);
  treeNode1.setFilter('dbenvy');
  test('should have children with "dbenvy" text filter', () => {
    expect(treeNode1.childNodes.length).toEqual(1);

    const child = treeNode1.childNodes[0];
    expect(child.text.toLowerCase().indexOf('dbenvy') >= 0).toEqual(true);
  });

  const treeNode2 = new TreeNode(treeJson);
  treeNode2.setFilter('orders');
  test('should have child node because of grand child is selected in filter', () => {
    expect(treeNode2.childNodes.length).toEqual(1);
  });
});
