/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/*jslint node: true */
'use strict';




// Variables
const _ = require('lodash'),
    cassie = require('cassie-odm'),
    converter = require('./converter'),
    table = require('./table'),
    sequence = require('./sequence'),
    suite = require('./suite'),
    timestamp_plugin = require('./plugins/timestamp');


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
        self.schemas = {};
        self.models = {};
        self.suites = {};
        self.hosts = config.hosts || ['localhost:9042'];
        self.keyspace = config.keyspace || 'test';
        self.options = config.options || {};
        self.config = Object.assign({}, self.options);
        self.config.hosts = self.hosts;
        self.config.keyspace = self.keyspace;
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
        const self = this;
        self.connection = cassie.connect(self.config);

        if (!callback) {
            return Promise.resolve();
        }

        callback();
    }


    /**
     * Get table object
     *
     * @param   {string} name
     * @returns {Object}
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
                validation = converter.validator.convert(definition),
                schema = new cassie.Schema(value.properties, {primary: value.key});
            schema.plugin(timestamp_plugin, {index: true});
            Object.keys(value.index || {}).forEach(function (key) {
                const index = value.index[key],
                    fields = index.fields || (Array.isArray(index) ? index : [index]).reduce(function (result, value) {
                            result[value] = 1;

                            return result;
                        }, {});
                schema.index(Object.keys(fields));
            });

            self.schemas[key] = value;
            self.models[key] = table(self.connection, cassie.model(key, schema), validation);
        });

        if (!callback) {
            return new Promise(function (resolve, reject) {
                cassie.syncTables(self.config, {}, function (error) {
                    if (error) {
                        return reject(error);
                    }

                    resolve();
                });
            });
        }

        cassie.syncTables(self.config, {}, callback);
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
