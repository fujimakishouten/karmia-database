/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/*jslint node: true */
'use strict';



// Variables
const _ = require('lodash'),
    validator = require('proteus-validator');


/**
 * KarmiaDatabaseAdapter
 *
 * @class
 */
class KarmiaDatabaseTable {

    /**
     * constructor
     *
     * @construct KarmiaDatabaseTable
     * @param     {Object} model
     * @param     {Object} schema
     */
    constructor(model, schema) {
        const self = this;
        self.model = model;
        self.schema = schema.properties;
        self.fields = _.keys(self.schema);
        self.key = _.isArray(schema.key) ? schema.key : [schema.key];
        self.ttl = schema.ttl || 0;
    }


    /**
     * Validate data
     *
     * @param   {Object} data
     * @param   {Function} callback
     * @returns {Array|undefined}
     */
    validate(data, callback) {
        const self = this;

        return validator.validate(self.schema, data, callback);
    }


    /**
     * Find items
     *
     * @param args
     * @param options
     * @param callback
     */
    find(args, options, callback) {
        if (_.isFunction(args)) {
            callback = args;
            args = options = {};
        } else if (_.isFunction(options)) {
            callback = options;
            options = {};
        }

        const self = this;
        self.model.find(args, options, function (error, result) {
            if (error) {
                callback(error);
            } else {
                callback(null, result.toString());
            }
        });
    }


    /**
     * Find an item
     *
     * @param args
     * @param options
     * @param callback
     */
    get(args, options, callback) {
        if (_.isFunction(args)) {
            callback = args;
            args = options = {};
        } else if (_.isFunction(options)) {
            callback = options;
            options = {};
        }

        const self = this;
        options.limit = options.limit || 1;
        self.find(args, options, function (error, result) {
            if (error) {
                callback(error);
            } else {
                callback(null, _.head(result) || null);
            }
        });
    }


    /**
     * Save
     *
     * @param data
     * @param options
     * @param callback
     */
    set(data, options, callback) {
        options = options || {};
        if (_.isFunction(options)) {
            callback = options;
            options = {};
        }

        const self = this,
            model = new self.model(data),
            errors = self.validate(data);
        if (!_.isEmpty(errors)) {
            return callback(errors);
        }

        if (self.ttl) {
            options.ttl = options.ttl || self.ttl;
        }

        model.save(options, callback);
    }


    /**
     * Delete an item
     *
     * @param args
     * @param options
     * @param callback
     */
    remove(args, options, callback) {
        if (_.isFunction(options)) {
            callback = options;
            options = {};
        }

        const self = this,
            model = new self.model(args);
        model.remove(callback);
    }

}



// Export module
module.exports = function (model, schema) {
    return new KarmiaDatabaseTable(model, schema || {});
};



/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * c-hanging-comment-ender-p: nil
 * End:
 */
