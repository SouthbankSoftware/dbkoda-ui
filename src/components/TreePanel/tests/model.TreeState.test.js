/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-03-22T14:23:34+11:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-03-22T16:44:23+11:00
 */

import TreeState from '#/TreePanel/model/TreeState';

describe('TreeState', () => {
  const treeJson = [
    {
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
      ],
    },
    {
      text: 'Shards',
      children: [
        {
          text: 'S0',
          type: 'shard',
        },
      ],
    },
  ];
  const treeState = new TreeState();
  test('should have a node array defined', () => {
    expect(treeState.nodes).toBeDefined();
  });

  test('should be able to parse the json and add nodes', () => {
    treeState.parseJson(treeJson);
    expect(treeState.nodes.length).toEqual(2);
  });

  test('should have 2nd node selected', () => {
    treeState.selectNode(treeState.nodes[1]);
    expect(treeState.nodes[0].isSelected).toEqual(false);
    expect(treeState.nodes[1].isSelected).toEqual(true);
  });

  test('should visit each node', () => {
    const nodeCheck = {
      noOfNodes:0,
      increment: (n) => {
        if (n) {
          nodeCheck.noOfNodes += 1;
        }
      }
    };
    treeState.forEachNode(treeState.nodes, nodeCheck.increment);

    expect(nodeCheck.noOfNodes).toEqual(9);
  });

  const treeState1 = new TreeState();
  test('should have one node of "Databases"', () => {
    treeState1.parseJson(treeJson);
    treeState1.setFilter('stat');
    expect(treeState1.nodes.length).toEqual(1);
  });
});
