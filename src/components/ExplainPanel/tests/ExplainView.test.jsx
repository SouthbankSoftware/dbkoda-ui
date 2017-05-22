import React from 'react';
import chai, {assert, expect} from 'chai';
import chaiEnzyme from 'chai-enzyme';
import {mount, shallow} from 'enzyme';
import uuidV1 from 'uuid';

import {Provider} from 'mobx-react';
import {observable, runInAction} from 'mobx';
import globalizeInit from '#/tests/helpers/globalize.js';
import {getExecutionStages} from '../ExplainView';
import {parseOutput} from '../Explain';
import Store from '../../../stores/global';
import Explain from '../Explain';
import OutputPanel from '../../outputPanel/Panel';
import ExplainPanel from '../Panel';
import {Header} from '../Panel';
import ExplainView from '../ExplainView';

chai.use(chaiEnzyme());

describe('test explain view', () => {
  beforeAll(() => {
    globalizeInit();
  });

  test('test parse stages output', () => {
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
    assert.equal(stages[1].stage, 'FETCH');
    assert.equal(stages[0].stage, 'IXSCAN');

    stages = getExecutionStages(explainOutput.queryPlanner.winningPlan);
    assert.equal(stages.length, 2);
    assert.equal(stages[1].stage, 'FETCH');
    assert.equal(stages[0].stage, 'IXSCAN');
  });

  it('test plain explain output ', () => {
    const output = JSON.parse('{"queryPlanner" : {"plannerVersion" : 1,"namespace" : "m102.restaurants","indexFilterSet" : false,"parsedQuery" : {},"winningPlan" : {"stage" : "COLLSCAN","direction" : "forward"},"rejectedPlans" : [ ]},"executionStats" : {"executionSuccess" : true,"nReturned" : 1000000,"executionTimeMillis" : 196,"totalKeysExamined" : 0,"totalDocsExamined" : 1000000,"executionStages" : {"stage" : "COLLSCAN","nReturned" : 1000000,"executionTimeMillisEstimate" : 74,"works" : 1000002,"advanced" : 1000000,"needTime" : 1,"needYield" : 0,"saveState" : 7816,"restoreState" : 7816,"isEOF" : 1,"invalidates" : 0,"direction" : "forward","docsExamined" : 1000000},"allPlansExecution" : [ ]},"serverInfo" : {"host" : "e8d1597fe5e4","port" : 27017,"version" : "3.4.0","gitVersion" : "f4240c60f005be757399042dc12f6addbc3170c1"},"ok" : 1}');
    const stages = getExecutionStages(output.queryPlanner.winningPlan);
    assert.equal(stages.length, 1);
    assert.equal(stages[0].stage, 'COLLSCAN');
  });

  test('test parse explain output with regex', () => {
    const output = '{"filter":{"email":/net/}}';
    let p = parseOutput(output);
    assert.equal(p, '{"filter":{"email":"/net/"}}');
    p = parseOutput('{"filter" : { \
      "email" : /net/ \
    }}');
    assert.equal(p, '{"filter":{"email":"/net/"}}');

    p = parseOutput('{"plannerVersion" : 1,\
    "namespace" : "m102.people",\
      "indexFilterSet" : false,\
      "parsedQuery" : {\
      "$and" : [\
        {\
          "last_name" : {\
            "$eq" : "Pham"\
          }\
        },\
        {\
          "email" : /net/\
        }\
      ]\
    }}');
    assert.equal(p, '{"plannerVersion":1,"namespace":"m102.people","indexFilterSet":false,"parsedQuery":{"$and":[{"last_name":{"$eq":"Pham"}},{"email":"/net/"}]}}');

    p = parseOutput('{"a":/b/,"c":/d/}');
    assert.equal(p, '{"a":"/b/","c":"/d/"}');

    p = parseOutput('{"a":"/"}');
    assert.equal(p, '{"a":"/"}');

    p = parseOutput('{"filter":{"email":/net/},"rejected":"[/net/,/net/]"}');
    assert.equal(p, '{"filter":{"email":"/net/"},"rejected":"[/net/,/net/]"}');
  });

  it('test explain view stage', () => {
    const editor = {explains: {output: ''}};
    const app = mount(<ExplainPanel viewType={0} editor={editor} />);
    expect(app.find('.explain-header')).to.have.length(1);
  });

  it('test json raw panel', () => {
    const editor = {explains: {output: {test:1}}};
    const app = mount(<ExplainPanel viewType={1} editor={editor} />);
    expect(app.find('.explain-json-raw-panel')).to.have.length(1);
  });

  it('test explainview stage', () => {
    const explain = {'output':{'queryPlanner':{'plannerVersion':1, 'namespace':'SampleCollections.enron_messages', 'indexFilterSet':false, 'parsedQuery':{'$and':[{'subFolder':{'$eq':'enron_power/interviews'}}, {'$nor':[{'mailbox':{'$eq':'*'}}]}]}, 'winningPlan':{'stage':'FETCH', 'filter':{'$nor':[{'mailbox':{'$eq':'*'}}]}, 'inputStage':{'stage':'IXSCAN', 'keyPattern':{'subFolder':1}, 'indexName':'subFolder_1', 'isMultiKey':false, 'multiKeyPaths':{'subFolder':[]}, 'isUnique':false, 'isSparse':false, 'isPartial':false, 'indexVersion':2, 'direction':'forward', 'indexBounds':{'subFolder':['["enron_power/interviews","enron_power/interviews"]']}}}, 'rejectedPlans':[{'stage':'FETCH', 'filter':{'subFolder':{'$eq':'enron_power/interviews'}}, 'inputStage':{'stage':'IXSCAN', 'keyPattern':{'mailbox':1}, 'indexName':'mailbox_1', 'isMultiKey':false, 'multiKeyPaths':{'mailbox':[]}, 'isUnique':false, 'isSparse':false, 'isPartial':false, 'indexVersion':2, 'direction':'forward', 'indexBounds':{'mailbox':['[MinKey,"*")', '("*",MaxKey]']}}}]}, 'executionStats':{'executionSuccess':true, 'nReturned':8, 'executionTimeMillis':6, 'totalKeysExamined':8, 'totalDocsExamined':8, 'executionStages':{'stage':'FETCH', 'filter':{'$nor':[{'mailbox':{'$eq':'*'}}]}, 'nReturned':8, 'executionTimeMillisEstimate':0, 'works':10, 'advanced':8, 'needTime':0, 'needYield':0, 'saveState':0, 'restoreState':0, 'isEOF':1, 'invalidates':0, 'docsExamined':8, 'alreadyHasObj':0, 'inputStage':{'stage':'IXSCAN', 'nReturned':8, 'executionTimeMillisEstimate':0, 'works':9, 'advanced':8, 'needTime':0, 'needYield':0, 'saveState':0, 'restoreState':0, 'isEOF':1, 'invalidates':0, 'keyPattern':{'subFolder':1}, 'indexName':'subFolder_1', 'isMultiKey':false, 'multiKeyPaths':{'subFolder':[]}, 'isUnique':false, 'isSparse':false, 'isPartial':false, 'indexVersion':2, 'direction':'forward', 'indexBounds':{'subFolder':['["enron_power/interviews","enron_power/interviews"]']}, 'keysExamined':8, 'seeks':1, 'dupsTested':0, 'dupsDropped':0, 'seenInvalidated':0}}, 'allPlansExecution':[{'nReturned':0, 'executionTimeMillisEstimate':0, 'totalKeysExamined':9, 'totalDocsExamined':9, 'executionStages':{'stage':'FETCH', 'filter':{'subFolder':{'$eq':'enron_power/interviews'}}, 'nReturned':0, 'executionTimeMillisEstimate':0, 'works':9, 'advanced':0, 'needTime':9, 'needYield':0, 'saveState':0, 'restoreState':0, 'isEOF':0, 'invalidates':0, 'docsExamined':9, 'alreadyHasObj':0, 'inputStage':{'stage':'IXSCAN', 'nReturned':9, 'executionTimeMillisEstimate':0, 'works':9, 'advanced':9, 'needTime':0, 'needYield':0, 'saveState':0, 'restoreState':0, 'isEOF':0, 'invalidates':0, 'keyPattern':{'mailbox':1}, 'indexName':'mailbox_1', 'isMultiKey':false, 'multiKeyPaths':{'mailbox':[]}, 'isUnique':false, 'isSparse':false, 'isPartial':false, 'indexVersion':2, 'direction':'forward', 'indexBounds':{'mailbox':['[MinKey,"*")', '("*",MaxKey]']}, 'keysExamined':9, 'seeks':1, 'dupsTested':0, 'dupsDropped':0, 'seenInvalidated':0}}}, {'nReturned':8, 'executionTimeMillisEstimate':0, 'totalKeysExamined':8, 'totalDocsExamined':8, 'executionStages':{'stage':'FETCH', 'filter':{'$nor':[{'mailbox':{'$eq':'*'}}]}, 'nReturned':8, 'executionTimeMillisEstimate':0, 'works':9, 'advanced':8, 'needTime':0, 'needYield':0, 'saveState':0, 'restoreState':0, 'isEOF':1, 'invalidates':0, 'docsExamined':8, 'alreadyHasObj':0, 'inputStage':{'stage':'IXSCAN', 'nReturned':8, 'executionTimeMillisEstimate':0, 'works':9, 'advanced':8, 'needTime':0, 'needYield':0, 'saveState':0, 'restoreState':0, 'isEOF':1, 'invalidates':0, 'keyPattern':{'subFolder':1}, 'indexName':'subFolder_1', 'isMultiKey':false, 'multiKeyPaths':{'subFolder':[]}, 'isUnique':false, 'isSparse':false, 'isPartial':false, 'indexVersion':2, 'direction':'forward', 'indexBounds':{'subFolder':['["enron_power/interviews","enron_power/interviews"]']}, 'keysExamined':8, 'seeks':1, 'dupsTested':0, 'dupsDropped':0, 'seenInvalidated':0}}}]}, 'serverInfo':{'host':'e8d1597fe5e4', 'port':27017, 'version':'3.4.0', 'gitVersion':'f4240c60f005be757399042dc12f6addbc3170c1'}, 'ok':1}, 'type':'allPlansExecution', 'command':'db.enron_messages.find({"mailbox" :{$ne: "*"},"subFolder": "enron_power/interviews"}).explain("allPlansExecution")', 'viewType':0};
    explain.command = undefined;
    const app = mount(<ExplainView explains={explain} />);
    expect(app.find('.explain-stage-progress')).to.have.length(1);
    expect(app.find('.explain-stage')).to.have.length(2);
    expect(app.find('.explain-stages-table .stage-row')).to.have.length(2);
    expect(app.find('.explain-statistic-view')).to.have.length(1);
    expect(app.find('.explain-statistic-view .row')).to.have.length(3);
  });

  it('test shard explain', () => {
    const explain = {'output':{'queryPlanner':{'mongosPlannerVersion':1, 'winningPlan':{'stage':'SINGLE_SHARD', 'shards':[{'shardName':'s0', 'connectionString':'s0/ec2-13-54-17-227.ap-southeast-2.compute.amazonaws.com:37017,ec2-13-54-17-227.ap-southeast-2.compute.amazonaws.com:37018,ec2-13-54-17-227.ap-southeast-2.compute.amazonaws.com:37019', 'serverInfo':{'host':'ip-172-31-5-162.ap-southeast-2.compute.internal', 'port':37017, 'version':'3.4.0-rc4', 'gitVersion':'cf4d9f77e5bcb609272721bc87b03a795fa21b1f'}, 'plannerVersion':1, 'namespace':'SampleCollections.enron_messages', 'indexFilterSet':false, 'parsedQuery':{'$and':[{'mailbox':{'$eq':'baughman-d'}}, {'subFolder':{'$eq':'enron_power/interviews'}}]}, 'winningPlan':{'stage':'COLLSCAN', 'filter':{'$and':[{'mailbox':{'$eq':'baughman-d'}}, {'subFolder':{'$eq':'enron_power/interviews'}}]}, 'direction':'forward'}, 'rejectedPlans':[]}]}}, 'executionStats':{'nReturned':8, 'executionTimeMillis':67, 'totalKeysExamined':0, 'totalDocsExamined':1001, 'executionStages':{'stage':'SINGLE_SHARD', 'nReturned':8, 'executionTimeMillis':67, 'totalKeysExamined':0, 'totalDocsExamined':1001, 'totalChildMillis':54, 'shards':[{'shardName':'s0', 'executionSuccess':true, 'executionStages':{'stage':'COLLSCAN', 'filter':{'$and':[{'mailbox':{'$eq':'baughman-d'}}, {'subFolder':{'$eq':'enron_power/interviews'}}]}, 'nReturned':8, 'executionTimeMillisEstimate':10, 'works':1003, 'advanced':8, 'needTime':994, 'needYield':0, 'saveState':7, 'restoreState':7, 'isEOF':1, 'invalidates':0, 'direction':'forward', 'docsExamined':1001}}]}, 'allPlansExecution':[{'shardName':'s0', 'allPlans':[]}]}, 'ok':1}, 'type':'allPlansExecution', 'command':'db.enron_messages.find({"$and" : [            {                "mailbox" : "baughman-d"            },            {                "subFolder" : "enron_power/interviews"            }        ]},{}).explain("allPlansExecution")', 'viewType':0};
    explain.command = undefined;
    const app = mount(<ExplainView explains={explain} />);
    expect(app.find('.explain-stage-progress')).to.have.length(1);
    expect(app.find('.explain-shards-statistic-view')).to.have.length(1);
  });
});
