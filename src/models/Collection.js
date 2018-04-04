
import * as Imm from 'immutable';

import Entity from './Entity.js';

import * as React from 'react';


type K = string;

export type CollectionMeta = { status : 'invalid' | 'pending' | 'ready' };

// Wrapper around Immutable.OrderedMap(), with additional functionality. Represents a collection of
// entities, indexed by their ID. Includes API meta information, like whether the collection has
// been correctly loaded or not.
export default class Collection<Key, T : Entity<Object>> {
  meta : CollectionMeta = {
    status: 'invalid',
  };
  
  _type : Class<T>;
  entries : Imm.OrderedMap<K, T>;
  
  constructor(entries : Iterable<[K, T]> | { [K] : T }, meta : Object = {}, type : *) {
    this._type = type;
    this.entries = Imm.OrderedMap(entries);
    
    Object.assign(this.meta, meta);
    
    // Convince ImmutableJS to let us be be part of an immutable tree structure
    // $FlowFixMe
    this['@@__IMMUTABLE_ITERABLE__@@'] = true;
  }
  
  hasStatus = status => this.meta.status === status;
  
  withEntries(entries) {
    return new this.constructor(entries, this.meta, entries);
  }
  withStatus(status) {
    return new this.constructor(this.entries, { ...this.meta, status });
  }
  
  query(criteria) {
    //TODO
    // items = items.sort((a, b) => {
    //     return a.getIn(['user', 'name']).localeCompare(b.getIn(['user', 'name']));
    // });
    
    return this;
  }
  
  // _apply(fnName, ...args) { return new this.constructor(this.entries[fnName](...args), this.meta); }
  _apply(entries : *) { return new this.constructor(entries.toArray(), this.meta); }
  
  get size() : number { return this.entries.size; }
  isEmpty() { return this.entries.isEmpty(); }
  
  // Access
  has(...args : *) { return this.entries.has(...args); }
  hasIn(...args : *) { return this.entries.hasIn(...args); }
  get(...args : *) { return this.entries.get(...args); }
  getIn(...args : *) { return this.entries.getIn(...args); }
  
  first(...args : *) { return this.entries.first(...args); }
  
  // Mapping
  map(...args : *) { return this._apply(this.entries.map(...args)); }
  flatMap(...args : *) { return this._apply(this.entries.flatMap(...args)); }
  filter(...args : *) { return this._apply(this.entries.filter(...args)); }
  
  sort(...args : *) { return this._apply(this.entries.sort(...args)); }
  sortBy(...args : *) { return this._apply(this.entries.sortBy(...args)); }
  take(...args : *) { return this._apply(this.entries.take(...args)); }
  rest(...args : *) { return this._apply(this.entries.rest(...args)); }
  
  // Transforms
  keySeq(...args : *) { return this.entries.keySeq(...args); }
  valueSeq(...args : *) { return this.entries.valueSeq(...args); }
  entrySeq(...args : *) { return this.entries.entrySeq(...args); }
  toArray(...args : *) { return this.entries.toArray(...args); }
  toObject(...args : *) { return this.entries.toObject(...args); }
  toJS(...args : *) { return this.entries.toJS(...args); }
  
  // $FlowFixMe: flow does not yet support computed properties
  *[Symbol.iterator]() {
    for (let entry of this.entries) {
      yield entry;
    }
  };
  
  set(...args : *) { return this._apply(this.entries.set(...args)); }
  setIn(...args : *) { return this._apply(this.entries.setIn(...args)); }
  update(...args : *) { return this._apply(this.entries.update(...args)); }
  updateIn(...args : *) { return this._apply(this.entries.updateIn(...args)); }
  
  remove(...args : *) { return this._apply(this.entries.remove(...args)); }
  removeIn(...args : *) { return this._apply(this.entries.removeIn(...args)); }
  clear(...args : *) { return this._apply(this.entries.clear(...args)); }
  
  mergeDeepWith(...args : *) { return this._apply(this.entries.mergeDeepWith(...args)); }
  mergeWith(...args : *) { return this._apply(this.entries.mergeWith(...args)); }
  merge(...args : *) { return this._apply(this.entries.merge(...args)); }
  
  // Map this collection to an array of React elements
  mapToElements(fn : (T, ?K) => React.Element<any>) : React.Node {
    const elementsSeq = this
      .map((item, index) => {
        const reactElement = fn(item, index);
        if (!reactElement.props.hasOwnProperty('key')) {
          return React.cloneElement(reactElement, { key: String(index) });
        } else {
          return reactElement;
        }
      })
      .valueSeq();
    
    return [...elementsSeq];
  }
  
  toJSON() {
    return this.entries.toJSON();
  }
  
  toString() {
    const stringRepr = this.entries.toString();
    
    const prefix = `Collection(${this._type.name})`;
    return stringRepr.replace(/^[\w\.]*/, prefix);
  }
}
