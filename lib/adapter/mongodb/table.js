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
     * @param     {Object} connection
     * @param     {Object} model
     * @param     {Object} schema
     */
    constructor(connection, model, schema) {
        const self = this;
        self.connection = connection;
        self.model = model;
        self.schema = schema;
        self.fields = Object.keys(self.schema.properties);
        self.key = Array.isArray(schema.key) ? schema.key : [schema.key];
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

        return validator.validate(self.schema, data || {}, callback);
    }


    /**
     * Count data
     *
     * @param   {Object} conditions
     * @param   {Function} callback
     */
    count(conditions, callback) {
        const self = this;
        if (_.isFunction(conditions)) {
            callback = conditions;
            conditions = {};
        }

        // Return promise if callback function is not defined
        if (!callback) {
            return self.model.count(conditions);
        }

        // Callback
        self.model.count(conditions, callback);
    }


    /**
     * Find items
     *
     * @param {Object} conditions
     * @param {Object} projection
     * @param {Object} options
     * @param {Function} callback
     */
    find(conditions, projection, options, callback) {
        const self = this;
        if (_.isFunction(conditions)) {
            callback = conditions;
            conditions = projection = options = {};
        } else if (_.isFunction(projection)) {
            callback = projection;
            projection = options = {};
        } else if (_.isFunction(options)) {
            callback = options;
            options = projection;
            projection = {};
        }

        // Return promise if callback function is not defined
        if (!callback) {
            return self.model.find(conditions, projection, options);
        }

        // Callback
        self.model.find(conditions, projection, options, callback);
    }


    /**
     * Find an item
     *
     * @param {Object} conditions
     * @param {Object} projection
     * @param {Object} options
     * @param {Function} callback
     */
    get(conditions, projection, options, callback) {
        const self = this;
        if (_.isFunction(conditions)) {
            callback = conditions;
            conditions = projection = options = {};
        } else if (_.isFunction(projection)) {
            callback = projection;
            projection = options = {};
        } else if (_.isFunction(options)) {
            callback = options;
            options = projection;
            projection = {};
        }

        // Return promise if callback function is not defined
        if (!callback) {
            return self.model.findOne(conditions, projection, options);
        }

        // Callback
        self.model.findOne(conditions, projection, options, callback);
    }


    /**
     * Save
     *
     * @param {Object} doc
     * @param {Object} options
     * @param {Function} callback
     */
    set(doc, options, callback) {
        if (_.isFunction(options)) {
            callback = options;
            options = {};
        }

        const self = this,
            document = _.pick(doc, self.fields),
            conditions = self.key.reduce(function (result, value) {
                result[value] = document[value];

                return result;
            }, {}),
            parameters = Object.assign({
                new: true,
                upsert: true
            }, options),
            errors = self.validate(document);

        // Abort when validation error
        if (!_.isEmpty(errors)) {
            return (callback) ? callback(errors) : Promise.reject(errors);
        }

        // Return promise if callback function is not defined
        if (!callback) {
            return self.model.findOneAndUpdate(conditions, document, parameters);
        }

        // Callback
        self.model.findOneAndUpdate(conditions, document, parameters, callback);
    }


    /**
     * Remove an item
     *
     * @param {Object} conditions
     * @param {Object} options
     * @param {Function} callback
     */
    remove(conditions, options, callback) {
        const self = this;
        if (_.isFunction(options)) {
            callback = options;
            options = {};
        }

        // Return promise if callback function is not defined
        if (!callback) {
            return self.model.findOneAndRemove(conditions, options);
        }

        // Callback
        self.model.findOneAndRemove(conditions, options, callback);
    }

}


// Export module
module.exports = function (connection, model, schema) {
    return new KarmiaDatabaseTable(connection, model, schema || {});
};



/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * c-hanging-comment-ender-p: nil
 * End:
 */
