// @xflow (disabled)

import Imm from 'immutable';
import type { RecordFactory } from 'immutable';


export type Status = {|
    +ready : boolean,
    +loading : boolean,
    +error : null | Error,
|};

/*
An experimental alternative to `Entity`, which uses a factory function that produces a subclass
of `Immutable.Record` (rather than the composition approach used by `Entity`).

Benefits:
  - No need to redefine all Immutable.Record methods.
  - No need for hacks to get Immutable to accept the Entity as an Immutable data structure.
  - Likely to be slightly more efficient due to less overhead (but we haven't tested this at all).

Issues:
  - Can't seem to express this in flow. Flow doesn't seem to be very fond of inheritance in general,
    but the combination of dynamic class generation, generics, etc. are especially hard to get right.
*/
export default <T : { [string] : mixed }>(schema : T) => {
    if (schema.hasOwnProperty('_status')) {
        throw new TypeError('Cannot use `_status` as property key');
    }
    
    const internals : { _status : Status } = {
        _status: {
            ready: false,
            loading: false,
            error: null,
        },
    };
    
    const defaults : T & { _status : Status } = Object.keys(schema).reduce(
        (defaults, key) => ({ ...defaults, [key]: null }),
        internals
    );
    
    const keys = Object.keys(schema);
    
    const Factory : RecordFactory<T> = Imm.Record(defaults);
    
    class Entity extends Factory {
        /*
        Override the internal `_keys` property, in order to hide `_status`. Note that `has()`
        and `get()` don't use `_keys`, they refer to `_indices` instead. This allows us to
        still access and manipulate the `_status`, it will just not show in iterations.
        */
        _keys : Array<string> = keys;
        
        get status() : Status {
            return this.get('_status');
        }
    }
    
    return Entity;
};
