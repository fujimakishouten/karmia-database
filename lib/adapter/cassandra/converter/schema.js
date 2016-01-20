/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/*jslint node: true */
'use strict';




// Variables
const _ = require('lodash'),
    mongoose = require('mongoose');


// Export module
module.exports = {

    map: {
        ascii: String,
        bigint: Number,
        blob: Buffer,
        bool: Boolean,
        boolean: Boolean,
        buffer: Buffer,
        counter: Number,
        date: Date,
        datetime: Date,
        decimal: Number,
        double: Number,
        float: Number,
        inet: String,
        int: Number,
        integer: Number,
        list: Array,
        map: mongoose.Schema.Types.Mixed,
        set: mongoose.Schema.Types.Mixed,
        string: String,
        text: String,
        timestamp: Date,
        uuid: String,
        timeuuid: String,
        varchar: String,
        varint: Number
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
