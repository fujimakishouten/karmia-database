/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/*jslint node: true */
'use strict';



// Export module
module.exports = {
    key: ['user_id', 'item_id'],
    schema: {
        user_id: {
            type: 'varchar',
            required: true
        },
        item_id: {
            type: 'varchar',
            required: true
        },
        name: {
            type: 'varchar',
            default: ''
        }
    },
    indexes: [
        {fields: {user_id: 1, item_id: 1}, options: {unique: true}}
    ]
};


/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * c-hanging-comment-ender-p: nil
 * End:
 */
