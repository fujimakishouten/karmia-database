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
     * Constructor
     *
     * @constructs KarmiaDatabaseSequence
     */
    constructor() {
        const self = this;

        self.convert = KarmiaDatabaseConverterError.convert;
    }


    /**
     * Convert schema
     *
     * @param   {Object} errors
     * @returns {Object}
     */
    static convert(errors) {
        let elements;
        if (Array.isArray(errors)) {
            elements = errors;
        } else if (Object.getPrototypeOf(errors) === Object.prototype) {
            elements = errors.errors || [];
        } else {
            elements = [];
        }

        return elements.reduce(function (collection, element) {
            if ('/properties/' === element.schemaPath.substring(0, 12)) {
                collection[element.schemaPath.split('/')[2]] = element;

                return collection;
            }

            collection[element.params.key] = element;

            return collection;
        }, {});
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
