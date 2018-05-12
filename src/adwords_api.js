/**
 * Copyright 2017 Google Inc. All Rights Reserved.
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

var request = require('request');

var OAuth = require('./google_oauth2.js');

var REPORT_DOWNLOAD_URL =
    'https://adwords.google.com/api/adwords/reportdownload/v201802';

// Retrieves a report covering fromDate to toDate for a given customerId
function getReport(params, options) {
  if (!options) {
    options = {};
  }
  return new Promise(function(resolve, reject) {
    var customerId = params.cid;
    var awql = params.awql;
    var format = options.format || 'TSV';

    // get OAuth access token
    OAuth.authorize(function(err, accessToken) {
      if (err) {
        return reject(err);
      }
      var postOptions = {
        url: REPORT_DOWNLOAD_URL,
        method: 'POST',
        gzip: true,
        headers: {
          'Authorization': 'Bearer ' + accessToken,
          'clientCustomerId': customerId,
          'User-Agent': 'adwords-reports-nodejs-lib (gzip)',
          'Accept-Encoding': 'gzip'
        },
        form: {
          '__rdquery': awql,
          '__fmt': format
        }
      };
      if (typeof options.skipReportHeader !== 'undefined') {
        postOptions.headers.skipReportHeader = options.skipReportHeader;
      }
      if (typeof options.skipColumnHeader !== 'undefined') {
        postOptions.headers.skipColumnHeader = options.skipColumnHeader;
      }
      if (typeof options.skipReportSummary !== 'undefined') {
        postOptions.headers.skipReportSummary = options.skipReportSummary;
      }
      if (typeof options.useRawEnumValues !== 'undefined') {
        postOptions.headers.useRawEnumValues = options.useRawEnumValues;
      }
      if (typeof options.includeZeroImpressions !== 'undefined') {
        postOptions.headers.includeZeroImpressions =
            options.includeZeroImpressions;
      }
      request.post(postOptions, function(err, response, body) {
        if (err || response.statusCode !== 200) {
          return reject(err || 'Error, status code ' + response.statusCode);
        }
        return resolve(body);
      });
    });
  });
}

module.exports = {
  getReport: getReport
};
