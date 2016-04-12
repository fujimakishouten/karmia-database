/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/*jslint node: true */
'use strict';



// Variables
const util = require('util'),
    _ = require('lodash'),
    cassie = require('cassie-odm'),
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

        return validator.validate(self.schema, data, callback);
    }


    /**
     * Count data
     *
     * @param args
     * @param callback
     */
    count(args, callback) {
        if (_.isFunction(args)) {
            callback = args;
            args = {};
        }

        const self = this,
            consistency = cassie.consistencies.quorum,
            parameters = _.values(args);
        let query = util.format('SELECT COUNT(*) FROM %s', self.model._tableName);
        if (!_.isEmpty(args)) {
            query = util.format('%s WHERE %s = ?', query, _.keys(args).join(' = ? AND '));
        }

        self.connection.execute(query, parameters, consistency, function (error, result) {
            if (error) {
                return callback(error);
            }

            const raw = _.first(result.rows);

            callback(null, Number(raw.count.toString()));
        });
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
