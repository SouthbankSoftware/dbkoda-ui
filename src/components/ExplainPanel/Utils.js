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
 * Created by joey on 6/6/17.
 */

import _ from 'lodash';
import os from 'os';

const esprima = require('esprima');
const escodegen = require('escodegen');

export const getWorstStage = stages => {
  let max = 0;
  stages.map(stage => {
    let time = stage.executionTimeMillisEstimate;
    if (time === undefined) {
      time = stage.executionTimeMillis;
    } else if (stage.executionTimeMillis !== undefined) {
      time = Math.max(time, stage.executionTimeMillis);
    }
    if (max < time) {
      max = time;
    }
  });
  return max;
};

export const getWorstShardStages = shards => {
  let max = -1;
  let worst = null;
  let shardName = null;
  shards.map(shard => {
    if (shard && shard.stages && shard.stages.length > 0) {
      if (worst === null) {
        worst = shard.stages;
      }
      const worstStageTime = getWorstStage(shard.stages);
      if (max < worstStageTime) {
        max = worstStageTime;
        shardName = shard.shardName;
        worst = shard.stages;
      }
    }
  });
  return { shardName, worst };
};

export const getStageElapseTime = stage => {
  return stage && stage.executionTimeMillisEstimate !== undefined
    ? stage.executionTimeMillisEstimate
    : stage.executionTimeMillis;
};

const coloursTheme = [
  '#24a26e',
  '#29bc7f',
  '#43d698',
  '#6ddfaf',
  '#96e8c6',
  '#debabd',
  '#ce979c',
  '#be747c',
  '#ad525b',
  '#8a4148'
];

export const generateColorValueByTime = (stage, number, max, min) => {
  const yellow = '#f0c419';
  const red = '#8a4148';
  const green = '#24a26e';
  const greenValue = 9;
  const redValue = 0;
  const defaultColor = green; // '#516E72';
  if (!stage) {
    return 'transparent';
  }
  if (
    stage.docsExamined !== undefined &&
    stage.nReturned !== undefined &&
    stage.docsExamined > stage.nReturned * 1.1
  ) {
    return red;
  }
  // if (stageTime === max && stageTime > min && stage.stage !== 'SHARD_MERGE') {
  //   return yellow;
  // }
  if (stage.stage === 'COLLSCAN' || stage.stage === 'SORT') {
    return yellow;
  }

  // const best = 0x8a4148;
  // const worst = 0x24a26e;
  if (max === min) {
    return defaultColor;
  }
  const value = parseInt(
    (getStageElapseTime(stage) - min) * (greenValue - redValue) / (max - min) + redValue,
    10
  );
  return coloursTheme[value];
};

const findMongoCommandFromMemberExpress = exp => {
  const callee = exp.callee;
  let memberExp = callee;
  let parent = exp;
  const commands = [];
  while (memberExp && memberExp.type === esprima.Syntax.MemberExpression) {
    if (memberExp.property && memberExp.property.type === esprima.Syntax.Identifier) {
      const cmd = { name: memberExp.property.name, parent };
      parent = memberExp;
      cmd.ast = memberExp;
      if (memberExp.object && memberExp.object.type === esprima.Syntax.CallExpression) {
        memberExp = memberExp.object.callee;
      } else {
        memberExp = memberExp.object;
      }
      commands.push(cmd);
    }
  }
  return { commands };
};

const findRootExpression = ast => {
  if (ast.type === esprima.Syntax.Program && ast.body && ast.body.length === 1) {
    const script = ast.body[0];
    if (script.type === esprima.Syntax.ExpressionStatement) {
      if (script.expression.type === esprima.Syntax.CallExpression) {
        return script.expression;
      } else if (script.expression.type === esprima.Syntax.AssignmentExpression) {
        return script.expression.right;
      }
    } else if (
      script.type === esprima.Syntax.VariableDeclaration &&
      script.declarations &&
      script.declarations.length > 0
    ) {
      return script.declarations[0].init;
    }
  }
  return {};
};

export const findMongoCommand = commandAst => {
  if (
    commandAst.type === esprima.Syntax.Program &&
    commandAst.body &&
    commandAst.body.length === 1
  ) {
    const script = commandAst.body[0];
    if (script.type === esprima.Syntax.ExpressionStatement) {
      if (script.expression.type === esprima.Syntax.CallExpression) {
        return findMongoCommandFromMemberExpress(script.expression);
      } else if (script.expression.type === esprima.Syntax.AssignmentExpression) {
        return findMongoCommandFromMemberExpress(script.expression.right);
      }
    } else if (
      script.type === esprima.Syntax.VariableDeclaration &&
      script.declarations &&
      script.declarations.length > 0
    ) {
      return findMongoCommandFromMemberExpress(script.declarations[0].init);
    }
  }
  return {};
};

const findMatchedCommand = commands => {
  const supportedCmds = ['find', 'count', 'distinct', 'update', 'aggregate'];
  let value = null;
  supportedCmds.forEach(c => {
    const matched = _.find(commands, { name: c });
    if (matched) {
      value = matched;
    }
  });
  return value;
};

const explainAst = explainParam => {
  const args = [];
  if (explainParam) {
    args.push({
      type: esprima.Syntax.Literal,
      value: explainParam
    });
  }
  return {
    type: esprima.Syntax.CallExpression,
    callee: {
      type: esprima.Syntax.MemberExpression,
      object: null,
      property: {
        type: esprima.Syntax.Identifier,
        name: 'explain'
      }
    },
    arguments: args
  };
};

export const insertExplainToAggregate = root => {
  if (root && root.arguments) {
    if (root.arguments.length > 1) {
      // insert into the second argument
      const second = root.arguments[1];
      if (second && second.type === esprima.Syntax.ObjectExpression && second.properties) {
        second.properties.push({
          type: esprima.Syntax.Property,
          key: {
            type: esprima.Syntax.Identifier,
            name: 'explain'
          },
          value: {
            type: esprima.Syntax.Literal,
            value: true
          }
        });
      }
    } else {
      root.arguments.push({
        type: esprima.Syntax.ObjectExpression,
        properties: [
          {
            type: esprima.Syntax.Property,
            key: {
              type: esprima.Syntax.Identifier,
              name: 'explain'
            },
            value: {
              type: esprima.Syntax.Literal,
              value: true,
              raw: 'true'
            }
          }
        ]
      });
    }
  }
};

/**
 * if the explain command is before find on windows append a next()
 */
export const appendNextOnExplainFind = command => {
  const i = command.search(/find\(.*\)/);
  const j = command.search(/explain\(.*\)/);
  if (i > j && command.indexOf('next()') < 0) {
    let newCmd = command;
    // need to append next()
    if (command.match(/;$/)) {
      newCmd = command.replace(/;$/, '.next();');
    } else {
      newCmd = command + '.next()';
    }
    return newCmd;
  }
  return command;
};

export const insertExplainOnCommand = (command, explainParam = 'queryPlanner') => {
  try {
    const parsed = esprima.parseScript(command);
    const root = findRootExpression(parsed);
    const { commands } = findMongoCommandFromMemberExpress(root);

    if (!_.find(commands, { name: 'explain' })) {
      const matchedCmd = findMatchedCommand(commands);
      if (matchedCmd) {
        if (['aggregate', 'count', 'update', 'distinct'].indexOf(matchedCmd.name) >= 0) {
          const explainObj =
            matchedCmd.name === 'aggregate' ? explainAst() : explainAst(explainParam);
          explainObj.callee.object = matchedCmd.ast.object;
          matchedCmd.ast.object = explainObj;
          return escodegen.generate(parsed);
        }
      }
      if (command.match(/;$/)) {
        return command.replace(/;$/, '.explain("' + explainParam + '");');
      }
      return command + '.explain("' + explainParam + '")';
    }
    // explain command is defined by user
    if (os.release().indexOf('Windows') >= 0) {
      return appendNextOnExplainFind(command);
    }
  } catch (err) {
    console.error('failed to parse script ', command);
    logToMain('error', 'Failed to parse script to explain: ' + command);
  }
  return command;
};
