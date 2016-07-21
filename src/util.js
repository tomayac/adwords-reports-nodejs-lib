/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var appRoot = require('app-root-path');
var fs = require('fs');

var util = {
  checkDotEnvFile: function() {
    // Check that the .env file exists at all
    var dotEnvSample = fs.readFileSync(__dirname + '/../dot_env');
    try {
      fs.accessSync(appRoot + '/.env', fs.F_OK);
    } catch (e) {
      console.log('Please create an environment file called ".env" in the ' +
          'app\'s root folder\n' + appRoot + '\n' +
          'You can rename and edit the provided sample file "dot_env",\n' +
          'or create a file yourself with the following structure:\n\n' +
          dotEnvSample);
      process.exit();
    }
    // Check that the now proved-to-exist .env file has the right fields
    var dotEnv = fs.readFileSync(appRoot + '/.env');
    if ((/^CLIENT_ID=.+?$/gm.test(dotEnv)) &&
        (/^CLIENT_SECRET=.+?$/gm.test(dotEnv)) &&
        (/^DEVELOPER_TOKEN=.+?$/gm.test(dotEnv)) &&
        (/^ENCRYPTION_PASSWORD=.+?$/gm.test(dotEnv))) {
      return true;
    } else {
      console.log('The ".env" file must have the following structure:\n\n' +
          dotEnvSample);
      process.exit();
    }
  }
};

module.exports = util;
