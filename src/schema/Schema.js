
const Schema = {
    text: Symbol('Schema.text'),
    integer: Symbol('Schema.integer'),
    
    orEmpty: t => ({ $option: { empty: "", nonempty: t } }),
};

export default Schema;
