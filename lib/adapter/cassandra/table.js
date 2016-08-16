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

        return validator.validate(self.schema, data || {}, callback);
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

        if (!callback) {
            return new Promise(function (resolve, reject) {
                self.connection.execute(query, parameters, consistency, function (error, result) {
                    if (error) {
                        return reject(error);
                    }

                    resolve(Number(result.rows[0].count.toString()));
                });
            });
        }

        self.connection.execute(query, parameters, consistency, function (error, result) {
            if (error) {
                return callback(error);
            }

            callback(null, Number(result.rows[0].count.toString()));
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
        const self = this;
        args = args || {};
        options = options || {};
        if (_.isFunction(args)) {
            callback = args;
            args = options = {};
        } else if (_.isFunction(options)) {
            callback = options;
            options = {};
        }

        // Return promise if callback function is not defined
        if (!callback) {
            return new Promise(function (resolve, reject) {
                self.model.find(args, options, function (error, result) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result.toString());
                    }
                });
            });
        }

        // Callback
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
        const self = this;
        options = options || {};
        if (_.isFunction(args)) {
            callback = args;
            args = options = {};
        } else if (_.isFunction(options)) {
            callback = options;
            options = {};
        }

        options.limit = options.limit || 1;

        // Return promise if callback function is not defined
        if (!callback) {
            return new Promise(function (resolve, reject) {
                self.find(args, options).then(function (result) {
                    resolve(result[0] || null);
                }).catch(reject);
            });
        }

        // Callback
        self.find(args, options, function (error, result) {
            if (error) {
                return callback(error);
            }

            callback(null, result[0] || null);
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
            object = _.pick(data, self.fields),
            model = new self.model(object),
            errors = self.validate(object);
        if (!_.isEmpty(errors)) {
            return (callback) ? callback(errors) : Promise.reject(errors);
        }

        if (self.ttl) {
            options.ttl = options.ttl || self.ttl;
        }

        // Return promise if callback function is not defined
        if (!callback) {
            return new Promise(function (resolve, reject) {
                model.save(options, function (error, result) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                });
            });
        }

        // Callback
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

        // Return promise if callback function is not defined
        if (!callback) {
            return new Promise(function (resolve, reject) {
                model.remove(options, function (error, result) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                });
            });
        }

        // Callback
        model.remove(options, callback);
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
