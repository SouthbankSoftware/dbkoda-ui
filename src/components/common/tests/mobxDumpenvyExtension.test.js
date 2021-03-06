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
 * @Author: guiguan
 * @Date:   2017-03-29T13:29:29+11:00
 * @Last modified by:   guiguan
 * @Last modified time: 2018-03-22T20:38:21+11:00
 */

import { observable, isObservable, isBoxedObservable } from 'mobx';
import { dump as _dump, restore as _restore } from 'dumpenvy';
import { Doc } from 'codemirror';
import { expect } from 'chai';
import { serializer, deserializer, postDeserializer } from '#/common/mobxDumpenvyExtension';

describe('DumpEnvy', () => {
  const dump = root => _dump(root, { serializer });
  const restore = data => _restore(data, { deserializer, postDeserializer });

  it('serialises and deserialises ObservableMap', () => {
    const testInput = {
      x: observable.map({ a: 1, b: observable.map({ m: 3 }) })
    };

    const dumpedInput = dump(testInput);
    expect(dump(restore(dumpedInput))).to.eql(dumpedInput);
  });

  it('serialises and deserialises ObservableArray', () => {
    const testInput = {
      x: observable([1, observable([1, 2, 3])])
    };

    const dumpedInput = dump(testInput);
    expect(dump(restore(dumpedInput))).to.eql(dumpedInput);
  });

  it('serialises and deserialises ObservableObject', () => {
    const testInput = {
      x: observable.object(
        {
          a: 1,
          b: { m: observable.object({ j: 888 }, null, { deep: false }) }
        },
        null,
        { deep: false }
      )
    };

    const dumpedInput = dump(testInput);
    const restoredDumpedInput = restore(dumpedInput);
    expect(isObservable(restoredDumpedInput.b)).to.be.false;
    expect(dump(restoredDumpedInput)).to.eql(dumpedInput);
  });

  it('serialises and deserialises ObservableValue', () => {
    const testInput = {
      x: observable.box({ a: 1, b: observable.box('sss', { deep: false }) }, { deep: false })
    };

    const dumpedInput = dump(testInput);
    const restoredDumpedInput = restore(dumpedInput);
    expect(isBoxedObservable(restoredDumpedInput.x)).to.be.true;
    expect(isBoxedObservable(restoredDumpedInput.x.get().a)).to.be.false;
    expect(isBoxedObservable(restoredDumpedInput.x.get().b)).to.be.true;
    expect(dump(restoredDumpedInput)).to.eql(dumpedInput);
  });

  it('serialises and deserialises mixed object', () => {
    const sharedObservable = observable.box('test');
    const testInput = {
      x: new Map([
        ['a', observable([1, 2, 3])],
        ['b', new Set([3, observable.map({ n: sharedObservable }), sharedObservable])]
      ])
    };

    const dumpedInput = dump(testInput);
    const restoredDumpedInput = restore(dumpedInput);
    expect(dump(restoredDumpedInput)).to.eql(dumpedInput);
  });

  it('serialises and deserialises CodeMirror Doc object', () => {
    const newDoc = new Doc('');

    const value = 'test\ntest1\ntest2';
    newDoc.setValue(value);

    const selections = [{ anchor: { line: 0, ch: 0 }, head: { line: 1, ch: 2 } }];
    newDoc.setSelections(selections);

    const testInput = {
      editor: observable(
        {
          doc: newDoc
        },
        {
          doc: observable.ref
        }
      )
    };

    const dumpedInput = dump(testInput);
    const restoredDumpedInput = restore(dumpedInput);
    const restoredDoc = restoredDumpedInput.editor.doc;

    expect(restoredDoc).to.be.an.instanceof(Doc);
    expect(restoredDoc.getValue()).to.equal(value);
    expect(JSON.stringify(restoredDoc.listSelections())).to.equal(JSON.stringify(selections));
  });
});
