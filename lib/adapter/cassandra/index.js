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
        self.config = _.merge({}, self.options);
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
        _.forEach(definitions, function (value, key) {
            value = converter.schema.convert(value);

            const schema = new cassie.Schema(value.properties, {primary: value.key});
            schema.plugin(timestamp_plugin, {index: true});
            _.forEach(value.indexes, function (index) {
                schema.index(index);
            });

            self.schemas[key] = value;
            self.models[key] = table(cassie.model(key, schema), value);
        });

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
