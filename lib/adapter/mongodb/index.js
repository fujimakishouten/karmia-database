/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/*jslint node: true */
'use strict';




// Variables
const mongoose = require('mongoose'),
    converter = require('./converter'),
    table = require('./table'),
    sequence = require('./sequence'),
    suite = require('./suite');
mongoose.Promise = global.Promise;


/**
 * KarmiaDatabaseAdapter
 *
 * @class
 */
class KarmiaDatabaseAdapter {

    /**
     * constructor
     *
     * @construct KarmiaDatabaseAdapter
     * @param     {Object} config
     */
    constructor(config) {
        const self = this;
        self.connection = mongoose.createConnection();
        self.schemas = {};
        self.models = {};
        self.suites = {};
        self.host = config.host || 'localhost';
        self.port = config.port || 27017;
        self.database = config.database || config.keyspace || 'test';
        self.options = config.options || {};
        self.user = config.user;
        self.password = config.password;
    }


    /**
     * Get connection
     *
     * @returns {*}
     */
    getConnection() {
        const self = this;

        return self.connection;
    }


    /**
     * Connect to database
     *
     * @param {Function} callback
     */
    connect(callback) {
        const self = this,
            options = Object.assign({}, self.options);
        options.user = options.user || self.user;
        options.pass = options.pass || options.password || self.password;

        if (!callback) {
            return self.connection.open(self.host, self.database, self.port, options);
        }

        self.connection.open(self.host, self.database, self.port, options, callback);
    }


    /**
     * Get table object
     *
     * @param   {string} name
     * @returns {KarmiaDatabaseTable}
     */
    table(name) {
        const self = this;

        return self.models[name];
    }


    /**
     * Get table suite object
     *
     * @param   {string} name
     * @returns {KarmiaDatabaseSuite}
     */
    suite(name) {
        const self = this;
        self.suites[name] = self.suites[name] || suite(self, name);

        return self.suites[name];
    }


    /**
     * Get sequence object
     *
     * @param   {string} key
     * @returns {KarmiaDatabaseSequence}
     */
    sequence(key) {
        const self = this;

        return sequence(self, key);
    }


    /**
     * Configure tables
     *
     * @param {Object} definitions
     * @param {Function} callback
     */
    setup(definitions, callback) {
        const self = this;
        Object.keys(definitions).forEach(function (key) {
            const definition = definitions[key],
                value = converter.schema.convert(definition),
                validation = converter.validator.convert(definition);
            value.options = value.options || {};
            if (!Reflect.has(value.options, 'timestamps')) {
                value.options.timestamps = {
                    createdAt: 'created_at',
                    updatedAt: 'updated_at'
                };
            }

            const schema = new mongoose.Schema(value.properties, value.options);
            Object.keys(value.index || {}).forEach(function (key) {
                const index = value.index[key],
                    options = index.options || {index: true},
                    fields = index.fields || (Array.isArray(index) ? index : [index]).reduce(function (result, value) {
                            result[value] = 1;

                            return result;
                        }, {});
                schema.index(fields, index.options || {index: true});
            });

            if (value.ttl) {
                schema.index('updated_at', {index: true}, value.ttl);
            }

            self.schemas[key] = value;
            self.models[key] = table(self.connection, self.connection.model(key, schema), validation);
        });

        if (!callback) {
            return Promise.resolve();
        }

        callback();
    }
}



// Export module
module.exports = function (config) {
    return new KarmiaDatabaseAdapter(config);
};



/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * c-hanging-comment-ender-p: nil
 * End:
 */
