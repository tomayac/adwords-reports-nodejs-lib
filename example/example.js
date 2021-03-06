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
  cid: '123-456-7890', // 👈 Change to a real customer ID
  awql: 'SELECT Criteria, Clicks FROM KEYWORDS_PERFORMANCE_REPORT DURING TODAY'
}, options)
.then(data => {
  console.log(data);
})
.catch(err => {
  console.error(err);
});
