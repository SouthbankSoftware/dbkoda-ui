/**
 * Extension to handle Mobx observables
 *
 * @Author: guiguan
 * @Date:   2017-03-29T13:25:34+11:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-03-29T15:54:46+11:00
 */

import {
  observable,
  isObservable,
  isObservableMap,
  isObservableArray,
  isObservableObject,
  isBoxedObservable
} from 'mobx';
import Store from '~/stores/global';
import { Doc } from 'codemirror';
import _ from 'lodash';

export function serializer(key, value) {
  if (isObservable(value)) {
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
  } else if (value instanceof Doc) {
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
      __dump__: 'Doc'
    };
  }
  return value;
}

export function deserializer(key, value) {
  if (value !== null) {
    if (value.__dump__ === 'ObservableMap') {
      return observable.shallowMap(value.entries);
    } else if (value.__dump__ === 'ObservableArray') {
      return observable.shallowArray(value.values);
    } else if (value.__dump__ === 'ObservableObject') {
      delete value.__dump__;
      return observable.shallowObject(value);
    } else if (value.__dump__ === 'ObservableValue') {
      return observable.shallowBox(value.value);
    } else if (value.__dump__ === 'Doc') {
      const newDoc = Store.createNewDocumentObject(value.value);

      newDoc.lineSep = value.lineSep;
      newDoc.setCursor(value.cursor);
      newDoc.setSelections(value.selections);
      newDoc.setHistory(value.history);
      // recover changes generation
      const _recoverGen = (collectionName) => {
        for (const [i, v] of value.history[collectionName].entries()) {
          if (v.generation) {
            newDoc.history[collectionName][i].generation = v.generation;
          }
        }
      };
      _recoverGen('done');
      _recoverGen('undone');
      _.assign(
        newDoc.history,
        _.pick(value.history, ['generation', 'maxGeneration', 'undoDepth'])
      );
      newDoc.cleanGeneration = value.cleanGeneration;

      return newDoc;
    }
  }
  return value;
}

export function postDeserializer(item, visited, deserializer) {
  if (isObservable(item)) {
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
  } else if (item instanceof Doc) {
    return null;
  } else {
    return false;
  }
}
