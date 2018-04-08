// @flow
declare var describe : Function;
declare var it : Function;

import chai, { assert, expect } from 'chai';

import Imm from 'immutable';
import type { RecordFactory, RecordOf } from 'immutable';

import Entity from '../../src/models/EntityFactory.js';


describe('EntityFactory', () => {
    // describe('temp', () => {
    //     it('should ...', () => {
    //         class User extends Entity({ name: String }) {}
            
    //         const factory : RecordFactory<{ x : ?string }> = Imm.Record({ x: null });
    //         const rec : RecordOf<{ x : ?string }> = factory({ x: null });
    //         const x : ?string = rec.get('x');
            
    //         const user = new User({ name: 'John' });
            
    //         user.name;
            
    //         console.log(`${user.get('name')}`);
    //     });
    // });
    
    describe('constructor', () => {
        it('should allow to construct a entity from empty arguments', () => {
            class User extends Entity({ name: String }) {}
            
            expect(() => { new User(); }).to.not.throw(TypeError);
            expect(new User()).to.be.an.instanceof(User);
            // expect(new User()).to.be.an.instanceof(Entity); // Doesn't work, `Entity` is a function
        });
    });
    
    describe('Immutable.Record API', () => {
        it('should be an instance of Immutable.Record', () => {
            class User extends Entity({ name: String }) {}
            
            expect(new User()).to.be.an.instanceof(Imm.Record);
            expect('@@__IMMUTABLE_RECORD__@@' in new User()).to.be.true;
        });
    });
    
    describe('custom properties', () => {
        it('should *not* allow us to add custom properties directly', () => {
            const UserSchema = { first_name: String, last_name: String };
            class User extends Entity(UserSchema) {
                fullName() { return `${this.get('first_name')} ${this.get('last_name')}`; }
                
                role = 'user';
            }
            
            const user = new User({ first_name: 'John', last_name: 'Smith' });
            
            // The following will work:
            expect(user.role).to.equal('user');
            
            // ...however, after any update Immutable.Record will forget anything that's not on the
            // `User.prototype` chain (like direct properties). This is because when creating new
            // records from old ones, Immutable will copy the prototype but not call the constructor.
            expect(user.set('first_name', 'Alice').role).to.not.equal('user');
        });
    });
    
    describe('custom methods', () => {
        it('should allow to add custom methods', () => {
            const UserSchema = { first_name: String, last_name: String };
            class User extends Entity(UserSchema) {
                fullName() { return `${this.get('first_name')} ${this.get('last_name')}`; }
            }
            
            const user = new User({ first_name: 'John', last_name: 'Smith' });
            
            expect(user.fullName()).to.equal('John Smith');
            expect(user.set('first_name', 'Alice').fullName()).to.equal('Alice Smith'); // With update
        });
    });
    
    describe('status', () => {
        it('should have a status', () => {
            class User extends Entity({ name: String }) {}
            
            const user = new User({ name: 'John' });
            expect(user.status).to.deep.equal({
                ready: false,
                loading: false,
                error: null,
            });
        });
    });
    
    describe('get()', () => {
        it('should allow us get the value of a property', () => {
            class User extends Entity({ name: String }) {}
            
            const user = new User({ name: 'John' });
            expect(user.get('name')).to.equal('John');
            expect(user.set('name', 'Alice').get('name')).to.equal('Alice'); // With update
        });
        
        it('should also work by direct access', () => {
            class User extends Entity({ name: String }) {}
            
            const user = new User({ name: 'John' });
            expect(user.name).to.equal('John');
        });
    });
    
    describe('set()', () => {
        it('should allow us update an entity with a new property value', () => {
            class User extends Entity({ name: String }) {}
            
            const user = new User({ name: 'John' });
            expect(user.set('name', 'Alice')).to.not.equal(user);
            expect(user.set('name', 'Alice')).to.be.an.instanceof(User);
            expect(user.set('name', 'Alice').get('name')).to.equal('Alice');
            expect(user.set('name', 'Alice').get('name')).to.equal('Alice');
        });
    });
    
    describe('toJS()', () => {
        it('should return a plain JS version of the record', () => {
            class User extends Entity({ name: String }) {}
            
            const user = new User({ name: 'John' });
            expect(user.toJS()).to.deep.equal({
                name: 'John',
            });
        });
    });
});
