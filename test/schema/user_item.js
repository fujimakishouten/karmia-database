/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/*jslint node: true */
'use strict';



// Export module
module.exports = {
    type: 'object',
    key: ['user_id', 'item_id'],
    properties: {
        user_id: {
            type: 'string',
            required: true
        },
        item_id: {
            type: 'string',
            required: true
        },
        name: {
            type: 'string',
            default: ''
        }
    },
    index: [
        {fields: {user_id: 1, item_id: 1}, options: {unique: true}},
        'name'
    ]
};


/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * c-hanging-comment-ender-p: nil
 * End:
 */
