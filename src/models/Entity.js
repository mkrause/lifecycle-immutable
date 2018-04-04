// @flow

import * as Imm from 'immutable';
import type { RecordOf } from 'immutable';


// const getDefaults = function<T : Object>(schema : $ObjMap<T, <V>(V) => mixed>) : T {
//     return _.mapValues(schema, prop => {
//         if (prop instanceof Collection) {
//             return prop;
//         } else {
//             return null;
//         }
//     });
// };

export type EntityMeta = { status : 'invalid' | 'pending' | 'ready' };

// Wrapper around Immutable.Record, in order to extend it with some new state/methods.
export default class Entity<T : { +[string] : mixed }> {
    meta : EntityMeta = {
        status: 'invalid',
    };
    
    _instance : RecordOf<T>;
    
    constructor(instance : T, meta : Object = {}) {
        // const RecordFactory = Imm.Record(getDefaults(schema));
        const RecordFactory = Imm.Record(instance);
        this._instance = RecordFactory();
        
        Object.assign(this.meta, meta);
        
        // Define getters for all properties (to allow using `entity.foo` instead of `entity.get('foo')`).
        // Note: flow doesn't allow us to add properties dynamically, so using this will cause flow errors.
        for (const [keyName, value] of this._instance.toSeq()) {
            Object.defineProperty(this, keyName, {
                get: () => this._instance.get(keyName),
            });
        }
        
        // Convince ImmutableJS to let us be be part of an immutable tree structure
        // $FlowFixMe
        this['@@__IMMUTABLE_RECORD__@@'] = true;
    }
    
    withStatus(status : $PropertyType<EntityMeta, 'status'>) {
        return new this.constructor(this._instance.toObject(), { ...this.meta, status });
    }
    
    _apply(instance : *) {
        return new this.constructor(instance.toObject(), this.meta);
    }
    
    
    get(...args : *) { return this._instance.get(...args); }
    getIn(...args : *) { return this._instance.getIn(...args); }
    toSeq(...args : *) { return this._instance.toSeq(...args); }
    
    toObject(...args : *) { return this._instance.toObject(...args); }
    toJS(...args : *) { return this._instance.toJS(...args); }
    
    // $FlowFixMe: flow does not yet support computed properties
    *[Symbol.iterator]() {
        for (const entry of this._instance.toSeq()) {
            yield entry;
        }
    }
    
    set(...args : *) { return this._apply(this._instance.set(...args)); }
    setIn(...args : *) { return this._apply(this._instance.setIn(...args)); }
    update(...args : *) { return this._apply(this._instance.update(...args)); }
    updateIn(...args : *) { return this._apply(this._instance.updateIn(...args)); }
    mergeDeepWith(...args : *) { return this._apply(this._instance.mergeDeepWith(...args)); }
    mergeWith(...args : *) { return this._apply(this._instance.mergeWith(...args)); }
    
    toJSON() : mixed {
        return this._instance.toJSON();
    }
    
    toString() : string {
        return this._instance.toString();
    }
};
