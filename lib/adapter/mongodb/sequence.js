/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/*jslint node: true */
'use strict';



// Variables
const mongoose = require('mongoose'),
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
            self.model = self.connection.model('_sequence');
        } catch (e) {
            self.model = self.connection.model('_sequence', new mongoose.Schema(definition));
        }
    }


    /**
     * Get seqeunce number
     *
     * @param {Function} callback
     */
    get(callback) {
        const self = this,
            update = {$inc: {value: 1}},
            options = {new: true, upsert: true};
        self.model.findOneAndUpdate({key: self.key}, update, options, function (error, result) {
            if (error) {
                callback(error);
            } else {
                callback(null, result.value);
            }
        });
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
