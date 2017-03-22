/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-03-21T15:38:33+11:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-03-22T16:10:57+11:00
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

  const treeNode = new TreeNode(treeJson, '');

  test('should have a label', () => {
    expect(treeNode.text).toEqual('Databases');
  });
  test('should have childNodes', () => {
    expect(treeNode.childNodes.length).toEqual(2);
  });
  test('should return a type', () => {
    expect(TreeNode.getNodeType(treeJson)).toEqual('databases');
  });

  const treeNode1 = new TreeNode(treeJson, 'dbenvy');
  test('should have children with "dbenvy" text filter', () => {
    expect(treeNode1.childNodes.length).toEqual(1);

    const child = treeNode1.childNodes[0];
    expect(child.text.toLowerCase().indexOf('dbenvy') >= 0).toEqual(true);
  });

  const treeNode2 = new TreeNode(treeJson, 'orders');
  test('should have child node because of grand child is selected in filter', () => {
    expect(treeNode2.childNodes.length).toEqual(1);
  });
});
