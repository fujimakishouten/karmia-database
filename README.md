# karmia-database
Database module of Karmia JavaScript library

## Installation

```Shell
npm install karmia-database
```

## Example

### Configure

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
database.define('application', {
    key: 'application_id',
    schema: {
        application_id: {
            type: 'varchar',
            required: true,
            unique: true
        },
        name: {
            type: 'varchar',
            required: true
        },
        api_key: {
            type: 'varchar',
            default: ''
        },
        api_secret: {
            type: 'varchar',
            default: ''
        }
    },
    indexes: [
        {fields: {api_key: 1, api_secret: 1}, options: {unique: true}}
    ]
});

// Defining models
database.setup(callback);
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
