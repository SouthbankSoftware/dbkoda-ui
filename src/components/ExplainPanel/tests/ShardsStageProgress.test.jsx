/**
 * Created by joey on 6/6/17.
 */
// import React from 'react';
import chai, {assert} from 'chai';
import chaiEnzyme from 'chai-enzyme';
import globalizeInit from '#/tests/helpers/globalize.js';
import {getExecutionStages} from '../ExplainStep';
import {mergeShardsStages} from '../ShardsStageProgress';

chai.use(chaiEnzyme());

describe('test shard explain view', () => {
  beforeAll(() => {
    globalizeInit();
  });

  test('test parse shards stages output', () => {
    const explain = {
      'queryPlanner': {
        'mongosPlannerVersion': 1,
        'winningPlan': {
          'stage': 'SINGLE_SHARD',
          'shards': [{
            'shardName': 's0',
            'connectionString': 's0/ec2-13-54-17-227.ap-southeast-2.compute.amazonaws.com:37017,ec2-13-54-17-227.ap-southeast-2.compute.amazonaws.com:37018,ec2-13-54-17-227.ap-southeast-2.compute.amazonaws.com:37019',
            'serverInfo': {
              'host': 'ip-172-31-5-162.ap-southeast-2.compute.internal',
              'port': 37017,
              'version': '3.4.0-rc4',
              'gitVersion': 'cf4d9f77e5bcb609272721bc87b03a795fa21b1f'
            },
            'plannerVersion': 1,
            'namespace': 'SampleCollections.enron_messages',
            'indexFilterSet': false,
            'parsedQuery': {'$and': [{'mailbox': {'$eq': 'baughman-d'}}, {'subFolder': {'$eq': 'enron_power/interviews'}}]},
            'winningPlan': {
              'stage': 'COLLSCAN',
              'filter': {'$and': [{'mailbox': {'$eq': 'baughman-d'}}, {'subFolder': {'$eq': 'enron_power/interviews'}}]},
              'direction': 'forward'
            },
            'rejectedPlans': []
          }]
        }
      },
      'executionStats': {
        'nReturned': 8,
        'executionTimeMillis': 67,
        'totalKeysExamined': 0,
        'totalDocsExamined': 1001,
        'executionStages': {
          'stage': 'SINGLE_SHARD',
          'nReturned': 8,
          'executionTimeMillis': 67,
          'totalKeysExamined': 0,
          'totalDocsExamined': 1001,
          'totalChildMillis': 54,
          'shards': [{
            'shardName': 's0',
            'executionSuccess': true,
            'executionStages': {
              'stage': 'COLLSCAN',
              'filter': {'$and': [{'mailbox': {'$eq': 'baughman-d'}}, {'subFolder': {'$eq': 'enron_power/interviews'}}]},
              'nReturned': 8,
              'executionTimeMillisEstimate': 10,
              'works': 1003,
              'advanced': 8,
              'needTime': 994,
              'needYield': 0,
              'saveState': 7,
              'restoreState': 7,
              'isEOF': 1,
              'invalidates': 0,
              'direction': 'forward',
              'docsExamined': 1001
            }
          }]
        },
        'allPlansExecution': [{'shardName': 's0', 'allPlans': []}]
      },
      'ok': 1
    };
    const stages = getExecutionStages(explain.queryPlanner.winningPlan);
    assert.equal(stages.length, 1);
    assert.equal(stages[0].shardName, 's0');
    const shardStages = mergeShardsStages(stages).mergedStages;
    assert.equal(shardStages.length, 1);
    assert.equal(shardStages[0].stage, 'COLLSCAN');
  });

  test('test parse shards for query planner', () => {
    const explain = {
      'queryPlanner': {
        'mongosPlannerVersion': 1,
        'winningPlan': {
          'stage': 'SHARD_MERGE',
          'shards': [
            {
              'shardName': 's0',
              'connectionString': 's0/ec2-13-54-17-227.ap-southeast-2.compute.amazonaws.com:37017,ec2-13-54-17-227.ap-southeast-2.compute.amazonaws.com:37018,ec2-13-54-17-227.ap-southeast-2.compute.amazonaws.com:37019',
              'serverInfo': {
                'host': 'ip-172-31-5-162.ap-southeast-2.compute.internal',
                'port': 37017,
                'version': '3.4.0-rc4',
                'gitVersion': 'cf4d9f77e5bcb609272721bc87b03a795fa21b1f'
              },
              'plannerVersion': 1,
              'namespace': 'DBEnvyLoad.orders',
              'indexFilterSet': false,
              'parsedQuery': {},
              'winningPlan': {
                'stage': 'SHARDING_FILTER',
                'inputStage': {
                  'stage': 'COLLSCAN',
                  'direction': 'forward'
                }
              },
              'rejectedPlans': []
            },
            {
              'shardName': 's1',
              'connectionString': 's1/ec2-13-54-17-227.ap-southeast-2.compute.amazonaws.com:47017,ec2-13-54-17-227.ap-southeast-2.compute.amazonaws.com:47018,ec2-13-54-17-227.ap-southeast-2.compute.amazonaws.com:47019',
              'serverInfo': {
                'host': 'ip-172-31-5-162.ap-southeast-2.compute.internal',
                'port': 47017,
                'version': '3.4.0-rc4',
                'gitVersion': 'cf4d9f77e5bcb609272721bc87b03a795fa21b1f'
              },
              'plannerVersion': 1,
              'namespace': 'DBEnvyLoad.orders',
              'indexFilterSet': false,
              'parsedQuery': {},
              'winningPlan': {
                'stage': 'SHARDING_FILTER',
                'inputStage': {
                  'stage': 'COLLSCAN',
                  'direction': 'forward'
                }
              },
              'rejectedPlans': []
            },
            {
              'shardName': 's2',
              'connectionString': 's2/ec2-13-54-17-227.ap-southeast-2.compute.amazonaws.com:47117,ec2-13-54-17-227.ap-southeast-2.compute.amazonaws.com:47118,ec2-13-54-17-227.ap-southeast-2.compute.amazonaws.com:47119',
              'serverInfo': {
                'host': 'ip-172-31-5-162.ap-southeast-2.compute.internal',
                'port': 47117,
                'version': '3.4.0-rc4',
                'gitVersion': 'cf4d9f77e5bcb609272721bc87b03a795fa21b1f'
              },
              'plannerVersion': 1,
              'namespace': 'DBEnvyLoad.orders',
              'indexFilterSet': false,
              'parsedQuery': {},
              'winningPlan': {
                'stage': 'SHARDING_FILTER',
                'inputStage': {
                  'stage': 'COLLSCAN',
                  'direction': 'forward'
                }
              },
              'rejectedPlans': []
            }
          ]
        }
      },
      'ok': 1
    };
    const stages = getExecutionStages(explain.queryPlanner.winningPlan);
    assert.equal(stages.length, 3);
    assert.equal(stages[0].shardName, 's0');
    assert.equal(stages[0].stages.length, 2);
    assert.equal(stages[0].stages[0].stage, 'COLLSCAN');
    assert.equal(stages[0].stages[1].stage, 'SHARDING_FILTER');
    assert.equal(stages[1].shardName, 's1');
    assert.equal(stages[1].stages[0].stage, 'COLLSCAN');
    assert.equal(stages[1].stages[1].stage, 'SHARDING_FILTER');
    assert.equal(stages[2].shardName, 's2');
    assert.equal(stages[2].stages[0].stage, 'COLLSCAN');
    assert.equal(stages[2].stages[1].stage, 'SHARDING_FILTER');

    const shardStages = mergeShardsStages(stages).mergedStages;
    assert.equal(shardStages.length, 2);
    assert.equal(shardStages[0].length, 3);
    assert.equal(shardStages[0][0].stage, 'COLLSCAN');
    assert.equal(shardStages[0][1].stage, 'COLLSCAN');
    assert.equal(shardStages[0][2].stage, 'COLLSCAN');
    assert.equal(shardStages[1].length, 3);
    assert.equal(shardStages[1][0].stage, 'SHARDING_FILTER');
    assert.equal(shardStages[1][1].stage, 'SHARDING_FILTER');
    assert.equal(shardStages[1][2].stage, 'SHARDING_FILTER');
  });

  test('run explain execution stats on one shard', () => {
    const explain = {
      'queryPlanner': {
        'mongosPlannerVersion': 1,
        'winningPlan': {
          'stage': 'SINGLE_SHARD',
          'shards': [
            {
              'shardName': 'shard01',
              'connectionString': 'shard01/hoth.local:28020,hoth.local:28021,hoth.local:28022',
              'serverInfo': {
                'host': 'hoth.local',
                'port': 28020,
                'version': '3.4.4',
                'gitVersion': '888390515874a9debd1b6c5d36559ca86b44babd'
              },
              'plannerVersion': 1,
              'namespace': 'company.users',
              'indexFilterSet': false,
              'parsedQuery': {},
              'winningPlan': {
                'stage': 'SHARDING_FILTER',
                'inputStage': {
                  'stage': 'COLLSCAN',
                  'direction': 'forward'
                }
              },
              'rejectedPlans': []
            }
          ]
        }
      },
      'executionStats': {
        'nReturned': 100000,
        'executionTimeMillis': 132,
        'totalKeysExamined': 0,
        'totalDocsExamined': 100000,
        'executionStages': {
          'stage': 'SINGLE_SHARD',
          'nReturned': 100000,
          'executionTimeMillis': 132,
          'totalKeysExamined': 0,
          'totalDocsExamined': 100000,
          'totalChildMillis': 'NumberLong(131)',
          'shards': [
            {
              'shardName': 'shard01',
              'executionSuccess': true,
              'executionStages': {
                'stage': 'SHARDING_FILTER',
                'nReturned': 100000,
                'executionTimeMillisEstimate': 129,
                'works': 100002,
                'advanced': 100000,
                'needTime': 1,
                'needYield': 0,
                'saveState': 784,
                'restoreState': 784,
                'isEOF': 1,
                'invalidates': 0,
                'chunkSkips': 0,
                'inputStage': {
                  'stage': 'COLLSCAN',
                  'nReturned': 100000,
                  'executionTimeMillisEstimate': 10,
                  'works': 100002,
                  'advanced': 100000,
                  'needTime': 1,
                  'needYield': 0,
                  'saveState': 784,
                  'restoreState': 784,
                  'isEOF': 1,
                  'invalidates': 0,
                  'direction': 'forward',
                  'docsExamined': 100000
                }
              }
            }
          ]
        }
      },
      'ok': 1
    };
    const stages = getExecutionStages(explain.executionStats.executionStages);
    assert.equal(stages.length, 1);
    assert.equal(stages[0].shardName, 'shard01');
    assert.equal(stages[0].stages.length, 2);
    assert.equal(stages[0].stages[0].stage, 'COLLSCAN');
    assert.equal(stages[0].stages[1].stage, 'SHARDING_FILTER');
    const shardStages = mergeShardsStages(stages).mergedStages;
    assert.equal(shardStages.length, 2);
    assert.equal(shardStages[0].stage, 'COLLSCAN');
    assert.equal(shardStages[1].stage, 'SHARDING_FILTER');
  });

  test('parse shard stages for unequal number', () => {
    const explain = {
      'queryPlanner': {
        'mongosPlannerVersion': 1,
        'winningPlan': {
          'stage': 'SHARD_MERGE',
          'shards': [
            {
              'shardName': 's0',
              'connectionString': 's0/ec2-13-54-17-227.ap-southeast-2.compute.amazonaws.com:37017,ec2-13-54-17-227.ap-southeast-2.compute.amazonaws.com:37018,ec2-13-54-17-227.ap-southeast-2.compute.amazonaws.com:37019',
              'serverInfo': {
                'host': 'ip-172-31-5-162.ap-southeast-2.compute.internal',
                'port': 37017,
                'version': '3.4.0-rc4',
                'gitVersion': 'cf4d9f77e5bcb609272721bc87b03a795fa21b1f'
              },
              'plannerVersion': 1,
              'namespace': 'DBEnvyLoad.orders',
              'indexFilterSet': false,
              'parsedQuery': {},
              'winningPlan': {
                'stage': 'SHARDING_FILTER',
                'inputStage': {
                  'stage': 'COLLSCAN',
                  'direction': 'forward'
                }
              },
              'rejectedPlans': []
            },
            {
              'shardName': 's1',
              'connectionString': 's1/ec2-13-54-17-227.ap-southeast-2.compute.amazonaws.com:47017,ec2-13-54-17-227.ap-southeast-2.compute.amazonaws.com:47018,ec2-13-54-17-227.ap-southeast-2.compute.amazonaws.com:47019',
              'serverInfo': {
                'host': 'ip-172-31-5-162.ap-southeast-2.compute.internal',
                'port': 47017,
                'version': '3.4.0-rc4',
                'gitVersion': 'cf4d9f77e5bcb609272721bc87b03a795fa21b1f'
              },
              'plannerVersion': 1,
              'namespace': 'DBEnvyLoad.orders',
              'indexFilterSet': false,
              'parsedQuery': {},
              'winningPlan': {
                'stage': 'SHARDING_FILTER'
              },
              'rejectedPlans': []
            },
            {
              'shardName': 's2',
              'connectionString': 's2/ec2-13-54-17-227.ap-southeast-2.compute.amazonaws.com:47117,ec2-13-54-17-227.ap-southeast-2.compute.amazonaws.com:47118,ec2-13-54-17-227.ap-southeast-2.compute.amazonaws.com:47119',
              'serverInfo': {
                'host': 'ip-172-31-5-162.ap-southeast-2.compute.internal',
                'port': 47117,
                'version': '3.4.0-rc4',
                'gitVersion': 'cf4d9f77e5bcb609272721bc87b03a795fa21b1f'
              },
              'plannerVersion': 1,
              'namespace': 'DBEnvyLoad.orders',
              'indexFilterSet': false,
              'parsedQuery': {},
              'winningPlan': {
                'stage': 'SHARDING_FILTER',
                'inputStage': {
                  'stage': 'COLLSCAN',
                  'direction': 'forward',
                  'inputStage': {
                    'stage': 'COLLSCAN',
                    'direction': 'forward'
                  }
                }
              },
              'rejectedPlans': []
            }
          ]
        }
      },
      'ok': 1
    };
    const stages = getExecutionStages(explain.queryPlanner.winningPlan);
    const shardStages = mergeShardsStages(stages).mergedStages;
    assert.equal(shardStages.length, 3);
    assert.equal(shardStages[0].length, 3);
    assert.equal(shardStages[0][0], null);
    assert.equal(shardStages[0][1], null);
    assert.equal(shardStages[0][2].stage, 'COLLSCAN');
    assert.equal(shardStages[1].length, 3);
    assert.equal(shardStages[1][0].stage, 'COLLSCAN');
    assert.equal(shardStages[1][1], null);
    assert.equal(shardStages[1][2].stage, 'COLLSCAN');
    assert.equal(shardStages[2].length, 3);
    assert.equal(shardStages[2][0].stage, 'SHARDING_FILTER');
    assert.equal(shardStages[2][1].stage, 'SHARDING_FILTER');
    assert.equal(shardStages[2][2].stage, 'SHARDING_FILTER');
  });

  test('explain on two shards in a three shards cluster', () => {
    const explain = {
      'executionStats': {
        'nReturned': 19793,
        'executionTimeMillis': 71,
        'totalKeysExamined': 0,
        'totalDocsExamined': 100000,
        'executionStages': {
          'stage': 'SHARD_MERGE',
          'nReturned': 19793,
          'executionTimeMillis': 71,
          'totalKeysExamined': 0,
          'totalDocsExamined': 100000,
          'totalChildMillis': 'NumberLong(127)',
          'shards': [
            {
              'shardName': 'shard01',
              'executionSuccess': true,
              'executionStages': {
                'stage': 'PROJECTION',
                'nReturned': 9958,
                'executionTimeMillisEstimate': 57,
                'works': 50393,
                'advanced': 9958,
                'needTime': 40434,
                'needYield': 0,
                'saveState': 395,
                'restoreState': 395,
                'isEOF': 1,
                'invalidates': 0,
                'transformBy': {
                  'user.name.first': 1
                },
                'inputStage': {
                  'stage': 'SHARDING_FILTER',
                  'nReturned': 9958,
                  'executionTimeMillisEstimate': 44,
                  'works': 50393,
                  'advanced': 9958,
                  'needTime': 40434,
                  'needYield': 0,
                  'saveState': 395,
                  'restoreState': 395,
                  'isEOF': 1,
                  'invalidates': 0,
                  'chunkSkips': 0,
                  'inputStage': {
                    'stage': 'COLLSCAN',
                    'filter': {
                      'user.address.city': {
                        '$eq': 'Brooklyn'
                      }
                    },
                    'nReturned': 9958,
                    'executionTimeMillisEstimate': 44,
                    'works': 50393,
                    'advanced': 9958,
                    'needTime': 40434,
                    'needYield': 0,
                    'saveState': 395,
                    'restoreState': 395,
                    'isEOF': 1,
                    'invalidates': 0,
                    'direction': 'forward',
                    'docsExamined': 50391
                  }
                }
              }
            },
            {
              'shardName': 'shard03',
              'executionSuccess': true,
              'executionStages': {
                'stage': 'PROJECTION',
                'nReturned': 9835,
                'executionTimeMillisEstimate': 68,
                'works': 49611,
                'advanced': 9835,
                'needTime': 39775,
                'needYield': 0,
                'saveState': 390,
                'restoreState': 390,
                'isEOF': 1,
                'invalidates': 0,
                'transformBy': {
                  'user.name.first': 1
                },
                'inputStage': {
                  'stage': 'SHARDING_FILTER',
                  'nReturned': 9835,
                  'executionTimeMillisEstimate': 57,
                  'works': 49611,
                  'advanced': 9835,
                  'needTime': 39775,
                  'needYield': 0,
                  'saveState': 390,
                  'restoreState': 390,
                  'isEOF': 1,
                  'invalidates': 0,
                  'chunkSkips': 0,
                  'inputStage': {
                    'stage': 'COLLSCAN',
                    'filter': {
                      'user.address.city': {
                        '$eq': 'Brooklyn'
                      }
                    },
                    'nReturned': 9835,
                    'executionTimeMillisEstimate': 36,
                    'works': 49611,
                    'advanced': 9835,
                    'needTime': 39775,
                    'needYield': 0,
                    'saveState': 390,
                    'restoreState': 390,
                    'isEOF': 1,
                    'invalidates': 0,
                    'direction': 'forward',
                    'docsExamined': 49609
                  }
                }
              }
            }
          ]
        },
        'allPlansExecution': [
          {
            'shardName': 'shard01',
            'allPlans': []
          },
          {
            'shardName': 'shard03',
            'allPlans': []
          }
        ]
      },
      'ok': 1
    };
    const stages = getExecutionStages(explain.executionStats.executionStages);
    const shardStages = mergeShardsStages(stages).mergedStages;
    assert.equal(shardStages.length, 3);
    assert.equal(shardStages[0].length, 2);
  });

  test('parse shards with different stage', () => {
    const explain = {
      'executionStats': {
        'nReturned': 1349,
        'executionTimeMillis': 27,
        'totalKeysExamined': 668,
        'totalDocsExamined': 50277,
        'executionStages': {
          'stage': 'SHARD_MERGE',
          'nReturned': 1349,
          'executionTimeMillis': 27,
          'totalKeysExamined': 668,
          'totalDocsExamined': 50277,
          'totalChildMillis': 'NumberLong(29)',
          'shards': [
            {
              'shardName': 'shard01',
              'executionSuccess': true,
              'executionStages': {
                'stage': 'SHARDING_FILTER',
                'nReturned': 668,
                'executionTimeMillisEstimate': 0,
                'works': 669,
                'advanced': 668,
                'needTime': 0,
                'needYield': 0,
                'saveState': 5,
                'restoreState': 5,
                'isEOF': 1,
                'invalidates': 0,
                'chunkSkips': 0,
                'inputStage': {
                  'stage': 'FETCH',
                  'nReturned': 668,
                  'executionTimeMillisEstimate': 0,

                  'works': 669,
                  'advanced': 668,
                  'needTime': 0,
                  'needYield': 0,
                  'saveState': 5,
                  'restoreState': 5,
                  'isEOF': 1,
                  'invalidates': 0,
                  'docsExamined': 668,
                  'alreadyHasObj': 0,
                  'inputStage': {
                    'stage': 'IXSCAN',
                    'nReturned': 668,
                    'executionTimeMillisEstimate': 0,
                    'works': 669,
                    'advanced': 668,
                    'needTime': 0,
                    'needYield': 0,
                    'saveState': 5,
                    'restoreState': 5,
                    'isEOF': 1,
                    'invalidates': 0,
                    'keyPattern': {
                      'user.name.first': 1
                    },
                    'indexName': 'user.name.first_1',
                    'isMultiKey': false,
                    'multiKeyPaths': {
                      'user.name.first': []
                    },
                    'isUnique': false,
                    'isSparse': false,
                    'isPartial': false,
                    'indexVersion': 2,
                    'direction': 'forward',
                    'indexBounds': {
                      'user.name.first': [

                        '["Hannah", "Hannah"]'
                      ]
                    },
                    'keysExamined': 668,
                    'seeks': 1,
                    'dupsTested': 0,
                    'dupsDropped': 0,
                    'seenInvalidated': 0
                  }
                }
              }
            },
            {
              'shardName': 'shard03',
              'executionSuccess': true,
              'executionStages': {
                'stage': 'SHARDING_FILTER',
                'nReturned': 681,
                'executionTimeMillisEstimate': 25,
                'works': 49611,
                'advanced': 681,
                'needTime': 48929,
                'needYield': 0,
                'saveState': 387,
                'restoreState': 387,
                'isEOF': 1,
                'invalidates': 0,
                'chunkSkips': 0,
                'inputStage': {
                  'stage': 'COLLSCAN',
                  'filter': {
                    'user.name.first': {
                      '$eq': 'Hannah'
                    }
                  },
                  'nReturned': 681,
                  'executionTimeMillisEstimate': 25,
                  'works': 49611,
                  'advanced': 681,
                  'needTime': 48929,
                  'needYield': 0,
                  'saveState': 387,
                  'restoreState': 387,
                  'isEOF': 1,
                  'invalidates': 0,
                  'direction': 'forward',
                  'docsExamined': 49609
                }
              }
            }
          ]
        }
      },
      'ok': 1
    };
    const stages = getExecutionStages(explain.executionStats.executionStages);
    const shardStages = mergeShardsStages(stages).mergedStages;
    assert.equal(shardStages.length, 3);
    assert.equal(shardStages[0].length, 2);
    assert.equal(shardStages[0][0].stage, 'IXSCAN');
    assert.equal(shardStages[0][1], null);
    assert.equal(shardStages[1].length, 2);
    assert.equal(shardStages[1][0].stage, 'FETCH');
    assert.equal(shardStages[1][1].stage, 'COLLSCAN');
    assert.equal(shardStages[2].length, 2);
    assert.equal(shardStages[2][0].stage, 'SHARDING_FILTER');
    assert.equal(shardStages[2][1].stage, 'SHARDING_FILTER');
  });

  test('parse shards explain result the second shard has more than the first one', () => {
    const explain = {
      'executionStats': {
        'nReturned': 1349,
        'executionTimeMillis': 32,
        'totalKeysExamined': 668,
        'totalDocsExamined': 50277,
        'executionStages': {
          'stage': 'SHARD_MERGE_SORT',
          'nReturned': 1349,
          'executionTimeMillis': 32,
          'totalKeysExamined': 668,
          'totalDocsExamined': 50277,
          'totalChildMillis': 'NumberLong(33)',
          'shards': [
            {
              'shardName': 'shard01',
              'executionSuccess': true,
              'executionStages': {
                'stage': 'SHARDING_FILTER',
                'nReturned': 668,
                'executionTimeMillisEstimate': 0,
                'works': 669,
                'advanced': 668,
                'needTime': 0,
                'needYield': 0,
                'saveState': 5,
                'restoreState': 5,
                'isEOF': 1,
                'invalidates': 0,
                'chunkSkips': 0,
                'inputStage': {
                  'stage': 'FETCH',
                  'nReturned': 668,
                  'executionTimeMillisEstimate': 0,
                  'works': 669,
                  'advanced': 668,
                  'needTime': 0,
                  'needYield': 0,
                  'saveState': 5,
                  'restoreState': 5,
                  'isEOF': 1,
                  'invalidates': 0,
                  'docsExamined': 668,
                  'alreadyHasObj': 0,
                  'inputStage': {
                    'stage': 'IXSCAN',
                    'nReturned': 668,
                    'executionTimeMillisEstimate': 0,
                    'works': 669,
                    'advanced': 668,
                    'needTime': 0,
                    'needYield': 0,
                    'saveState': 5,
                    'restoreState': 5,
                    'isEOF': 1,
                    'invalidates': 0,
                    'keyPattern': {
                      'user.name.first': 1
                    },
                    'indexName': 'user.name.first_1',
                    'isMultiKey': false,
                    'multiKeyPaths': {
                      'user.name.first': []

                    },
                    'isUnique': false,
                    'isSparse': false,
                    'isPartial': false,
                    'indexVersion': 2,
                    'direction': 'forward',
                    'indexBounds': {
                      'user.name.first': [
                        '["Hannah", "Hannah"]'
                      ]
                    },
                    'keysExamined': 668,
                    'seeks': 1,
                    'dupsTested': 0,
                    'dupsDropped': 0,
                    'seenInvalidated': 0
                  }
                }
              }
            },
            {
              'shardName': 'shard03',
              'executionSuccess': true,
              'executionStages': {
                'stage': 'SORT',
                'nReturned': 681,
                'executionTimeMillisEstimate': 25,
                'works': 50294,
                'advanced': 681,
                'needTime': 49612,
                'needYield': 0,
                'saveState': 393,
                'restoreState': 393,
                'isEOF': 1,
                'invalidates': 0,
                'sortPattern': {
                  'user.name.first': 1
                },
                'memUsage': 386946,
                'memLimit': 33554432,
                'inputStage': {
                  'stage': 'SORT_KEY_GENERATOR',
                  'nReturned': 681,
                  'executionTimeMillisEstimate': 25,
                  'works': 49612,
                  'advanced': 681,
                  'needTime': 48930,
                  'needYield': 0,
                  'saveState': 393,
                  'restoreState': 393,
                  'isEOF': 1,
                  'invalidates': 0,
                  'inputStage': {
                    'stage': 'SHARDING_FILTER',
                    'nReturned': 681,
                    'executionTimeMillisEstimate': 25,
                    'works': 49611,
                    'advanced': 681,
                    'needTime': 48929,
                    'needYield': 0,
                    'saveState': 393,
                    'restoreState': 393,
                    'isEOF': 1,
                    'invalidates': 0,
                    'chunkSkips': 0,
                    'inputStage': {
                      'stage': 'COLLSCAN',
                      'filter': {
                        'user.name.first': {
                          '$eq': 'Hannah'
                        }
                      },
                      'nReturned': 681,
                      'executionTimeMillisEstimate': 25,
                      'works': 49611,
                      'advanced': 681,
                      'needTime': 48929,
                      'needYield': 0,
                      'saveState': 393,
                      'restoreState': 393,
                      'isEOF': 1,
                      'invalidates': 0,
                      'direction': 'forward',
                      'docsExamined': 49609
                    }
                  }
                }
              }
            }
          ]
        }
      }
    };
    const stages = getExecutionStages(explain.executionStats.executionStages);
    const shardStages = mergeShardsStages(stages).mergedStages;
    assert.equal(shardStages.length, 4);
    assert.equal(shardStages[0].length, 2);
    assert.equal(shardStages[0][0], null);
    assert.equal(shardStages[0][1].stage, 'COLLSCAN');
    assert.equal(shardStages[1][0].stage, 'IXSCAN');
    assert.equal(shardStages[1][1].stage, 'SHARDING_FILTER');
    assert.equal(shardStages[2][0].stage, 'FETCH');
    assert.equal(shardStages[2][1].stage, 'SORT_KEY_GENERATOR');
    assert.equal(shardStages[3][0].stage, 'SHARDING_FILTER');
    assert.equal(shardStages[3][1].stage, 'SORT');
  });

  test('test parse shard explain result with branches', () => {
    const explain = {
      'executionStats': {
        'nReturned': 21135,
        'executionTimeMillis': 54,
        'totalKeysExamined': 10668,
        'totalDocsExamined': 60158,
        'executionStages': {
          'stage': 'SHARD_MERGE',
          'nReturned': 21135,
          'executionTimeMillis': 54,
          'totalKeysExamined': 10668,
          'totalDocsExamined': 60158,
          'totalChildMillis': 'NumberLong(85)',
          'shards': [
            {
              'shardName': 'shard01',
              'executionSuccess': true,
              'executionStages': {
                'stage': 'SUBPLAN',
                'nReturned': 10549,
                'executionTimeMillisEstimate': 24,
                'works': 10670,
                'advanced': 10549,
                'needTime': 120,
                'needYield': 0,
                'saveState': 83,
                'restoreState': 83,
                'isEOF': 1,
                'invalidates': 0,
                'inputStage': {
                  'stage': 'SHARDING_FILTER',
                  'nReturned': 10549,
                  'executionTimeMillisEstimate': 24,
                  'works': 10670,
                  'advanced': 10549,
                  'needTime': 120,
                  'needYield': 0,
                  'saveState': 83,
                  'restoreState': 83,
                  'isEOF': 1,
                  'invalidates': 0,
                  'chunkSkips': 0,
                  'inputStage': {
                    'stage': 'FETCH',
                    'nReturned': 10549,
                    'executionTimeMillisEstimate': 24,
                    'works': 10670,
                    'advanced': 10549,
                    'needTime': 120,
                    'needYield': 0,
                    'saveState': 83,
                    'restoreState': 83,
                    'isEOF': 1,
                    'invalidates': 0,
                    'docsExamined': 10549,
                    'alreadyHasObj': 0,
                    'inputStage': {
                      'stage': 'OR',
                      'nReturned': 10549,
                      'executionTimeMillisEstimate': 12,
                      'works': 10670,
                      'advanced': 10549,
                      'needTime': 120,
                      'needYield': 0,
                      'saveState': 83,
                      'restoreState': 83,
                      'isEOF': 1,
                      'invalidates': 0,
                      'dupsTested': 10668,
                      'dupsDropped': 119,
                      'recordIdsForgotten': 0,
                      'inputStages': [
                        {
                          'stage': 'IXSCAN',
                          'nReturned': 668,
                          'executionTimeMillisEstimate': 0,
                          'works': 669,
                          'advanced': 668,
                          'needTime': 0,
                          'needYield': 0,
                          'saveState': 83,
                          'restoreState': 83,
                          'isEOF': 1,
                          'invalidates': 0,
                          'keyPattern': {
                            'user.name.first': 1
                          },
                          'indexName': 'user.name.first_1',
                          'isMultiKey': false,
                          'multiKeyPaths': {
                            'user.name.first': []
                          },

                          'isUnique': false,
                          'isSparse': false,
                          'isPartial': false,
                          'indexVersion': 2,
                          'direction': 'forward',
                          'indexBounds': {
                            'user.name.first': [
                              '["Hannah", "Hannah"]'
                            ]
                          },
                          'keysExamined': 668,
                          'seeks': 1,
                          'dupsTested': 0,
                          'dupsDropped': 0,
                          'seenInvalidated': 0
                        },
                        {
                          'stage': 'IXSCAN',
                          'nReturned': 10000,
                          'executionTimeMillisEstimate': 12,
                          'works': 10001,
                          'advanced': 10000,
                          'needTime': 0,
                          'needYield': 0,
                          'saveState': 83,
                          'restoreState': 83,
                          'isEOF': 1,
                          'invalidates': 0,
                          'keyPattern': {
                            'user.address.city': 1
                          },
                          'indexName': 'user.address.city_1',
                          'isMultiKey': false,
                          'multiKeyPaths': {

                            'user.address.city': []
                          },
                          'isUnique': false,
                          'isSparse': false,
                          'isPartial': false,
                          'indexVersion': 2,
                          'direction': 'forward',
                          'indexBounds': {
                            'user.address.city': [
                              '["Bronx", "Bronx"]'
                            ]
                          },
                          'keysExamined': 10000,
                          'seeks': 1,
                          'dupsTested': 0,
                          'dupsDropped': 0,
                          'seenInvalidated': 0
                        }
                      ]
                    }
                  }
                }
              }
            },
            {
              'shardName': 'shard03',
              'executionSuccess': true,
              'executionStages': {
                'stage': 'SUBPLAN',
                'nReturned': 10586,
                'executionTimeMillisEstimate': 57,
                'works': 49611,
                'advanced': 10586,
                'needTime': 39024,
                'needYield': 0,
                'saveState': 389,
                'restoreState': 389,
                'isEOF': 1,
                'invalidates': 0,
                'inputStage': {
                  'stage': 'SHARDING_FILTER',
                  'nReturned': 10586,
                  'executionTimeMillisEstimate': 57,
                  'works': 49611,
                  'advanced': 10586,
                  'needTime': 39024,
                  'needYield': 0,
                  'saveState': 389,
                  'restoreState': 389,
                  'isEOF': 1,
                  'invalidates': 0,
                  'chunkSkips': 0,
                  'inputStage': {
                    'stage': 'COLLSCAN',
                    'filter': {
                      '$or': [
                        {
                          'user.address.city': {
                            '$eq': 'Bronx'
                          }
                        },
                        {
                          'user.name.first': {
                            '$eq': 'Hannah'
                          }
                        }
                      ]
                    },
                    'nReturned': 10586,
                    'executionTimeMillisEstimate': 57,
                    'works': 49611,
                    'advanced': 10586,
                    'needTime': 39024,
                    'needYield': 0,
                    'saveState': 389,
                    'restoreState': 389,
                    'isEOF': 1,
                    'invalidates': 0,
                    'direction': 'forward',
                    'docsExamined': 49609

                  }
                }
              }
            }
          ]
        }
      }
    };
    const stages = getExecutionStages(explain.executionStats.executionStages);
    const shardStages = mergeShardsStages(stages).mergedStages;
    assert.equal(shardStages.length, 5);
  });
});
