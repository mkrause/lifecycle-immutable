// @flow
declare var describe : Function;
declare var it : Function;

import chai, { assert, expect } from 'chai';

import Entity from '../../src/models/Entity.js';


describe('Entity', () => {
    describe('constructor', () => {
        it('should fail to construct an entity from empty arguments', () => {
            class User extends Entity<{ name : string }> {}
            
            // $ExpectError
            expect(() => { new User(); }).to.throw(TypeError);
        });
        
        it('should construct an entity from a plain object', () => {
            class User extends Entity<{ name : string }> {}
            
            expect(() => { new User({ name: 'John' }); }).to.not.throw();
            expect(new User({ name: 'John' })).to.be.an.instanceof(User);
        });
        
        it('should consider `undefined` properties to be valid properties (given that the type allows it)', () => {
            class User extends Entity<{ name : string, optional : ?string }> {}
            
            // $ExpectError: missing property `optional`
            new User({ name: 'John' });
            
            expect(() => { new User({ name: 'John', optional: undefined }); }).to.not.throw();
            expect(new User({ name: 'John', optional: undefined }).has('optional')).to.be.true;
            expect(new User({ name: 'John', optional: undefined }).get('optional')).to.equal(undefined);
            
            expect(() => { new User({ name: 'John', optional: 'foo' }); }).to.not.throw();
        });
        
        it('should enforce that all properties are present', () => {
            class User extends Entity<{ name : string, score : number }> {}
            
            // $ExpectError: empty
            new User({});
            
            // $ExpectError: missing name
            new User({ name: 'John' });
            
            // $ExpectError: missing score
            new User({ score: 42 });
            
            // Valid
            new User({ name: 'John', score: 42 });
            
            assert(true); // Statically checked
        });
        
        it('should enforce that no superfluous properties are present', () => {
            class User extends Entity<{ name : string, score : number }> {}
            
            // $ExpectError: unknown property
            new User({ name: 'John' });
            
            assert(true); // Statically checked
        });
        
        it('should enforce that all properties are valid', () => {
            class User extends Entity<{ name : string, score : number }> {}
            
            // $ExpectError: wrong type
            new User({ name: true });
            
            // $ExpectError: wrong type
            new User({ score: { x: 42 } });
            
            // Valid
            new User({ name: 'John', score: 42 });
            
            assert(true); // Statically checked
        });
    });
    
    describe('meta', () => {
        describe('status', () => {
            it('should be invalid by default', () => {
                class User extends Entity<{ name : string }> {}
                
                expect(new User({ name: 'John' }).meta.status).to.equal('invalid');
            });
            
            it('should allow us to construct an entity with a certain status', () => {
                class User extends Entity<{ name : string }> {}
                
                expect(new User({ name: 'John' }, { status: 'ready' }).meta.status).to.equal('ready');
            });
            
            it('should allow us to update an existing entity with a new status', () => {
                class User extends Entity<{ name : string }> {}
                
                expect(new User({ name: 'John' }).withStatus('pending').meta.status).to.equal('pending');
            });
        });
    });
    
    describe('get()', () => {
        it('should allow us get the value of a property', () => {
            class User extends Entity<{ name : string }> {}
            
            expect(new User({ name: 'John' }).get('name')).to.equal('John');
        });
    });
    
    describe('set()', () => {
        it('should allow us update an entity with a new property value', () => {
            class User extends Entity<{ name : string }> {}
            
            expect(new User({ name: 'John' }).set('name', 'Alice')).to.be.an.instanceof(User);
            expect(new User({ name: 'John' }).set('name', 'Alice').get('name')).to.equal('Alice');
        });
    });
});
