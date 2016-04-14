/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/*jslint devel: true, node: true, nomen: true, stupid: true */
'use strict';



// Variables
const _ = require('lodash');


// Export module
module.exports = {

    /**
     * Convert errors from Array to Object
     *
     * @param   {Array} errors
     * @param   {Function} callback
     * @returns {Object}
     */
    convert: function (errors, callback) {
        /**
         * Convert errors to object
         *
         * @param   {Array} keys
         * @param   {*}     value
         * @returns {Object}
         */
        function convert(keys, value) {
            const key = keys.pop(),
                result = {};
            result[key] = value;
            if (keys.length) {
                return convert(keys, result);
            } else {
                return result;
            }
        }

        const delimiter = /\]\[/g,
            remove = /['\$\[\]]/g,
            result = _.reduce(errors, function (result, value) {
                value.path = value.property.replace(delimiter, '.').replace(remove, '');
                return _.merge(result, convert(value.path.split('.'), value));
            }, {});
        if (callback) {
            callback(null, result);
        } else {
            return result;
        }
    }

};



/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * c-hanging-comment-ender-p: nil
 * End:
 */
