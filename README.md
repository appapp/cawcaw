# cawcaw

cawcaw ( aka ChaffingAndWinnowing,ChaffingAndWinnowing ) core system

## Getting Started
Install the module with: `npm install cawcaw`

```javascript
var cawcaw = require( "cawcaw" );
var dataFactory = new cawcaw.model.data.Factory();

var     txt0 = "foo bar ...";
var message0 = dataFactory.createMessage( txt0 );
    message0.private.settings.k = "mypassword";
    message0.private.settings.seed = "myseedvalue";
    message0 = cawcaw.data.caw.createPacketsFromMessage( message0 );
var message1 = cawcaw.data.caw.createMessageFromPackets( message0 );
var     txt1 = message1.private.message;

console.log( txt0 );
console.log( txt1 );
```

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Release History
_(Nothing yet)_

## License
Copyright 2013 (c) Alfonso Polo Prieto. Licensed under the Apache-2.0 license.
