## AdWords Reports Node.js Library

The project ```adwords-reports-nodejs-lib``` provides a simple AdWords reporting
library for pulling ad hoc [reports](https://developers.google.com/adwords/api/docs/guides/reporting)
described in the AdWords Query Lanaguage
([AWQL](https://developers.google.com/adwords/api/docs/guides/awql#adhoc-reports))
directly from the [AdWords API](https://developers.google.com/adwords/api/docs/guides/start).

# Installation

If you haven't already, first, install [Node.js](https://nodejs.org/en/) for your
platform of choice (macOS, Windows, UNIX-like). For UNIX-like systems, the easiest
may be to install the Node Version Manager ([nvm](https://github.com/creationix/nvm#install-script)),
and then have nvm install Node.js via ```nvm install node```.

With Node.js comes the Node Package Manager ([npm](https://www.npmjs.com/)).
You can install the ```adwords-reports-nodejs-lib``` library with the npm command below.

```bash
>$ npm install --save adwords-reports-nodejs-lib
```

# Requirements

In order to use the library, you need to [sign up](https://developers.google.com/adwords/api/docs/guides/signup)
for the AdWords API in order to get a Developer Token and then
[create a project](https://developers.google.com/adwords/api/docs/guides/first-api-call#set_up_oauth2_authentication)
in the Developer Console. This step provides you with a Client ID and a Client Secret
that will be needed during the next steps described in the following.

# Usage

The library is [Promise](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise)-based
and can be used as outlined in the sample below.
Upon the first run, the library will guide you through the necessary
[OAuth](https://developers.google.com/adwords/api/docs/guides/authentication) authentication steps,
this is a one-time process, the library automatically takes care of refreshing expired authentication tokens.

```javascript
var adwords = require('adwords-reports-nodejs-lib');
adwords.getReport({
  // Change to a real Customer ID.
  cid: '123-456-789',
  // Change AWQL query according to the grammar published at
  // https://developers.google.com/adwords/api/docs/guides/awql.
  //
  // Check https://developers.google.com/adwords/api/docs/appendix/reports/all-reports
  // for the available report types and fields.
  awql: 'SELECT Criteria FROM KEYWORDS_PERFORMANCE_REPORT DURING LAST_WEEK'
}).then(function(data) {
  console.log(data);
}).catch(function(err) {
  throw(err);
});
```

# License

Copyright 2016 Thomas Steiner (@tomayac, tomac@google.com)

Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
either express or implied. See the License for the specific language governing permissions
and limitations under the License.
