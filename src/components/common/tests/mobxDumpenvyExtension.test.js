/**
 * @Author: guiguan
 * @Date:   2017-03-29T13:29:29+11:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-03-29T16:28:36+11:00
 */

import { observable, isObservable, isBoxedObservable } from 'mobx';
import { dump as _dump, restore as _restore } from 'dumpenvy';
import { Doc } from 'codemirror';
import { expect } from 'chai';
import {
  serializer,
  deserializer,
  postDeserializer
} from '#/common/mobxDumpenvyExtension';

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
      x: observable.shallowObject({
        a: 1,
        b: { m: observable.shallowObject({ j: 888 }) }
      })
    };

    const dumpedInput = dump(testInput);
    const restoredDumpedInput = restore(dumpedInput);
    expect(isObservable(restoredDumpedInput.b)).to.be.false;
    expect(dump(restoredDumpedInput)).to.eql(dumpedInput);
  });

  it('serialises and deserialises ObservableValue', () => {
    const testInput = {
      x: observable.shallowBox({ a: 1, b: observable.shallowBox('sss') })
    };

    const dumpedInput = dump(testInput);
    const restoredDumpedInput = restore(dumpedInput);
    expect(isBoxedObservable(restoredDumpedInput.x)).to.be.true;
    expect(isBoxedObservable(restoredDumpedInput.x.get().a)).to.be.false;
    expect(isBoxedObservable(restoredDumpedInput.x.get().b)).to.be.true;
    expect(dump(restoredDumpedInput)).to.eql(dumpedInput);
  });

  it('serialises and deserialises mixed object', () => {
    const sharedObservable = observable('test');
    const testInput = {
      x: new Map([
        ['a', observable([1, 2, 3])],
        [
          'b',
          new Set([
            3,
            observable.map({ n: sharedObservable }),
            sharedObservable
          ])
        ]
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

    const selections = [
      { anchor: { line: 0, ch: 0 }, head: { line: 1, ch: 2 } }
    ];
    newDoc.setSelections(selections);

    const testInput = {
      editor: observable({
        doc: observable.ref(newDoc)
      })
    };

    const dumpedInput = dump(testInput);
    const restoredDumpedInput = restore(dumpedInput);
    const restoredDoc = restoredDumpedInput.editor.doc;

    expect(restoredDoc).to.be.an.instanceof(Doc);
    expect(restoredDoc.getValue()).to.equal(value);
    expect(JSON.stringify(restoredDoc.listSelections())).to.equal(
      JSON.stringify(selections)
    );
  });
});
