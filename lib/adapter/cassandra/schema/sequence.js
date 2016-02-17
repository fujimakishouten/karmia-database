/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/*jslint node: true */
'use strict';



// Variables
const cassie = require('cassie-odm');


// Export module
module.exports = {
    key: {
        type: String,
        primary: true
    },
    value: {
        type: Number,
        default: 0
    }
};



/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * c-hanging-comment-ender-p: nil
 * End:
 */
