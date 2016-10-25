/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/* eslint-env es6, mocha, node */
/* eslint-extends: eslint:recommended */
'use strict';



/**
 * KarmiaDatabaseConverterError
 *
 * @class
 */
class KarmiaDatabaseConverterError {
    /**
     * Convert schema
     *
     * @param   {Object} errors
     * @returns {Object}
     */
    convert(errors) {
        /**
         * Transform errors
         *
         * @param {Object} collection
         * @param {string} path
         * @param {*} element
         */
        function transform(collection, path, element) {
            const properties = path.split('.'),
                key = properties[0];

            if (1 < properties.length) {
                transform(collection[key], path.substring(path.indexOf('.') + 1), element);
            } else {
                collection[key] = element;
            }
        }


        let elements;
        const result = {};
        if (Array.isArray(errors)) {
            elements = errors;
        } else if (Object.getPrototypeOf(errors) === Object.prototype) {
            elements = errors.errors || [];
        } else {
            elements = [];
        }

        elements.forEach(function (error) {
            transform(result, error.property, error);
        });

        return result;
    }
}


// Export module
module.exports = function () {
    return new KarmiaDatabaseConverterError();
};



/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * c-hanging-comment-ender-p: nil
 * End:
 */
