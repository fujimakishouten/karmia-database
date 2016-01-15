/* vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4: */
/*jslint node: true */
'use strict';



// Export module
module.exports = function (schema, options) {
    schema.add({created_at: Date});
    schema.add({updated_at: Date});

    schema.pre('save', function (model) {
        const now = new Date();
        model.created_at = model.created_at || now;
        model.updated_at = now;
    });

    if (options && options.index) {
        schema.index('created_at');
        schema.index('updated_at');
    }
};



/*
 * Local variables:
 * tab-width: 4
 * c-basic-offset: 4
 * c-hanging-comment-ender-p: nil
 * End:
 */
