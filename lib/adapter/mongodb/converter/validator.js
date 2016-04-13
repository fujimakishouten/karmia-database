/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/*jslint node: true */
'use strict';




// Variables
const _ = require('lodash');


// Export module
module.exports = {

    map: {
        any: 'any',
        array: 'array',
        ascii: 'string',
        bigint: 'integer',
        blob: 'string',
        bool: 'boolean',
        boolean: 'boolean',
        buffer: 'string',
        counter: 'integer',
        date: 'object',
        datetime: 'object',
        decimal: 'number',
        double: 'number',
        float: 'number',
        inet: 'string',
        int: 'integer',
        integer: 'integer',
        list: 'array',
        map: 'map',
        mixed: 'any',
        number: 'number',
        object: 'object',
        object_id: 'string',
        objectid: 'string',
        set: 'array',
        string: 'string',
        text: 'string',
        timestamp: 'string',
        uuid: 'string',
        timeuuid: 'string',
        varchar: 'string',
        varint: 'integer'
    },


    /**
     * Convert schema types
     *
     * @param {Object} schema
     */
    convert: function (schema) {
        const self = this,
            func = _.isArray(schema) ? _.map : _.mapValues;

        return func(schema, function (value, key) {
            if ('type' === key) {
                return _.get(self.map, value, value);
            }

            if (_.isObject(value)) {
                return self.convert(value);
            }

            return value;
        });
    }

};



/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * c-hanging-comment-ender-p: nil
 * End:
 */
