## AdWords Reports Node.js Library

The project ```adwords-reports-nodejs-lib``` provides a simple AdWords reporting
library for pulling ad hoc [reports](https://developers.google.com/adwords/api/docs/guides/reporting)
described in the AdWords Query Lanaguage
([AWQL](https://developers.google.com/adwords/api/docs/guides/awql#adhoc-reports))
directly from the [AdWords API](https://developers.google.com/adwords/api/docs/guides/start).

# Installation

If you haven’t already, first, install [Node.js](https://nodejs.org/en/) for your
platform of choice (macOS, Windows, UNIX-like). For macOS and Windows,
just use the particular downloadable installers,
for UNIX-like systems, the easiest may be to install the Node Version Manager
([nvm](https://github.com/creationix/nvm#install-script)),
and then have nvm install Node.js via ```nvm install node```.

With Node.js comes the Node Package Manager ([npm](https://www.npmjs.com/))
that serves for managing projects and their dependencies.
In an empty folder, initialize a new project via ```npm init``` and follow npm’s initialization wizard.
You can then install the ```adwords-reports-nodejs-lib``` library as a new dependency
of your freshly created project with the npm command below.

```bash
>$ npm install --save adwords-reports-nodejs-lib
```

# Requirements

In order to use the library you will need:

- **AdWords API Developer Token:** This token can be obtained by
[signing up for access](https://developers.google.com/adwords/api/docs/guides/signup).
- **Client ID and Client Secret:**
[Create a project](https://developers.google.com/adwords/api/docs/guides/first-api-call#set_up_oauth2_authentication)
in the Developer Console to obtain these.

During first use, you will be prompted to create a hidden ```.env``` file into
which these three required values should be placed,
as well as a custom password that serves for encrypting your authentication details.

# Usage

Upon the first run, the library will guide you through the necessary
[OAuth](https://developers.google.com/adwords/api/docs/guides/authentication)
authentication steps. This is a one-time process,
the library automatically takes care of refreshing expired authentication tokens.
The library is [Promise](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise)-based
and can be used as outlined in the example below.

```javascript
const adwords = require('../index.js');

const options = {
  format: 'TSV',
  skipReportHeader: true,
  skipColumnHeader: true,
  skipReportSummary: true,
  useRawEnumValues: true,
  includeZeroImpressions: true
};
adwords.getReport({
  cid: '508-120-4568',
  awql: 'SELECT Criteria, Clicks FROM KEYWORDS_PERFORMANCE_REPORT DURING TODAY'
}, options)
.then(data => {
  console.log(data);
})
.catch(err => {
  console.error(err);
});
```

# License

Copyright 2017 Thomas Steiner (@tomayac, tomac@google.com)

Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
either express or implied. See the License for the specific language governing permissions
and limitations under the License.
