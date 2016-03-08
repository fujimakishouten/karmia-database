/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/*jslint node: true */
'use strict';



// Variables
const util = require('util'),
    _ = require('lodash');


/**
 * KarmiaDatabaseSuite
 *
 * @class
 */
class KarmiaDatabaseSuite {

    /**
     * constructor
     *
     * @construct KarmiaDatabaseSuite
     * @param     {KarmiaDatabaseAdapter} adapter
     * @param     {string} name
     */
    constructor(adapter, name) {
        const self = this;
        self.adapter = adapter;
        self.connection = self.adapter.getConnection();
        self.name = name;
        self.tables = {};
    }


    /**
     * Add table to table suite
     *
     * @param   {string} table_name
     * @returns {KarmiaDatabaseSuite}
     */
    add(table_name) {
        const self = this;
        self.tables[table_name] = self.adapter.table(table_name);

        return self;
    }


    /**
     * Create object
     *
     * @param   {string} id
     * @returns {Object}
     */
    create(id) {
        const self = this,
            object = {},
            id_name = util.format('%s_id', _.snakeCase(self.name)),
            regexp = new RegExp(util.format('^%s', _.camelCase(self.name)));
        object[id_name] = id;
        object.getId = function () {
            return object[id_name];
        };
        _.forEach(self.tables, function (value, key) {
            const name = key.replace(regexp, '');
            object[_.camelCase(util.format('get_%s', name))] = self.getter(value, id);
            object[_.camelCase(util.format('set_%s', name))] = self.setter(value, id);
            object[_.camelCase(util.format('delete_%s', name))] = self.deleter(value, id);
        });

        return object;
    }


    /**
     * Get getter function
     *
     * @param   {KarmiaDatabaseTable} table
     * @param   {string} id
     * @returns {Function}
     */
    getter(table, id) {
        const self = this;

        return function (callback) {
            const parameters = {},
                args = _.dropRight(arguments);
            callback = _.last(arguments);
            parameters[util.format('%s_id', _.snakeCase(self.name))] = id;
            _.forEach(table.key.slice(1), function (value, key) {
                if (args[key]) {
                    parameters[value] = {$in: _.isArray(args[key]) ? args[key] : [args[key]]};
                }
            });

            if (_.chain(table.key).size().gt(1).value()) {
                return table.find(parameters, callback);
            } else {
                return table.get(parameters, callback);
            }
        };
    }


    /**
     * Get setter function
     *
     * @param   {KarmiaDatabaseTable} table
     * @param   {string} id
     * @returns {Function}
     */
    setter(table, id) {
        const self = this;

        return function (data, callback) {
            const parameters = {};
            parameters[util.format('%s_id', _.snakeCase(self.name))] = id;

            return table.set(_.merge(parameters, data), callback);
        };
    }


    /**
     * Get deleter function
     *
     * @param   {KarmiaDatabaseTable} table
     * @param   {string} id
     * @returns {Function}
     */
    deleter(table, id) {
        const self = this;

        return function (callback) {
            const parameters = {},
                args = _.dropRight(arguments);
            callback = _.last(arguments);
            parameters[util.format('%s_id', _.snakeCase(self.name))] = id;
            _.forEach(table.key.slice(1), function (value, key) {
                parameters[value] = {$in: _.isArray(args[key]) ? args[key] : [args[key]]};
            });

            return table.delete(parameters, callback);
        };
    }
}


// Export module
module.exports = function (adapter, name) {
    return new KarmiaDatabaseSuite(adapter, name);
};



/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * c-hanging-comment-ender-p: nil
 * End:
 */
