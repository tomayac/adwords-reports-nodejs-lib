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

var querystring = require('querystring');
var https = require('https');
var Url = require('url');

var OAuth = require('./google_oauth2.js');

var REPORT_DOWNLOAD_URL =
    'https://adwords.google.com/api/adwords/reportdownload/v201609';

// Retrieves a report covering fromDate to toDate for a given customerId
function getReport(params) {
  return new Promise(function(resolve, reject) {
    var customerId = params.cid;
    var awql = params.awql;
    var format = 'TSV';

    // get OAuth access token
    OAuth.authorize(function(err, accessToken) {
      if (err) {
        return reject(err);
      }
      var postData = querystring.stringify({
        '__rdquery': awql,
        '__fmt': format
      });
      REPORT_DOWNLOAD_URL = Url.parse(REPORT_DOWNLOAD_URL);
      var postOptions = {
        host: REPORT_DOWNLOAD_URL.host,
        path: REPORT_DOWNLOAD_URL.pathname,
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + accessToken,
          'clientCustomerId': customerId,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Please send me gzip',
          'Accept-Encoding': 'gzip',
          'Content-Length': Buffer.byteLength(postData)
        }
      };
      var request = https.request(postOptions, function(res) {
        res.setEncoding('utf8');
        var data = '';
        res.on('data', function(chunk) {
          data += chunk;
        });
        res.on('end', function() {
          return resolve(data);
        });
      });
      request.write(postData);
      request.end();
    });
  });
}

module.exports = {
  getReport: getReport
};
