/**
 * @param {Class} ctx
 * @param {Function} Class - The abstract class from which ctx is an "instance" of
 * @param {string} errMsg - The error message used when an exception is thrown
 */
const assertAbstractClassImplemented = (ctx, Class, errMsg) => {
    if(ctx.constructor === Class)
        throw new TypeError(errMsg);
};

/**
 * @param {*} method - The method that should be implemented
 * @param {string} errMsg - The message to use as the error if the given method is not a Function
 */
const assertMethodImplemented = (method, errMsg) => {
    if(typeof method != "function")
        throw new TypeError(errMsg);
};

const make = (Class, ...args) => new Class(...args);

/**
 * @param {Class|*} obj 
 * @param {Function} Class - The desired class
 * @param {string} errMsg - The message to use as the error if the given object is not an instance of the given class
 */
const assertInstanceOf = (obj, Class, errMsg) => {
    if(!(obj instanceof Class))
        throw new TypeError(errMsg);
}

export {
    assertAbstractClassImplemented,
    assertMethodImplemented,
    make,
    assertInstanceOf,
};