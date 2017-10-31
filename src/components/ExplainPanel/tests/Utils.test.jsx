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

import chai, {assert} from 'chai';
import chaiEnzyme from 'chai-enzyme';
import globalizeInit from '#/tests/helpers/globalize.js';
import {findMongoCommand, insertExplainOnCommand} from '../Utils';

const esprima = require('esprima');
const escodegen = require('escodegen');

chai.use(chaiEnzyme());

describe('test explain utils functions', () => {
  beforeAll(() => {
    globalizeInit();
  });

  test('test parse stages output', () => {
    let mCmds = findMongoCommand(esprima.parseScript('db.test.find({})'));
    let commands = mCmds.commands;
    assert.equal(commands.length, 2);
    assert.equal(commands[0].name, 'find');
    assert.equal(commands[1].name, 'test');

    mCmds = findMongoCommand(esprima.parseScript('db.test.count({}).sort(1).limit(1)'));
    commands = mCmds.commands;
    assert.equal(commands.length, 4);
    assert.equal(commands[0].name, 'limit');
    assert.equal(commands[1].name, 'sort');
    assert.equal(commands[2].name, 'count');
    assert.equal(commands[3].name, 'test');

    mCmds = findMongoCommand(esprima.parseScript('i = db.test.aggregate({})'));
    commands = mCmds.commands;
    assert.equal(commands.length, 2);
    assert.equal(commands[0].name, 'aggregate');
    assert.equal(commands[1].name, 'test');

    mCmds = findMongoCommand(esprima.parseScript('const ret = db.test.count({}).sort.limit(1)'));
    commands = mCmds.commands;
    assert.equal(commands.length, 4);
    assert.equal(commands[0].name, 'limit');
    assert.equal(commands[1].name, 'sort');
    assert.equal(commands[2].name, 'count');
    assert.equal(commands[3].name, 'test');

    mCmds = findMongoCommand(esprima.parseScript('const ret = db.test.count({}).sort(1).explain(1)'));
    commands = mCmds.commands;
    assert.equal(commands.length, 4);
    assert.equal(commands[0].name, 'explain');
    assert.equal(commands[1].name, 'sort');
    assert.equal(commands[2].name, 'count');
    assert.equal(commands[3].name, 'test');
  });

  test('test insert explain command', () => {
    let code = insertExplainOnCommand('db.test.find()', 'allPlansExecution');
    assert.equal(code, escodegen.generate(esprima.parse('db.test.explain(\'allPlansExecution\').find();')));

    code = insertExplainOnCommand('db.test.find({a:1, b:true}, {_id: 0})', 'allPlansExecution');
    assert.equal(code, escodegen.generate(esprima.parse('db.test.explain(\'allPlansExecution\').find({a:1, b:true}, {_id: 0});')));

    code = insertExplainOnCommand('db.test.find({a:1, b:true}, {_id: 0})');
    assert.equal(code, escodegen.generate(esprima.parse('db.test.explain(\'queryPlanner\').find({a:1, b:true}, {_id: 0});')));

    code = insertExplainOnCommand('db.test.count()', 'executionStats');
    assert.equal(code, escodegen.generate(esprima.parse('db.test.explain(\'executionStats\').count();')));

    code = insertExplainOnCommand('db.test.distinct()', 'executionStats');
    assert.equal(code, escodegen.generate(esprima.parse('db.test.explain(\'executionStats\').distinct();')));

    code = insertExplainOnCommand('db.test.find({ quantity: { $gt: 50 }, category: "apparel" })', 'executionStats');
    assert.equal(code, escodegen.generate(esprima.parse('db.test.explain(\'executionStats\').find({ quantity: { $gt: 50 }, category: "apparel" });')));

    code = insertExplainOnCommand('db.test.update({ quantity: { $gt: 50 }, category: "apparel" }, {})', 'executionStats');
    assert.equal(code, escodegen.generate(esprima.parse('db.test.explain(\'executionStats\').update({ quantity: { $gt: 50 }, category: "apparel" }, {});')));

    code = insertExplainOnCommand('db.test.invalid()');
    assert.equal(code, 'db.test.invalid().explain("queryPlanner")');

    code = insertExplainOnCommand('db.users.find().sort({"user.age":1})');
    assert.equal(code, escodegen.generate(esprima.parse('db.users.explain("queryPlanner").find().sort({"user.age":1})')));

    code = insertExplainOnCommand('db.users.find().sort({"user.age":1}).limit(100)');
    assert.equal(code, escodegen.generate(esprima.parse('db.users.explain("queryPlanner").find().sort({"user.age":1}).limit(100)')));
  });

  test('already has explain', () => {
    let code = insertExplainOnCommand('db.explains.explain().find().sort({"user.age":1})');
    assert.equal(code, 'db.explains.explain().find().sort({"user.age":1})');
    code = insertExplainOnCommand('db.explains.explain("executionStats").find()');
    assert.equal(code, 'db.explains.explain("executionStats").find()');
  });

  it('test insert explain on aggregate', () => {
    let code = insertExplainOnCommand('db.test.aggregate([])');
    assert.equal(code, escodegen.generate(esprima.parse('db.test.aggregate([], {explain: true})')));

    code = insertExplainOnCommand(escodegen.generate(esprima.parse('db.orders.aggregate(\n' +
      '                     [\n' +
      '                       { $match: { status: "A" } },\n' +
      '                       { $group: { _id: "$cust_id", total: { $sum: "$amount" } } },\n' +
      '                       { $sort: { total: -1 } }\n' +
      '                     ],\n' +
      '                   )')));
    assert.equal(code, escodegen.generate(esprima.parse('db.orders.aggregate(\n' +
      '                     [\n' +
      '                       { $match: { status: "A" } },\n' +
      '                       { $group: { _id: "$cust_id", total: { $sum: "$amount" } } },\n' +
      '                       { $sort: { total: -1 } }\n' +
      '                     ],\n' +
      '                     {\n' +
      '                       explain: true\n' +
      '                     }\n' +
      '                   )')));
  });
});
