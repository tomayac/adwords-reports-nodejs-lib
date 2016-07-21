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

var util = require('./util.js');
util.checkDotEnvFile();

var appRoot = require('app-root-path');
var request = require('request');
var fs = require('fs');
var crypto = require('crypto');
var readline = require('readline');
require('node-env-file')(appRoot + '/.env');

var DEBUG = false;

// From the API console
var CLIENT_ID = process.env.CLIENT_ID;
// From the API console
var CLIENT_SECRET = process.env.CLIENT_SECRET;
// 1st in the OAuth dance
var AUTHORIZATION_CODE = null;
// 2nd in the OAuth dance
var ACCESS_TOKEN = null;
// 3rd and repeated in the OAuth dance
var REFRESH_TOKEN = null;
// The token type, defaults to "Bearer"
var TOKEN_TYPE = null;
// The current access token's or refresh token's expiry timestamp
var TOKEN_EXPIRY = null;

// Needed to store the OAuth token
var ENCRYPTION_PASSWORD = process.env.ENCRYPTION_PASSWORD;

var OAuth = {
  // 1st in the OAuth dance
  getAuthorizationCode: function(opt_callback) {
    if (DEBUG) { console.log('Getting authorization code.'); }
    var options = {
      qs: {
        response_type: 'code',
        client_id: CLIENT_ID,
        redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
        scope: 'https://www.googleapis.com/auth/adwords',
        state: 'getAuthorizationCode',
        access_type: 'offline'
      },
      url: 'https://accounts.google.com/o/oauth2/auth'
    };
    request.get(options, function(err, response) {
      console.log(err)
      console.log(response.statusCode)
      if (!err && response.statusCode === 200) {
        console.log('Visit the following URL in your browser:\n' +
            response.request.uri.href);
        var rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        rl.question('', function(authCode) {
          if (!authCode) {
            return opt_callback &&
                opt_callback('OAuth error. Enter the authorization code.');
          }
          rl.close();
          AUTHORIZATION_CODE = authCode;
          return opt_callback && opt_callback(null);
        });
        console.log('Enter the authorization code: ');
      } else {
        return opt_callback && opt_callback('OAuth error. Could not retrieve ' +
            'authorization code. Check your Client ID and Client secret.');
      }
    });
  },
  // 2nd in the OAuth dance
  getAccessToken: function(opt_callback) {
    if (DEBUG) { console.log('Getting access token.'); }
    if (!AUTHORIZATION_CODE || !CLIENT_ID || !CLIENT_SECRET) {
      return opt_callback &&
          opt_callback('OAuth error. Application not authorized.');
    }
    var options = {
      form: {
        code: AUTHORIZATION_CODE,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: 'urn:ietf:wg:oauth:2.0:oob'
      },
      json: true,
      url: 'https://accounts.google.com/o/oauth2/token'
    };
    request.post(options, function(err, response, body) {
      if (!err && response.statusCode === 200) {
        if (body.access_token && body.refresh_token) {
          ACCESS_TOKEN = body.access_token;
          REFRESH_TOKEN = body.refresh_token;
          TOKEN_TYPE = body.token_type;
          TOKEN_EXPIRY = Date.now() + body.expires_in * 1000;
          if (DEBUG) {
            console.log('Token valid until ' + new Date(TOKEN_EXPIRY) + '.');
          }
          var oAuthData = {
            ACCESS_TOKEN: ACCESS_TOKEN,
            REFRESH_TOKEN: REFRESH_TOKEN,
            TOKEN_EXPIRY: TOKEN_EXPIRY,
            TOKEN_TYPE: TOKEN_TYPE
          };
          OAuth._storeOAuthCredentials(oAuthData, opt_callback);
          return opt_callback && opt_callback(null, ACCESS_TOKEN);
        } else {
          return opt_callback &&
              opt_callback('OAuth error. Could not parse access token.');
        }
      } else {
        return opt_callback &&
            opt_callback('OAuth error. Could not retrieve access token.');
      }
    });
  },
  // 3rd and repeated in the OAuth dance
  getRefreshToken: function(opt_callback) {
    if (DEBUG) { console.log('Refreshing OAuth token.'); }
    if (!REFRESH_TOKEN) {
      OAuth._retrieveOAuthCredentials(opt_callback);
    }
    if (!REFRESH_TOKEN) {
      return opt_callback &&
          opt_callback('No refresh token set.');
    }
    var now = Date.now();
    if (now < TOKEN_EXPIRY) {
      if (DEBUG) {
        console.log('Access token still valid until ' + new Date(TOKEN_EXPIRY) +
            '.');
      }
      return opt_callback && opt_callback(null, ACCESS_TOKEN);
    }
    var options = {
      form: {
        refresh_token: REFRESH_TOKEN,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'refresh_token'
      },
      json: true,
      url: 'https://accounts.google.com/o/oauth2/token'
    };
    request.post(options, function(err, response, body) {
      if (!err && response.statusCode === 200) {
        if (body.access_token) {
          ACCESS_TOKEN = body.access_token;
          TOKEN_TYPE = body.token_type;
          TOKEN_EXPIRY = Date.now() + (body.expires_in * 1000);
          if (DEBUG) {
            console.log('Refresh token valid until ' + new Date(TOKEN_EXPIRY) +
                '.');
          }
          var oAuthData = {
            ACCESS_TOKEN: ACCESS_TOKEN,
            REFRESH_TOKEN: REFRESH_TOKEN,
            TOKEN_EXPIRY: TOKEN_EXPIRY,
            TOKEN_TYPE: TOKEN_TYPE
          };
          OAuth._storeOAuthCredentials(oAuthData, opt_callback);
          return opt_callback && opt_callback(null, ACCESS_TOKEN);
        } else {
          return opt_callback &&
              opt_callback('OAuth error. Could not parse refresh token.');
        }
      } else {
        return opt_callback &&
            opt_callback('OAuth error. Could not retrieve refresh token.');
      }
    });
  },
  // Last in the OAuth dance
  revokeToken: function(opt_callback) {
    if (DEBUG) { console.log('Revoking OAuth tokens.'); }
    if (!REFRESH_TOKEN || !ACCESS_TOKEN) {
      return opt_callback &&
          opt_callback('OAuth error. No revokable token found.');
    }
    var options = {
      qs: {
        token: REFRESH_TOKEN || ACCESS_TOKEN
      },
      url: 'https://accounts.google.com/o/oauth2/revoke'
    };
    request.get(options, function(err, response) {
      if (!err && response.statusCode === 200) {
        console.log('Revoked tokens.');
        ACCESS_TOKEN = null;
        REFRESH_TOKEN = null;

        var oAuthData = {
          ACCESS_TOKEN: null,
          REFRESH_TOKEN: null,
          TOKEN_EXPIRY: null,
          TOKEN_TYPE: null
        };
        OAuth._storeOAuthCredentials(oAuthData, opt_callback);
        return opt_callback && opt_callback(null);
      } else {
        return opt_callback &&
            opt_callback('OAuth error. Could not revoke tokens.');
      }
    });
  },
  // Main function to authorize API requests
  authorize: function(callback) {
    var now = Date.now();
    if (ACCESS_TOKEN && now < TOKEN_EXPIRY) {
      if (DEBUG) {
        console.log('Authorizing, access token still valid (from memory).');
      }
      return callback(null, ACCESS_TOKEN);
    }
    OAuth._retrieveOAuthCredentials(callback);
    if (ACCESS_TOKEN && now < TOKEN_EXPIRY) {
      if (DEBUG) {
        console.log('Authorizing, access token still valid (from disk).');
      }
      return callback(null, ACCESS_TOKEN);
    } else if (REFRESH_TOKEN) {
      if (DEBUG) {
        console.log('Authorizing, access token expired (from disk), ' +
            'refreshing token.');
      }
      return OAuth.getRefreshToken(callback);
    } else {
      console.log('Authorizing, application not yet authorized.');
      return OAuth.getAuthorizationCode(function(err) {
        if (err) {
          return callback(err);
        }
        return OAuth.getAccessToken(callback);
      });
    }
  },
  // Helper function to persistently store OAuth data
  _storeOAuthCredentials: function(oAuthData, opt_callback) {
    if (DEBUG) { console.log('Storing OAuth credentials.'); }
    var cipher = crypto.createCipher('aes256', ENCRYPTION_PASSWORD);
    var text = JSON.stringify(oAuthData);
    var encrypted = cipher.update(text, 'utf8', 'hex') +
        cipher.final('hex');
    try {
      fs.writeFileSync(appRoot + '/.oauth', encrypted, {encoding: 'utf8'});
    } catch (e) {
      return opt_callback &&
          opt_callback('OAuth error. Could not store OAuth credentials. ' + e);
    }
  },
  // Helper function to retrieve persistently stored OAuth data
  _retrieveOAuthCredentials: function(opt_callback) {
    if (DEBUG) { console.log('Retrieving OAuth credentials.'); }
    var decipher = crypto.createDecipher('aes256', ENCRYPTION_PASSWORD);
    try {
      fs.accessSync(appRoot + '/.oauth', fs.F_OK);
      var encrypted = fs.readFileSync(appRoot + '/.oauth',
          {encoding: 'utf8'});
      var decrypted = decipher.update(encrypted, 'hex', 'utf8') +
          decipher.final('utf8');
      var oAuthData = JSON.parse(decrypted);
      REFRESH_TOKEN = oAuthData.REFRESH_TOKEN;
      ACCESS_TOKEN = oAuthData.ACCESS_TOKEN;
      TOKEN_EXPIRY = oAuthData.TOKEN_EXPIRY;
      TOKEN_TYPE = oAuthData.TOKEN_TYPE;
    } catch (e) {
      return opt_callback &&
          opt_callback('OAuth error. Could not read OAuth credentials. ' + e);
    }
  }
};

module.exports = {
  authorize: OAuth.authorize,
  revoke: OAuth.revokeToken
};
