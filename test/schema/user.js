/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/*jslint node: true */
'use strict';



// Export module
module.exports = {
    type: 'object',
    key: ['user_id'],
    properties: {
        user_id: {
            type: 'varchar',
            required: true,
            unique: true
        },
        name: {
            type: 'varchar',
            default: ''
        },
        point: {
            type: 'int',
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
