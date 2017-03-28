/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-03-22T14:23:34+11:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-03-28T17:17:06+11:00
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

  test('should select root node', () => {
    treeState.selectRootNode(treeState.nodes[1]);
    expect(treeState.nodes[0].text).toEqual('...');
    expect(treeState.nodes[1].text).toEqual('Shards');
  });

  test('should reset root node', () => {
    treeState.resetRootNode();
    expect(treeState.nodes[0].text).toEqual('Databases');
    expect(treeState.nodes[1].text).toEqual('Shards');
  });

  const treeState1 = new TreeState();
  test('should have one node of "Databases"', () => {
    treeState1.parseJson(treeJson);
    treeState1.setFilter('stat');
    expect(treeState1.nodes.length).toEqual(1);
    console.log(treeState1.nodes[0].allChildNodes[0]);
  });

  test('should have ROOT node of "DBEnvyLoad" with "bstatestat" node as filter', () => {
    treeState1.setFilter('');
    treeState1.selectRootNode(treeState.nodes[0].allChildNodes[0]);
    treeState1.setFilter('bstatestat');
    expect(treeState1.nodes[0].text).toEqual('...');
    expect(treeState1.nodes[1].text).toEqual('DBEnvyLoad');
    expect(treeState1.nodes[1].childNodes[0].text).toEqual('bstatestat');
  })
});
