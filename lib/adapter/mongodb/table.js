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
        self.fields = _.keys(self.schema.properties);
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

        return validator.validate(self.schema, data || {}, callback);
    }


    /**
     * Count data
     *
     * @param   {Object} conditions
     * @param   {Function} callback
     */
    count(conditions, callback) {
        if (_.isFunction(conditions)) {
            callback = conditions;
            conditions = {};
        }

        const self = this;
        if (!callback) {
            return self.model.count(conditions);
        }

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

        const self = this;
        if (!callback) {
            return new Promise(function (resolve, reject) {
                self.model.find(conditions, projection, options).then(function (result) {
                    resolve(_.map(result, function (value) {
                        return _.pick(value, self.fields);
                    })).catch(reject);
                });
            });
        }

        self.model.find(conditions, projection, options, function (error, result) {
            if (error) {
                return callback(error);
            }

            callback(null, _.map(result, function (data) {
                return _.pick(data, self.fields);
            }));
        });
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

        const self = this;
        if (!callback) {
            return new Promise(function (resolve, reject) {
                self.model.findOne(conditions, projection, options).then(function (result) {
                    resolve(_.isEmpty(result) ? null : _.pick(result, self.fields));
                }).catch(reject);
            });
        }

        return self.model.findOne(conditions, projection, options, function (error, result) {
            if (error) {
                return callback(error);
            }

            callback(null, _.isEmpty(result) ? null : _.pick(result, self.fields));
        });
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
            conditions = {},
            default_options = {
                new: true,
                upsert: true
            },
            errors = self.validate(doc);
        if (!_.isEmpty(errors)) {
            return callback(errors);
        }

        _.forEach(self.key, function (value) {
            conditions[value] = doc[value];
        });

        return self.model.findOneAndUpdate(conditions, doc, _.merge(default_options, options), function (error, result) {
            if (error) {
                return callback(error);
            }

            callback(null, _.isEmpty(result) ? null : _.pick(result, self.fields));
        });
    }


    /**
     * Remove an item
     *
     * @param {Object} conditions
     * @param {Object} options
     * @param {Function} callback
     */
    remove(conditions, options, callback) {
        if (_.isFunction(options)) {
            callback = options;
            options = {};
        }

        const self = this;

        return self.model.findOneAndRemove(conditions, options, callback);
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
