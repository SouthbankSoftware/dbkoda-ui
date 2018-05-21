/**
 * Extension to handle Mobx observables
 *
 * @Author: guiguan
 * @Date:   2017-03-29T13:25:34+11:00
 * @Last modified by:   guiguan
 * @Last modified time: 2018-05-20T22:14:58+10:00
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

import {
  observable,
  isObservable,
  isObservableMap,
  isObservableArray,
  isObservableObject,
  isBoxedObservable
} from 'mobx';
import StaticApi from '~/api/static';
import { Doc } from 'codemirror';
import _ from 'lodash';
import Output from '~/stores/Output';

export function serializer(key, value) {
  if (value instanceof Doc) {
    return {
      value: value.getValue(),
      lineSep: value.lineSep,
      cursor: value.getCursor(),
      selections: value.listSelections(),
      history: _.pick(value.history, [
        'done',
        'generation',
        'maxGeneration',
        'undoDepth',
        'undone'
      ]),
      cleanGeneration: value.cleanGeneration,
      modeOption: value.modeOption,
      __dump__: 'Doc'
    };
  } else if (value instanceof Output) {
    return {
      value: _.assign({}, value),
      __dump__: 'Output'
    };
  } else if (isObservable(value)) {
    if (isObservableMap(value)) {
      return { entries: [...value], __dump__: 'ObservableMap' };
    } else if (isObservableArray(value)) {
      return { values: [...value], __dump__: 'ObservableArray' };
    } else if (isObservableObject(value)) {
      const result = { __dump__: 'ObservableObject' };
      for (const key in value) {
        if ({}.hasOwnProperty.call(value, key)) {
          result[key] = value[key];
        }
      }
      return result;
    } else if (isBoxedObservable(value)) {
      return { value: value.get(), __dump__: 'ObservableValue' };
    }
  }

  return value;
}

export function deserializer(key, value) {
  if (value !== null) {
    if (value.__dump__ === 'ObservableMap') {
      return observable.map(value.entries, { deep: false });
    } else if (value.__dump__ === 'ObservableArray') {
      return observable.array(value.values, { deep: false });
    } else if (value.__dump__ === 'ObservableObject') {
      delete value.__dump__;
      return observable.object(value, null, { deep: false });
    } else if (value.__dump__ === 'ObservableValue') {
      return observable.box(value.value, { deep: false });
    } else if (value.__dump__ === 'Doc') {
      const { value: v, lineSep, cursor, selections, history, cleanGeneration, modeOption } = value;

      const newDoc = StaticApi.createNewDocumentObject(v, modeOption);

      newDoc.lineSep = lineSep;
      newDoc.setCursor(cursor);
      newDoc.setSelections(selections);
      newDoc.setHistory(history);
      // recover changes generation
      const _recoverGen = collectionName => {
        for (const [i, v] of history[collectionName].entries()) {
          if (v.generation) {
            newDoc.history[collectionName][i].generation = v.generation;
          }
        }
      };
      _recoverGen('done');
      _recoverGen('undone');
      _.assign(newDoc.history, _.pick(history, ['generation', 'maxGeneration', 'undoDepth']));
      newDoc.cleanGeneration = cleanGeneration;

      return newDoc;
    } else if (value.__dump__ === 'Output') {
      const { value: v } = value;

      const newOutput = new Output();
      newOutput._value = v;

      return newOutput;
    }
  }

  return value;
}

export function postDeserializer(item, visited, deserializer) {
  if (item instanceof Doc) {
    return true;
  } else if (item instanceof Output) {
    _.forEach(item._value, (v, k) => {
      const transformed = deserializer(k, v);

      item[k] = transformed;
      if (!visited.has(transformed)) visited.add(transformed);
    });

    delete item._value;

    return true;
  } else if (isObservable(item)) {
    if (isObservableMap(item)) {
      const mapEntries = [...item.entries()];
      item.clear();

      for (const [key, value] of mapEntries) {
        const transformedKey = deserializer(0, key);
        const transformedValue = deserializer(1, value);

        item.set(transformedKey, transformedValue);
        if (!visited.has(transformedKey)) visited.add(transformedKey);
        if (!visited.has(transformedValue)) visited.add(transformedValue);
      }
    } else if (isObservableArray(item)) {
      const arrayEntries = [...item.entries()];
      item.clear();

      for (const [key, value] of arrayEntries) {
        const transformed = deserializer(key, value);
        item.push(transformed);
        if (!visited.has(transformed)) visited.add(transformed);
      }
    } else if (isBoxedObservable(item)) {
      const value = item.get();
      const transformedValue = deserializer(0, value);

      item.set(transformedValue);
      if (!visited.has(transformedValue)) visited.add(transformedValue);
    } else {
      return false;
    }

    // return true means already handled
    return true;
  }

  // return false to let default post deserialization logic continue
  return false;
}
