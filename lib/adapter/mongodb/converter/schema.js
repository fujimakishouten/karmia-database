/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/*jslint node: true */
'use strict';




// Variables
const _ = require('lodash'),
    mongoose = require('mongoose');


// Export module
module.exports = {

    map: {
        any: mongoose.Schema.Types.Mixed,
        array: Array,
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
        mixed: mongoose.Schema.Types.Mixed,
        number: Number,
        object: mongoose.Schema.Types.Mixed,
        object_id: mongoose.Schema.Types.ObjectId,
        objectid: mongoose.Schema.Types.ObjectId,
        set: mongoose.Schema.Types.Mixed,
        string: String,
        text: String,
        timestamp: Date,
        uuid: mongoose.Schema.Types.ObjectId,
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


            if ('index' === key) {
                return _.map(value, function (data) {
                    if (_.isString(data)) {
                        data = [data];
                    }

                    if (_.isArray(data)) {
                        const fields = {};
                        _.forEach(data, function (name) {
                            fields[name] = 1;
                        });

                        return {fields: fields};
                    }

                    return data;
                });
            }

            if (_.isObject(value)) {
                return self.convert(_.isArray(value) ? value : _.omit(value, ['properties']));
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
