/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/*jslint node: true */
'use strict';




// Variables
const _ = require('lodash'),
    validator = require('proteus-validator'),
    adapters = require('./adapter'),
    errors = require('./error');


/**
 * KarmiaDatabase
 *
 * @class
 */
class KarmiaDatabase {

    /**
     * Constructor
     *
     * @constructs KarmiaDatabase
     * @param      {string} type
     * @param      {Object} config
     */
    constructor(type, config) {
        const self = this;
        self.adapter = adapters[type](config);
        self.validator = config.validator || validator;
        self.error = errors;
        self.schemas = {};
    }


    /**
     * Get connection
     *
     * @returns {Object}
     */
    getConnection() {
        const self = this;

        return self.adapter.getConnection();
    }


    /**
     * Connect to database
     *
     * @param {Function} callback
     */
    connect(callback) {
        const self = this;

        if (!callback) {
            return self.adapter.connect();
        }

        self.adapter.connect(callback);
    }


    /**
     * Validate schema
     *
     * @param   {Object} schema
     * @param   {Function} callback
     * @returns {Array|undefined}
     */
    validateSchema(schema, callback) {
        const self = this;

        return self.validator.validateSchema(schema || {}, callback);
    }


    /**
     * Define schema
     *
     * @param   {string} table
     * @param   {Object} schema
     * @returns {KarmiaDatabaseAdapter}
     */
    define(table, schema) {
        const self = this;

        let definitions = {};
        if (_.isObject(table)) {
            definitions = table;
        } else {
            definitions[table] = schema;
        }

        Object.keys(definitions).forEach(function (name) {
            self.schemas[name] = self.schemas[name] || {};

            const schema = self.schemas[name];
            Object.keys(definitions[name]).forEach(function (key) {
                let value = definitions[name][key];
                if (key in ['key', 'index']) {
                    value = Array.isArray(value) ? value : [value];
                }

                if (Array.isArray(value)) {
                    schema[key] = (schema[key] || []).concat(value);
                } else if (_.isObject(value)) {
                    schema[key] = Object.assign(schema[key] || {}, value);
                } else {
                    schema[key] = value;
                }
            });
        });

        return self;
    }


    /**
     * Get table object
     *
     * @param   {string} name
     * @returns {Object}
     */
    table(name) {
        const self = this;

        return self.adapter.table(name);
    }


    /**
     * Get table suite object
     *
     * @param   {string} name
     * @returns {Object}
     */
    suite(name) {
        const self = this;

        return self.adapter.suite(name);
    }


    /**
     * Get sequence object
     *
     * @param   {string} key
     * @returns {KarmiaDatabaseSequence}
     */
    sequence(key) {
        const self = this;

        return self.adapter.sequence(key);
    }


    /**
     * Setup database
     *
     * @param {Function} callback
     */
    setup(callback) {
        const self = this;

        if (!callback) {
            return self.adapter.setup(self.schemas);
        }

        self.adapter.setup(self.schemas, callback);
    }

}


// Export module
module.exports = function (type, config) {
    if (_.isObject(type)) {
        config = type;
        type = config.type;
    }

    return new KarmiaDatabase(type, config);
};



/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * c-hanging-comment-ender-p: nil
 * End:
 */
