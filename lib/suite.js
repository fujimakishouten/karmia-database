/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/* eslint-env es6, mocha, node */
/* eslint-extends: eslint:recommended */
"use strict";



/**
 * KarmiaDatabaseTableSuite
 *
 * @class
 */
class KarmiaDatabaseTableSuite {
    /**
     * Constructor
     *
     * @param {Object} adapter
     * @param {string} name
     * @constructs KarmiaDatabaseTableSuite
     */
    constructor(adapter, name) {
        const self = this;
        self.adapter = adapter;
        self.name = name;
    }

    /**
     * Add table to table suite
     *
     * @param table_name
     * @returns {KarmiaDatabaseTableSuite}
     */
    add(table_name) {
        const self = this;
        self.tables = self.tables || [];
        self.tables.push(table_name);
        self.tables = Array.from(new Set(self.tables));

        return self;
    }

    /**
     * Create table suite
     *
     * @param   {*} id
     * @returns {Object}
     */
    create(id) {
        const self = this;

        return self.adapter.suite(self.name, self.tables, id);
    }
}


// Export module
module.exports = function (adapter, name) {
    return new KarmiaDatabaseTableSuite(adapter, name);
};



/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * c-hanging-comment-ender-p: nil
 * End:
 */
