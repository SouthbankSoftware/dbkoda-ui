import React from 'react';
import {useStrict} from 'mobx';
import chai, {expect, assert} from 'chai';
import chaiEnzyme from 'chai-enzyme';
import {getExecutionStages} from '../ExplainView';
import EJSON from 'mongodb-extended-json';

chai.use(chaiEnzyme());

describe('test explain view', () => {
  it('test parse stages output', () => {
    const explainOutput = {
      'queryPlanner': {
        'plannerVersion': 1,
        'namespace': 'm102.restaurants',
        'indexFilterSet': false,
        'parsedQuery': {'address.zipcode': {'$eq': '18882'}},
        'winningPlan': {
          'stage': 'FETCH',
          'inputStage': {
            'stage': 'IXSCAN',
            'keyPattern': {'address.zipcode': 1, 'cuisine': 1, 'stars': 1},
            'indexName': 'address.zipcode_1_cuisine_1_stars_1',
            'isMultiKey': false,
            'multiKeyPaths': {'address.zipcode': [], 'cuisine': [], 'stars': []},
            'isUnique': false,
            'isSparse': false,
            'isPartial': false,
            'indexVersion': 2,
            'direction': 'forward',
            'indexBounds': {
              'address.zipcode': ['["18882", "18882"]'],
              'cuisine': ['[MinKey, MaxKey]'],
              'stars': ['[MinKey, MaxKey]']
            }
          }
        },
        'rejectedPlans': []
      },
      'executionStats': {
        'executionSuccess': true,
        'nReturned': 8,
        'executionTimeMillis': 0,
        'totalKeysExamined': 8,
        'totalDocsExamined': 8,
        'executionStages': {
          'stage': 'FETCH',
          'nReturned': 8,
          'executionTimeMillisEstimate': 0,
          'works': 9,
          'advanced': 8,
          'needTime': 0,
          'needYield': 0,
          'saveState': 0,
          'restoreState': 0,
          'isEOF': 1,
          'invalidates': 0,
          'docsExamined': 8,
          'alreadyHasObj': 0,
          'inputStage': {
            'stage': 'IXSCAN',
            'nReturned': 8,
            'executionTimeMillisEstimate': 0,
            'works': 9,
            'advanced': 8,
            'needTime': 0,
            'needYield': 0,
            'saveState': 0,
            'restoreState': 0,
            'isEOF': 1,
            'invalidates': 0,
            'keyPattern': {'address.zipcode': 1, 'cuisine': 1, 'stars': 1},
            'indexName': 'address.zipcode_1_cuisine_1_stars_1',
            'isMultiKey': false,
            'multiKeyPaths': {'address.zipcode': [], 'cuisine': [], 'stars': []},
            'isUnique': false,
            'isSparse': false,
            'isPartial': false,
            'indexVersion': 2,
            'direction': 'forward',
            'indexBounds': {
              'address.zipcode': ['["18882", "18882"]'],
              'cuisine': ['[MinKey, MaxKey]'],
              'stars': ['[MinKey, MaxKey]']
            },
            'keysExamined': 8,
            'seeks': 1,
            'dupsTested': 0,
            'dupsDropped': 0,
            'seenInvalidated': 0
          }
        },
        'allPlansExecution': []
      },
      'serverInfo': {
        'host': 'e8d1597fe5e4',
        'port': 27017,
        'version': '3.4.0',
        'gitVersion': 'f4240c60f005be757399042dc12f6addbc3170c1'
      },
      'ok': 1
    };

    let stages = getExecutionStages(explainOutput.executionStats.executionStages);
    assert.equal(stages.length, 2);
    assert.equal(stages[0].stage, 'FETCH');
    assert.equal(stages[1].stage, 'IXSCAN');

    stages = getExecutionStages(explainOutput.queryPlanner.winningPlan);
    assert.equal(stages.length, 2);
    assert.equal(stages[0].stage, 'FETCH');
    assert.equal(stages[1].stage, 'IXSCAN');

  });

  it('test plain explain output ', () => {
    const output = JSON.parse('{"queryPlanner" : {"plannerVersion" : 1,"namespace" : "m102.restaurants","indexFilterSet" : false,"parsedQuery" : {},"winningPlan" : {"stage" : "COLLSCAN","direction" : "forward"},"rejectedPlans" : [ ]},"executionStats" : {"executionSuccess" : true,"nReturned" : 1000000,"executionTimeMillis" : 196,"totalKeysExamined" : 0,"totalDocsExamined" : 1000000,"executionStages" : {"stage" : "COLLSCAN","nReturned" : 1000000,"executionTimeMillisEstimate" : 74,"works" : 1000002,"advanced" : 1000000,"needTime" : 1,"needYield" : 0,"saveState" : 7816,"restoreState" : 7816,"isEOF" : 1,"invalidates" : 0,"direction" : "forward","docsExamined" : 1000000},"allPlansExecution" : [ ]},"serverInfo" : {"host" : "e8d1597fe5e4","port" : 27017,"version" : "3.4.0","gitVersion" : "f4240c60f005be757399042dc12f6addbc3170c1"},"ok" : 1}');
    const stages = getExecutionStages(output.queryPlanner.winningPlan);
    assert.equal(stages.length, 1);
    assert.equal(stages[0].stage, 'COLLSCAN');
  });

});
