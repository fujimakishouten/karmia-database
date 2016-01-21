/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/*jslint node: true */
'use strict';




// Variables
const _ = require('lodash'),
    cassie = require('cassie-odm');


// Export module
module.exports = {

    map: {
        array: cassie.types.Array,
        ascii: cassie.types.String,
        bigint: cassie.types.Number,
        blob: cassie.types.Buffer,
        bool: cassie.types.Boolean,
        boolean: cassie.types.Boolean,
        buffer: cassie.types.Buffer,
        counter: cassie.types.Counter,
        date: cassie.types.Date,
        datetime: cassie.types.Date,
        decimal: cassie.types.Number,
        double: cassie.types.Number,
        float: cassie.types.Number,
        inet: cassie.types.String,
        int: cassie.types.Number,
        integer: cassie.types.Number,
        list: cassie.types.Array,
        map: cassie.types.Object,
        mixed: cassie.types.Object,
        object: cassie.types.Object,
        set: cassie.types.Object,
        string: cassie.types.String,
        text: cassie.types.String,
        timestamp: cassie.types.Date,
        uuid: cassie.types.uuid,
        timeuuid: cassie.types.timeuuid,
        varchar: cassie.types.String,
        varint: cassie.types.Number
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
