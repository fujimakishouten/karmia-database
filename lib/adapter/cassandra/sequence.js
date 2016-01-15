/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/*jslint node: true */
'use strict';



// Variables
const async = require('neo-async'),
    cassie = require('cassie-odm'),
    definition = require('./schema/sequence');


/**
 * KarmiaDatabaseSequence
 *
 * @class
 */
class KarmiaDatabaseSequence {

    /**
     * constructor
     *
     * @construct KarmiaDatabaseTable
     * @param     {KarmiaDatabaseAdapter} adapter
     * @param     {string} key
     */
    constructor(adapter, key) {
        const self = this;
        self.adapter = adapter;
        self.connection = self.adapter.getConnection();
        self.key = key;
        try {
            self.model = cassie.model('sequence');
        } catch (e) {
            const schema = new cassie.Schema(definition);
            schema.addQuery({sequence: self.sequenceQuery()});
            self.model = cassie.model('sequence', schema);
        }
    }


    /**
     * Get seqeunce number
     * This method is not atmic
     *
     * @param {Function} callback
     */
    get(callback) {
        const self = this;
        cassie.syncTables(self.adapter.config, {}, function (error) {
            if (error) {
                callback(error);
            } else {
                self.model.sequence(callback);
            }
        });
    }


    /**
     * Return sequence query function
     *
     * @returns {Function}
     */
    sequenceQuery() {
        const self = this;
        return function (callback) {
            async.waterfall([
                // Get current sequence
                function (done) {
                    self.model.findOne({key: self.key}, done);
                },

                // Update sequence
                function (result, done) {
                    const value = (result) ? Number(result.value.toString()) : 0,
                        query = 'UPDATE sequences SET value = value + 1 WHERE key = ?',
                        parameters = [self.key],
                        consistency = cassie.consistencies.quorum;
                    self.connection.execute(query, parameters, consistency, function (error) {
                        if (error) {
                            done(error);
                        } else {
                            done(null, value + 1);
                        }
                    });
                }
            ], callback);
        };
    }

}



// Export module
module.exports = function (adapter, key) {
    return new KarmiaDatabaseSequence(adapter, key);
};



/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * c-hanging-comment-ender-p: nil
 * End:
 */
