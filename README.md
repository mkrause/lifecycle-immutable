
# strux

A set of immutable ([persistent](https://en.wikipedia.org/wiki/Persistent_data_structure)) data structures. Uses [flow](https://flow.org) for static type checking.


## Motivation

This library is similar to existing libraries like [ImmutableJS](https://facebook.github.io/immutable-js). I created strux because none of the libraries I could find matched exactly what I was looking for. A few notable ways in which strux is different:

* Strux makes heavy use of modern JavaScript features like `Map` (for true ordered maps, as well as support for arbitrary keys), and `WeakMap` (for efficient caching through object references).

* Strux `Mapping` performs key comparison based on their value, rather than by reference. That means that the example below will work. Internally we calculate a hash for each key, and perform lookups based on the hash.

```js
const users = new Mapping([
    [{ id: 'john' }, 42],
    [{ id: 'alice' }, 101],
]);
users.has({ id: 'alice' }); // true
users.get({ id: 'alice' }); // 101
```

* Strux relies on flow for static type checking whenever possible. For example, rather than using runtime type checking of record types (like ImmutableJS `Record`), we rely on flow generics using `Record<T>` (where `T` is the record type).

* Includes *nonempty* versions of types where it makes sense. That is, they exclude the "empty" value of that type. For example, a dictionary with zero entries is not a valid instance of `Dictionary`, and an empty string is not a valid instance of `Text`. The reason we default to nonempty types is that it helps to prevent bugs caused by mishandling of edge cases. Expanding a nonempty type to a allow empty values is still easy, by using a maybe type (`?type` in flow).

Strux has not yet been fully optimized. If you're working with large data sets, or have stringent performance requirements, then this library may not fit your needs.


## Interfaces

* `Hashable`: support a `hash()` method to calculate a unique hash for some value object.

```js
interface Hashable {
    hash() : string;
}
```

* `Equatable`: support equality checking between two objects.

```js
interface Equatable {
    equals(other : Hashable) : boolean;
}
```

* `JsonSerializable`: support JSON serialization through `toJSON()`.

```js
interface JsonSerializable {
    toJSON() : any;
}
```


## Structures

**Primitives**

* `Unit`

Represents the empty value. Serves a purpose similar to `null` in JS.


* `Text` and `TextNonempty`

Represents a textual value (i.e. a piece of Unicode text). Can be constructed from any JS string. `TextNonempty` excludes the empty string `""`.

```js
const message = new Text('hello');
message.equals(new Text('hello')); // true
message.toString(); // 'hello'
```


* `Natural` and `NaturalNonempty`

Represents a natural number. Can be constructed from any finite JS integer greater or equal than zero. `NaturalNonempty` also excludes zero.

```js
const count = new Natural(42);
count.equals(new Natural(42)); // true
count.valueOf(); // 42
```


**Compounds**

* `Record<T>`

A record of type `T`. For example, to represent a person with a name field, and a numerical score:

```js
type Person = { name : string, score : number };
const john : Record<Person> = new Record({ name: 'John', score: 42 });
john.get('name'); // 'John'
```

Records are always nonempty types. That is, a record of zero properties is not allowed.


* `Dictionary<A>` and `DictionaryNonempty<A>`

A mapping from symbols (strings) to values of type `A`. Similar to a JS object, in that keys are always textual. But meant specifically for collections of items of the same type (`A`). In contrast, objects that represent a single (record) type should use the `Record` type.

```js
const scores = new Dictionary({
    john: 42,
    alice: 101,
});
scores.get('john'); // 42
scores.toJSON(); // { john: 42, alice: 101 }
```

* `Mapping<K, A>` and `MappingNonempty<K, A>`

A mapping from arbitrary keys (type `A`) to arbitrary values (type `V`). Keys are compared by value equality, rather than by reference. That means that two objects will refer to the same value, as long as they are equal.

```js
const users = new Mapping([
    [{ id: 'john' }, new Record({ name: 'John', score: 42 })],
    [{ id: 'alice' }, new Record({ name: 'Alice', score: 101 })],
]);
users.get({ id: 'alice' }).get('score'); // 101
```
