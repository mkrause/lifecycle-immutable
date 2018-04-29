
export const oneOf = Symbol('Schema.oneOf');
export const maybeExists = Symbol('Schema.maybeExists');

const Schema = {
    text: Symbol('Schema.text'),
    integer: Symbol('Schema.integer'),
    
    oneOf: (...args) => ({ $type: oneOf, options: args }),
    
    // For object properties that may not be present
    maybeExists: schema => ({ $type: maybeExists, schema }),
};

export default Schema;
