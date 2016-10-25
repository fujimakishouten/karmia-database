/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/* eslint-env es6, mocha, node */
/* eslint-extends: eslint:recommended */
"use strict";



/**
 * KarmiaDatabaseSequence
 *
 * @class
 */
class KarmiaDatabaseSequence {
    /**
     * Constructor
     *
     * @param {Object} adapter
     * @param {string} key
     * @param {Object} options
     * @constructs KarmiaDatabaseSequence
     */
    constructor(adapter, key, options) {
        const self = this;
        self.adapter = adapter;
        self.key = key;
        self.config = options || {};

        self.sequence = self.adapter.sequence(self.key, self.config);
    }

    /**
     * Get sequence value
     *
     * @param {Object} options
     * @param {Function} callback
     */
    get(options, callback) {
        if (options instanceof Function) {
            callback = options;
            options = {};
        }

        const self = this;

        return self.sequence.get(options, callback);
    }
}


// Export module
module.exports = function (adapter, key, options) {
    return new KarmiaDatabaseSequence(adapter, key, options || {});
};



/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * c-hanging-comment-ender-p: nil
 * End:
 */
