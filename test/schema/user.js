/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/*jslint node: true */
'use strict';



// Export module
module.exports = {
    key: ['user_id'],
    schema: {
        user_id: {
            type: String,
            required: true,
            unique: true
        },
        name: {
            type: String,
            default: ''
        },
        point: {
            type: Number,
            default: 0
        }
    }
};


/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * c-hanging-comment-ender-p: nil
 * End:
 */
