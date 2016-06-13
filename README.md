# karmia-database
Database module of Karmia JavaScript library

## Installation

```Shell
npm install karmia-database
```

## Example

```JavaScript
const karmia_database = require('karmia-database'),
    database = karmia_database({
        type: 'mongodb',
        host: 'localhost',
        port: 27017,
        database: 'test_karmia_database'
    });
```

## Connect to database

```JavaScript
database.connect(callback);
```

## Define schema and models

```JavaScript
// Schema definition
const schema = {
    key: 'application_id',
    properties: {
        application_id: {
            type: 'string',
            required: true,
            unique: true
        },
        name: {
            type: 'string',
            required: true
        },
        api_key: {
            type: 'string',
            default: ''
        },
        api_secret: {
            type: 'string',
            default: ''
        }
    },
    index: [
        {fields: {api_key: 1, api_secret: 1}, options: {unique: true}}
    ]
};

// Define schema
database.define('application', schema);

// Define models
database.setup(callback);
```

## Validate schema

```JavaScript
// Synchronous call
const errors = database.validateSchema(schema);

// Asynchronous call
database.validateSchema(schema, function (errors) {
});
```

## Validate data

```JavaScript
const table = database.table('application'),
    data = {
        application_id: 'application_id',
        name: 'name',
        api_key: uuid.v4(),
        api_secret: crypto.randomBytes(32).toString('base64')
    };

// Synchronous call
table.validate(data);

// Asynchronous call
table.validate(data, function (errors) {
});
```

## Save data

```JavaScript
const crypto = require('crypto'),
    uuid = require('uuid'),
    table = database.table('application');
table.set({
    application_id: 'application_id',
    name: 'application_name',
    api_key: uuid.v4(),
    api_secret: crypto.randomBytes(32).toString('base64')
}, callback);
```

## Count data

```JavaScript
const table = database.table('application');
table.count(callback);
```

## Find data

### Find one data

```JavaScript
const table = database.table('application');
table.get({application_id: 'application_id'}, callback);
```

### Find data

```JavaScript
const table = database.table('application');
table.find({application_id: 'application_id'}, callback);
```

## Remove data

```JavaScript
const table = database.table('application');
table.remove({application_id: 'applicatin_id'});
```

## Sequence

```JavaScript
const sequence = database.sequence('key');
sequence.get(callback);
```
