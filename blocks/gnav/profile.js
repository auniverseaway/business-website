<!--#include virtual="profile.ssi" -->
/*! adobe-profile - v1.1.15 - 05-10-2021, 3:00:40 AM

ADOBE CONFIDENTIAL
==================
Copyright 2018 Adobe Systems Incorporated
All Rights Reserved.

NOTICE: All information contained herein is, and remains
the property of Adobe Systems Incorporated and its suppliers,
if any. The intellectual and technical concepts contained
herein are proprietary to Adobe Systems Incorporated and its
suppliers and are protected by trade secret or copyright law.
Dissemination of this information or reproduction of this material
is strictly forbidden unless prior written permission is obtained
from Adobe Systems Incorporated.
*/

;(function() {
/**
 * @description Module containing misc configuration strings.
 * @module Config
 */
var Config, utils_Lang, utils_Imslib, utils_Request, utils_Dom, utils_Text, utils_Logger, utils_Locales, utils_ConfigValidator, utils_Browser, keyboard_Keys, mustache, text_template_profilemst, profile;
Config = function () {
  /**
  * @namespace config
  * @type {Object}
  * @property {Object} strings - Misc basic strings, mainly used for debugging or truncating text.
  * @property {Object} events - Strings used for event type identification, mainly used for console logging.
  * @property {Object} messages - Misc strings used for logging messages to the console.
  * @property {Object} endpoints - This contains endpoint property variables. The variables are replaced by the build process, based on the current environment.
  * @property {Object} profile - Collection of profile properties.
  * @property {Array} profile.requiredProperties - List of mandatory fields in order to render the profile.
  * @property {String} profile.defaultAvatar - The path to devault avatar
  * @property {Object} analytics - This object contains variables for analytics integration
  * @property {Number} analytics.timeout - Maximum time in miliseconds for tracking method to execute
  */
  var config = {}, id = 'adobeProfile';
  config.strings = {
    id: id,
    debug: id + 'Debug',
    ellipsis: '...',
    localLink: 'local link',
    hashtag: '#'
  };
  config.events = {
    data_ready: id + ':DataReady',
    profile_ready: id + ':ProfileReady',
    sign_out: id + ':SignOut'
  };
  config.messages = {
    config: 'config',
    storage: 'storage',
    //ERRORS
    no_config: 'PE01',
    no_target: 'PE02',
    request_error: 'PE03 {0}',
    //WARNINGS
    profile_data_missing: 'PW01 {0}',
    //LOGS
    request_data: 'PL01 {0}',
    profile_data: 'PL02',
    profile_labels: 'PL03',
    build_profile: 'PL04',
    locale: 'PL05 {0}',
    custom_theme: 'PL06 {0}',
    custom_class: 'PL07 {0}',
    custom_behance: 'PL08 {0}',
    format_name: 'PL09 {0}',
    format_email: 'PL10 {0}; {1}',
    build_events: 'PL11',
    method_executed: 'PL12 {0}, {1}',
    imslib: 'imslib error'
  };
  config.endpoints = {
    profile: 'https://<!--#echo var="profile:source" -->.adobe.io/profile',
    locales: '//<!--#echo var="profile:cdn" -->/services/globalnav.json',
    account: '//<!--#echo var="profile:account" -->?lang={0}',
    accountProfile: '//<!--#echo var="profile:account" -->/profile?lang={0}'
  };
  config.profile = {
    requiredProperties: [
      'id',
      'first_name',
      'last_name',
      'email',
      'avatar'
    ],
    defaultAvatar: 'https://a3.behance.net/img/profile/no-image-138.jpg'
  };
  config.analytics = {
    // Maximum time for tracking callback to execute.
    // The max value should be 600ms, but if timeout and API response are exactly 600ms they will both execute.
    // Increasing the max timeout with 1ms to prevent the corner case.
    timeout: 601
  };
  return config;
}();
utils_Lang = function () {
  var lang = {};
  /**
  * @description Checks if an object is empty.
  * @method isEmptyObject
  * @param {Object} obj - The object to check for properties.
  * @return {Boolean} <em>True</em> if the object doesn't have any own properties. Otherwise it returns <em>false</em>.
  */
  lang.isEmptyObject = function (obj) {
    var prop;
    for (prop in obj) {
      //need to make sure inherited properties are ignored
      if (obj.hasOwnProperty(prop)) {
        return false;
      }
    }
    return true;
  };
  /**
  * @description Check if an argument is a function.
  * @method isFunction
  * @param {Function} fn - The argument to check against.
  * @return {Boolean} Whether the argument is of type function.
  */
  lang.isFunction = function (fn) {
    return typeof fn === 'function';
  };
  /**
  * @description Interpolates variables in strings. This is a cleaner alternative to using the <em>concat</em> method.
  * @method formatString
  * @param {String} str - The string containing the index keys to be replaced. The keys are marked as ascending integer IDs surrounded by curly braces.
  * @param {Array} keys - An array containing the values with which to replace the keys from the string. The value order should match the one from the string keys.
  * @example
  * // returns 'JavaScript is great. JavaScript is awesome!'
  * this.formatString('{0} is {1}. {0} is {2}!', ['JavaScript', 'great', 'awesome']);
  * @return {String} A string containing the interpolated variable values.
  */
  lang.formatString = function (str, keys) {
    if (typeof str === 'string' && Array.isArray(keys) && keys.length) {
      return str.replace(/{(\d+)}/g, function (match, index) {
        return typeof keys[index] !== 'undefined' ? keys[index] : match;
      });
    }
  };
  /**
  * @description Safely retrieves nested object properties without throwing errors.
  * @method getPropertySafely
  * @param {Object} obj - The object from which to retrieve the property.
  * @param {String} path - The path to the nested property.
  * @example
  * // returns 'value'
  * this.getPropertySafely({prop1: {prop2: 'value'}}, 'prop1.prop2');
  * @example
  * // returns undefined
  * getPropertySafely({prop1: {prop2: 'value'}}, 'prop1.prop3.prop4');
  * @return {Boolean} The value of the nested property if it has been found or <em>undefined</em> if it doesn't exist.
  */
  lang.getPropertySafely = function (obj, path) {
    var i, len, current;
    if (obj && typeof obj === 'object' && !Array.isArray(obj) && typeof path === 'string' && Object.keys(obj).length && path.length) {
      path = path.split('.');
      len = path.length;
      current = obj;
      for (i = 0; i < len; i++) {
        if (current.hasOwnProperty(path[i])) {
          current = current[path[i]];
        } else {
          return undefined;
        }
      }
      return current;
    }
  };
  return lang;
}();
utils_Imslib = function (Lang) {
  function dispatchCustomEvent(eventName, eventDetail) {
    var evt;
    if (typeof window.CustomEvent === 'function') {
      evt = new window.CustomEvent(eventName, { detail: eventDetail });
    } else {
      evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(eventName, false, false, eventDetail);
    }
    window.dispatchEvent(evt);
  }
  function isIMSDefined() {
    return typeof window.adobeIMS === 'object';
  }
  function isNewIMSVersion() {
    var version = isIMSDefined() && window.adobeIMS.version;
    return typeof version === 'string' && version.indexOf('v2') === 0;
  }
  function isSignedInUser() {
    var loggedIn = false;
    if (isNewIMSVersion() && Lang.isFunction(window.adobeIMS.isSignedInUser)) {
      loggedIn = window.adobeIMS.isSignedInUser();
    } else {
      loggedIn = !Lang.isEmptyObject(window.adobeIMS.isSignedInUser());
    }
    return loggedIn;
  }
  function getAccessToken() {
    var accessToken = null;
    if (isSignedInUser() && Lang.isFunction(window.adobeIMS.getAccessToken)) {
      if (isNewIMSVersion()) {
        accessToken = window.adobeIMS.getAccessToken().token;
      } else {
        accessToken = window.adobeIMS.getAccessToken();
      }
    }
    return accessToken;
  }
  function getProfile() {
    return new Promise(function (resolve, reject) {
      function onInstanceReady(event) {
        var instance = event.detail.instance;
        if (typeof instance === 'object' && typeof instance.adobeIdData === 'object' && instance.adobeIdData.client_id === window.adobeid.client_id) {
          window.removeEventListener('onImsLibInstance', onInstanceReady);
          resolve(instance.getProfile());
        } else {
          reject();
        }
      }
      if (isSignedInUser()) {
        if (isNewIMSVersion()) {
          window.addEventListener('onImsLibInstance', onInstanceReady);
          dispatchCustomEvent('getImsLibInstance', null);
        } else {
          resolve(window.adobeIMS.getUserProfile());
        }
      } else {
        reject();
      }
    });
  }
  function signOut() {
    window.adobeIMS.signOut.call(window.adobeIMS);
  }
  function refreshToken(callback) {
    if (isSignedInUser()) {
      if (isNewIMSVersion()) {
        window.adobeIMS.refreshToken().then(function (data) {
          if (Lang.isFunction(callback)) {
            callback(data);
          }
        }).catch(function () {
        });
      } else {
        window.adobeIMS.acquireAccessToken(Lang.isFunction(callback) ? callback : undefined);
      }
    }
  }
  return {
    isSignedInUser: isSignedInUser,
    getAccessToken: getAccessToken,
    getProfile: getProfile,
    refreshToken: refreshToken,
    signOut: signOut
  };
}(utils_Lang);
utils_Request = function (Lang) {
  var request = {};
  /**
  * @description Performs a GET request and executes actions based on the success of the response.
  * @method get
  * @param {Object} config - This consists of several properties in order to make the request.
  * @param {String} config.endpoint - The API endpoint to be called.
  * @param {Object} [config.headers] - This provides the ability to add custom headers to the request.
  * @param {function} [config.success] - Callback function to execute if the GET request is successful.
  * @param {function} [config.error] - Callback function to execute if the GET request has failed.
  */
  request.get = function (config) {
    var request = new XMLHttpRequest();
    request.open('GET', config.endpoint, true);
    if (config.headers && !Lang.isEmptyObject(config.headers)) {
      Object.keys(config.headers).forEach(function (header) {
        request.setRequestHeader(header, config.headers[header]);
      });
    }
    request.onload = function () {
      if (this.status >= 200 && this.status < 400) {
        if (config.success && Lang.isFunction(config.success)) {
          config.success(this.response);
        }
      } else {
        if (config.error && Lang.isFunction(config.error)) {
          config.error(this.response);
        }
      }
    };
    request.onerror = function () {
      if (config.error && Lang.isFunction(config.error)) {
        config.error(this.response);
      }
    };
    request.send();
    return this;
  };
  return request;
}(utils_Lang);
utils_Dom = function (Lang) {
  var dom = {};
  /**
  * @description Events constructor
  * @constructor
  * @memberOf utils/Dom
  */
  dom.Events = function () {
    var eventCallbacks = {};
    /**
     * @description Creates or adds a new callback for a specific event.
     * @param {String} eventType - The type of the event we want to listen to.
     * @param {Function} callback - Function to execute when the event has been triggered.
     */
    this.addEventListener = function (eventType, callback) {
      var callbacks = eventCallbacks[eventType] || [];
      callbacks.push(callback);
      eventCallbacks[eventType] = callbacks;
    };
    /**
     * @description Executes actions tied to a certain event when it has been triggered.
     * @param {String} eventType - The type of event that has been triggered.
     * @param {Object} data - The data associated with the event.
     */
    this.dispatchEvent = function (eventType, data) {
      var callbacks = eventCallbacks[eventType], len, i;
      if (!callbacks) {
        return;
      }
      for (i = 0, len = callbacks.length; i < len; ++i) {
        if (Lang.isFunction(callbacks[i])) {
          callbacks[i].apply(null, [
            data,
            eventType
          ]);
        }
      }
    };
  };
  /**
  * @description A polyfill for the <em>matches</em> method which may not be natively provided in all browsers without being prefixed.
  * @method matches
  * @param {Object} element - The element for which we want to check if it matches the selector.
  * @param {String} selector - The selector with which to test the element against.
  * @return {Boolean} <em>True</em> if the element would be selected by the selector. Otherwise, it will be <em>false</em>.
  */
  dom.matches = function (element, selector) {
    var matches, matching, index;
    if (!element || !selector) {
      return null;
    }
    /* istanbul ignore else */
    if (typeof window.Element.prototype.matches !== 'function') {
      matches = element.matchesSelector || element.mozMatchesSelector || element.msMatchesSelector || element.oMatchesSelector || element.webkitMatchesSelector || function (s) {
        matching = (this.document || this.ownerDocument).querySelectorAll(s);
        index = matching.length;
        do {
          --index;
        } while (index >= 0 && matching.item(index) !== this);
        return index > -1;
      };
      return matches.apply(element, [selector]);
    } else {
      return element.matches(selector);
    }
  };
  /**
  * @description A polyfill for the <em>closest</em> method which is not natively provided in IE.
  * @method closest
  * @param {Object} element - The DOM element from which to start traversing the DOM upwards to reach a certain parent.
  * @param {String} selector - The element's parent selector we want to reach.
  * @return {Object} The parent DOM element of the selector, if it is found. Otherwise, the result will be <em>null</em>.
  */
  dom.closest = function (element, selector) {
    if (!element || !selector) {
      return null;
    }
    /* istanbul ignore else */
    if (typeof window.Element.prototype.closest !== 'function') {
      while (element && element.nodeType === 1) {
        if (this.matches(element, selector)) {
          return element;
        }
        element = element.parentNode;
      }
      return null;
    } else {
      return element.closest(selector);
    }
  };
  /**
  * @description A polyfill for the <em>Number.isInteger</em> method which is not supported in Internet Explorer.
  * @method isInteger
  * @param {Object} value - The value to be checked
  * @return {Boolean} <em>True</em> if the value is an Integer. Otherwise, it will be <em>false</em>.
  */
  dom.isInteger = function (value) {
    var isInteger;
    if (typeof Number.isInteger === 'function') {
      isInteger = Number.isInteger;
    } else {
      isInteger = function (val) {
        return typeof val === 'number' && window.isFinite(val) && Math.floor(val) === val;
      };
    }
    return isInteger.apply(null, [value]);
  };
  return dom;
}(utils_Lang);
utils_Text = function (Lang, Config) {
  var text = {}, canvas = document.createElement('canvas');
  /**
  * @description Retrieves computed style properties of an element.
  * @method getElementProperties
  * @param {Object} element - The DOM element from which to retrieve the properties.
  * @param {String|Array} properties - One or more style properties to retrieve.
  * @example
  * // an example of how to retrieve the font size and weight for the first h1 element in the page
  * // returns an object like {font-size: "22px", font-weight: "400"}
  * getElementProperties(document.getElementsByTagName('h1')[0], ['font-size', 'font-weight']);
  * // if just one property is needed, the array brackets can be omitted
  * getElementProperties(document.getElementsByTagName('h1')[0], 'font-size');
  * @return {Object} An object containing all the requested style properties and their values.
  */
  text.getElementProperties = function (element, properties) {
    var props = {}, len, i, prop;
    if (!element || !properties) {
      return null;
    }
    properties = Array.isArray(properties) ? properties : [properties];
    len = properties.length;
    for (i = 0; i < len; i++) {
      prop = properties[i];
      if (typeof prop === 'string') {
        props[prop] = window.getComputedStyle(element)[prop];
      }
    }
    return props;
  };
  /**
  * @description Calculates the width of a text with specific font properties
  * @method measure
  * @param {String} text - The text to be used for measurements.
  * @param {Object} font - Groups mandatory font properties.
  * @param {number|String} font.font-weight - The <em>font-weight</em> value to be used for measuring the text. This can be in either the integer form (400, 500, 800, etc.) or the string keyword one ('light', 'bold', etc.).
  * @param {String} font.font-size - The <em>font-size</em> value to be used for measuring the text. This also contains the measurement unit (px, em, etc.).
  * @param {String} font.font-family - The <em>font-family</em> value to be used for measuring the text.
  * @return {number} The width of the measured text
  */
  text.measure = function (text, font) {
    var context;
    if (!text || !font) {
      return null;
    }
    context = canvas.getContext('2d');
    context.font = Lang.formatString('{0} {1} {2}', [
      font['font-weight'],
      font['font-size'],
      font['font-family']
    ]);
    return context.measureText(text.trim()).width;
  };
  /**
  * @description Equally truncates an email address on both sides of the <em>@</em> sign so it fits in a container with a given width.
  * @method truncateEmail
  * @param {String} user - The user part of the email address. i.e. 'user' in 'user@domain.com'.
  * @param {String} domain - The domain and TLD part of the email address. i.e. 'domain.com' in 'user@domain.com'.
  * @param {Object} properties - Computed style properties needed for text measurements.
  * @param {number} properties.width - The width in which the truncated email address needs to fit.
  * @param {number|String} properties.font-weight - The <em>font-weight</em> value to be used for measuring the length of the email address. This can be in either the integer form (400, 500, 800, etc.) or the string keyword one ('light', 'bold', etc.).
  * @param {String} properties.font-size - The <em>font-size</em> value to be used for measuring the email address. This also contains the measurement unit (px, em, etc.).
  * @param {String} properties.font-family - The <em>font-family</em> value to be used for measuring the email address.
  * @return {String} A trimmed email string that fits in the specified width.
  */
  text.truncateEmail = function (user, domain, properties) {
    var isUserTrimmed = false, isDomainTrimmed = false;
    if (!user || !domain || !properties) {
      return null;
    }
    while (this.measure(Lang.formatString('{0}@{1}', [
        user,
        domain
      ]), properties) > parseFloat(properties.width)) {
      if (user.length >= domain.length) {
        user = Lang.formatString('{0}{1}', [
          user.slice(0, isUserTrimmed ? -4 : -1),
          Config.strings.ellipsis
        ]);
        isUserTrimmed = true;
      }
      if (user.length <= domain.length) {
        domain = Lang.formatString('{0}{1}', [
          domain.slice(0, isDomainTrimmed ? -4 : -1),
          Config.strings.ellipsis
        ]);
        isDomainTrimmed = true;
      }
    }
    return Lang.formatString('{0}@{1}', [
      user,
      domain
    ]);
  };
  return text;
}(utils_Lang, Config);
utils_Logger = function (Lang, Config) {
  /**
  * @description Logger constructor
  * @constructor
  * @memberOf utils/Logger
  */
  var Logger = function (debug) {
    this.debug = debug;
  };
  /**
  * @description Builds an array of messages to be written in the console.
  * @return {Array} An array containing a default identifier followed by all the messages from the arguments parameter.
  */
  Logger.prototype.message = function () {
    var log = [Config.strings.debug + ':'], len = arguments.length, i;
    for (i = 0; i < len; i++) {
      log.push(arguments[i]);
    }
    return log.concat();
  };
  /**
  * @description Logs the arguments as formatted messages in the console using the <em>console.log</em> method.
  */
  Logger.prototype.log = function () {
    if (this.debug && window.console && Lang.isFunction(window.console.log)) {
      window.console.log.apply(null, this.message.apply(null, arguments));
    }
  };
  /**
  * @description Logs the arguments as formatted messages in the console using the <em>console.warn</em> method.
  */
  Logger.prototype.warn = function () {
    if (this.debug && window.console && Lang.isFunction(window.console.warn)) {
      window.console.warn.apply(null, this.message.apply(null, arguments));
    }
  };
  /**
  * @description Logs the arguments as formatted messages in the console using the <em>console.error</em> method.
  */
  Logger.prototype.error = function () {
    if (this.debug && window.console && Lang.isFunction(window.console.error)) {
      window.console.error.apply(null, this.message.apply(null, arguments));
    }
  };
  return Logger;
}(utils_Lang, Config);
utils_Locales = function () {
  var locales = {}, _ = [
      'ae_ar',
      'ae_en',
      'africa',
      'at',
      'au',
      'be_en',
      'be_fr',
      'be_nl',
      'bg',
      'br',
      'ca',
      'ca_fr',
      'ch_de',
      'ch_fr',
      'ch_it',
      'cis_en',
      'cis_ru',
      'cl',
      'cn',
      'cy_en',
      'cz',
      'de',
      'dk',
      'eeurope',
      'ee',
      'en',
      'es',
      'fi',
      'fr',
      'gr_en',
      'hk_en',
      'hk_zh',
      'hr',
      'hu',
      'ie',
      'il_en',
      'il_he',
      'in',
      'it',
      'jp',
      'kr',
      'la',
      'lt',
      'lu_de',
      'lu_en',
      'lu_fr',
      'lv',
      'mena_ar',
      'mena_en',
      'mena_fr',
      'mt',
      'mx',
      'nl',
      'no',
      'nz',
      'pl',
      'pt',
      'ro',
      'rs',
      'ru',
      'sa_ar',
      'sa_en',
      'se',
      'sea',
      'sg',
      'si',
      'sk',
      'th_en',
      'th_th',
      'tr',
      'tw',
      'ua',
      'uk'
    ];
  /**
  * @description Returns the array of supported locales
  * @method getLocales
  * @returns {Array} Supported locales
  */
  locales.getLocales = function () {
    return _;
  };
  /**
  *
  * @description Checks if a given locale matches one of the supported locales.
  * @method isMatch
  * @param {String} locale Locale to test
  * @returns {Boolean} True if the locale is valid and supported
  */
  locales.isMatch = function (locale) {
    if (!locale || typeof locale !== 'string') {
      return false;
    }
    return _.indexOf(locale.toLowerCase()) > -1;
  };
  /**
  * @description Returns the default locale
  * @method getDefault
  * @returns {String} The default locale
  */
  locales.getDefault = function () {
    return 'en';
  };
  return locales;
}();
utils_ConfigValidator = function (Lang) {
  var _ = {}, validator = {};
  /**
  * @description Capitalizes the first letter of a string. Useful for type checks using 'instanceof'.
  * Example: we check 'obj instanceof Object', but 'typeof obj === "object"'
  * @method capitalizeFirstLetter
  * @private
  * @param {String} string The string to be formatted
  * @return {String} The formatted string
  * @example
  * // returns 'String'
  * _.capitalizeFirstLetter('string')
  * // returns the original argument if it is not a string;
  * // returns ['string']
  * _.capitalizeFirstLetter(['string'])
  */
  _.capitalizeFirstLetter = function (string) {
    return typeof string === 'string' ? string.charAt(0).toUpperCase() + string.slice(1) : string;
  };
  /**
  * @description Ensures the types provided are in an array format.
  * Some variables could be of different types. Say a value can be either a string or a function.
  * We specify this in the options object as {value: ['string', 'function'].
  * Thus, we need to check if any of the types is a match.
  * If a string value is provided ('number'), it is mapped to an array (['number']).
  * More information on checking for multiple types can be found in the examples for the 'isValid' method.
  * @method getTypes
  * @private
  * @param {String|Array} types The types to be mapped
  * @return {Array|undefined} The array of types to check against.
  * If 'types' is invalid, then the method will return 'undefined'
  */
  _.getTypes = function (types) {
    if (typeof types === 'string' || types instanceof Array) {
      return typeof types === 'string' ? [types] : types;
    }
  };
  /**
  * @description Checks if a value is of one of the provided types.
  * More examples of type checks can be found in  the examples for the 'isValid' method.
  * In short, this method checks for objects and arrays (using 'instanceof'),
  * checks value types (using 'typeof') and, finally, tries to match against regex patterns.
  * @method doesValueMatchType
  * @private
  * @param value The value that we want to perform type checks on
  * @param {Array} types The allowed types for the given value
  * @return {Boolean} <em>True</em> if the value and one of the types match, <em>false</em> otherwise
  */
  _.doesValueMatchType = function (value, types) {
    if (typeof value !== 'undefined' && value !== '' && !!types && !Lang.isEmptyObject(types) && types instanceof Array) {
      // Iterate through all of the types and check if any is a match for the value.
      return types.some(function (type) {
        var isObject = value instanceof Object,
          // Checks that if the value is an object (including, of course, Array),
          // then it is not empty and it is of the specified type
          isObjectOfCurrentType = isObject && !Lang.isEmptyObject(value) && value instanceof window[_.capitalizeFirstLetter(type)],
          // Checks if the value matches the specified type, if a match hasn't been already found
          isOfCurrentType = !isObjectOfCurrentType && (!!value && typeof value === type),
          // Checks if the value follows a regular expression pattern defined by the type, if a match hasn't been already found
          followsRegexPattern = !isOfCurrentType && !!value && new RegExp(type).test(value);
        if (!isObjectOfCurrentType && !isOfCurrentType && !followsRegexPattern) {
          return false;
        }
        return true;
      });
    }
    return false;
  };
  /**
  * @description Checks whether a configuration object follows a
  * set of rules (types or regex patterns) defined in an 'options' object.
  * @method isValid
  * @param {Object} config The configuration object that needs to be checked for validity
  * @param {Object} options Object defining the pattern that
  * the properties in the config object should follow
  * @return {Boolean} <em>True</em> if the config follows the patterns
  * provided in the options object.
  * @example
  * // Check if a mandatory 'title' property exists and it is a non-empty string
  * _.isValid({title: 'Test string'}, {mandatory: {title: 'string'}}); // true
  * _.isValid({title: ''}, {mandatory: {title: 'string'}}); // false, title's value is empty
  * // Check if a mandatory 'items' property exists and it is a non-empty array
  * _.isValid({items: [1, 2]}, {mandatory: {items: 'array'}}); // true
  * _.isValid({items: []}, {mandatory: {items: 'array'}}); // false, the array is empty
  * // Check if a mandatory 'action' property exists and it is of one of two types
  * _.isValid({action: function () {}}, {mandatory: {action: ['string', 'function']}}); // true
  * // Check if a mandatory 'target' property exists and it follows the expected
  * // pattern for a 'target' HTML attribute ('_' followed by a word, with no spaces).
  * // This is achieved by using a regex pattern.
  * _.isValid({target: '_blank'}, {mandatory: {target: '^_\\w+$'}}); // true
  * _.isValid({target: 'blank'}, {mandatory: {target: '^_\\w+$'}}); // false, target should start with '_'
  * // Check that if an optional 'class' property is provided, it should be a non-empty string
  * _.isValid({class: 'testClass'}, {optional: {class: 'string'}}); // true
  * _.isValid({}, {optional: {class: 'string'}}); // true, the class is optional and not provided in the config
  * _.isValid({class: ''}, {optional: {class: 'string'}}); // false, if a class is provided, it should be non-empty
  * // Check for both mandatory and optional properties
  * _.isValid({title: 'Test string', class: 'testClass'}, {mandatory: {title: 'string'}, optional: {class: 'string'}}); // true
  */
  validator.isValid = function (config, options) {
    var isValid = true;
    // If either 'config' or 'options' is undefined, stop execution. The config is not valid.
    if (Lang.isEmptyObject(config) || Lang.isEmptyObject(options)) {
      return false;
    }
    // Check if mandatory options are defined in the 'options' object
    if (!Lang.isEmptyObject(options.mandatory)) {
      // Iterate through each mandatory property
      isValid = Object.keys(options.mandatory).every(function (mandatoryKey) {
        // Get the possible types the property's value might be of
        var types = _.getTypes(options.mandatory[mandatoryKey]);
        // If the mandatory value is defined in the 'config' object, check that it is of the specified type
        if (config.hasOwnProperty(mandatoryKey)) {
          return _.doesValueMatchType(config[mandatoryKey], types);
        }
        // If the value is not defined in the 'config' object, then the whole config is considered invalid
        return false;
      });
    }
    if (isValid && !Lang.isEmptyObject(options.optional)) {
      // Iterate through each optional property
      isValid = Object.keys(options.optional).every(function (optionalKey) {
        // Get the possible types the property's value might be of
        var types = _.getTypes(options.optional[optionalKey]);
        // If the optional value is defined in the 'config' object, check that it is of the specified type
        if (config.hasOwnProperty(optionalKey)) {
          return _.doesValueMatchType(config[optionalKey], types);
        }
        // If the value is not defined in the 'config' object, we can just continue execution
        return true;
      });
    }
    return isValid;
  };
  return validator;
}(utils_Lang);
utils_Browser = function () {
  var browser = {};
  /**
  * @description Checks if the browser is IE. Will return false for Edge.
  * @method isIE
  * @return {Boolean} True, if the browser is IE.
  */
  browser.isIE = function () {
    var agent = window.navigator.userAgent;
    return agent.indexOf('MSIE') > -1 || agent.indexOf('Trident') > -1;
  };
  return browser;
}();
keyboard_Keys = Object.freeze({
  'TAB': 9,
  'RETURN': 13,
  'ESC': 27,
  'SPACE': 32,
  'UP': 38,
  'DOWN': 40
});
/*!
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 * http://github.com/janl/mustache.js
 */
/*global define: false Mustache: true*/
(function defineMustache(global, factory) {
  if (typeof exports === 'object' && exports && typeof exports.nodeName !== 'string') {
    factory(exports);  // CommonJS
  } else if (true) {
    mustache = function (exports) {
      return typeof factory === 'function' ? factory(exports) : factory;
    }({});
  } else {
    global.Mustache = {};
    factory(global.Mustache);  // script, wsh, asp
  }
}(this, function mustacheFactory(mustache) {
  var objectToString = Object.prototype.toString;
  var isArray = Array.isArray || function isArrayPolyfill(object) {
    return objectToString.call(object) === '[object Array]';
  };
  function isFunction(object) {
    return typeof object === 'function';
  }
  /**
   * More correct typeof string handling array
   * which normally returns typeof 'object'
   */
  function typeStr(obj) {
    return isArray(obj) ? 'array' : typeof obj;
  }
  function escapeRegExp(string) {
    return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
  }
  /**
   * Null safe way of checking whether or not an object,
   * including its prototype, has a given property
   */
  function hasProperty(obj, propName) {
    return obj != null && typeof obj === 'object' && propName in obj;
  }
  // Workaround for https://issues.apache.org/jira/browse/COUCHDB-577
  // See https://github.com/janl/mustache.js/issues/189
  var regExpTest = RegExp.prototype.test;
  function testRegExp(re, string) {
    return regExpTest.call(re, string);
  }
  var nonSpaceRe = /\S/;
  function isWhitespace(string) {
    return !testRegExp(nonSpaceRe, string);
  }
  var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  function escapeHtml(string) {
    return String(string).replace(/[&<>"'`=\/]/g, function fromEntityMap(s) {
      return entityMap[s];
    });
  }
  var whiteRe = /\s*/;
  var spaceRe = /\s+/;
  var equalsRe = /\s*=/;
  var curlyRe = /\s*\}/;
  var tagRe = /#|\^|\/|>|\{|&|=|!/;
  /**
   * Breaks up the given `template` string into a tree of tokens. If the `tags`
   * argument is given here it must be an array with two string values: the
   * opening and closing tags used in the template (e.g. [ "<%", "%>" ]). Of
   * course, the default is to use mustaches (i.e. mustache.tags).
   *
   * A token is an array with at least 4 elements. The first element is the
   * mustache symbol that was used inside the tag, e.g. "#" or "&". If the tag
   * did not contain a symbol (i.e. {{myValue}}) this element is "name". For
   * all text that appears outside a symbol this element is "text".
   *
   * The second element of a token is its "value". For mustache tags this is
   * whatever else was inside the tag besides the opening symbol. For text tokens
   * this is the text itself.
   *
   * The third and fourth elements of the token are the start and end indices,
   * respectively, of the token in the original template.
   *
   * Tokens that are the root node of a subtree contain two more elements: 1) an
   * array of tokens in the subtree and 2) the index in the original template at
   * which the closing tag for that section begins.
   */
  function parseTemplate(template, tags) {
    if (!template)
      return [];
    var sections = [];
    // Stack to hold section tokens
    var tokens = [];
    // Buffer to hold the tokens
    var spaces = [];
    // Indices of whitespace tokens on the current line
    var hasTag = false;
    // Is there a {{tag}} on the current line?
    var nonSpace = false;
    // Is there a non-space char on the current line?
    // Strips all whitespace tokens array for the current line
    // if there was a {{#tag}} on it and otherwise only space.
    function stripSpace() {
      if (hasTag && !nonSpace) {
        while (spaces.length)
          delete tokens[spaces.pop()];
      } else {
        spaces = [];
      }
      hasTag = false;
      nonSpace = false;
    }
    var openingTagRe, closingTagRe, closingCurlyRe;
    function compileTags(tagsToCompile) {
      if (typeof tagsToCompile === 'string')
        tagsToCompile = tagsToCompile.split(spaceRe, 2);
      if (!isArray(tagsToCompile) || tagsToCompile.length !== 2)
        throw new Error('Invalid tags: ' + tagsToCompile);
      openingTagRe = new RegExp(escapeRegExp(tagsToCompile[0]) + '\\s*');
      closingTagRe = new RegExp('\\s*' + escapeRegExp(tagsToCompile[1]));
      closingCurlyRe = new RegExp('\\s*' + escapeRegExp('}' + tagsToCompile[1]));
    }
    compileTags(tags || mustache.tags);
    var scanner = new Scanner(template);
    var start, type, value, chr, token, openSection;
    while (!scanner.eos()) {
      start = scanner.pos;
      // Match any text between tags.
      value = scanner.scanUntil(openingTagRe);
      if (value) {
        for (var i = 0, valueLength = value.length; i < valueLength; ++i) {
          chr = value.charAt(i);
          if (isWhitespace(chr)) {
            spaces.push(tokens.length);
          } else {
            nonSpace = true;
          }
          tokens.push([
            'text',
            chr,
            start,
            start + 1
          ]);
          start += 1;
          // Check for whitespace on the current line.
          if (chr === '\n')
            stripSpace();
        }
      }
      // Match the opening tag.
      if (!scanner.scan(openingTagRe))
        break;
      hasTag = true;
      // Get the tag type.
      type = scanner.scan(tagRe) || 'name';
      scanner.scan(whiteRe);
      // Get the tag value.
      if (type === '=') {
        value = scanner.scanUntil(equalsRe);
        scanner.scan(equalsRe);
        scanner.scanUntil(closingTagRe);
      } else if (type === '{') {
        value = scanner.scanUntil(closingCurlyRe);
        scanner.scan(curlyRe);
        scanner.scanUntil(closingTagRe);
        type = '&';
      } else {
        value = scanner.scanUntil(closingTagRe);
      }
      // Match the closing tag.
      if (!scanner.scan(closingTagRe))
        throw new Error('Unclosed tag at ' + scanner.pos);
      token = [
        type,
        value,
        start,
        scanner.pos
      ];
      tokens.push(token);
      if (type === '#' || type === '^') {
        sections.push(token);
      } else if (type === '/') {
        // Check section nesting.
        openSection = sections.pop();
        if (!openSection)
          throw new Error('Unopened section "' + value + '" at ' + start);
        if (openSection[1] !== value)
          throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
      } else if (type === 'name' || type === '{' || type === '&') {
        nonSpace = true;
      } else if (type === '=') {
        // Set the tags for the next time around.
        compileTags(value);
      }
    }
    // Make sure there are no open sections when we're done.
    openSection = sections.pop();
    if (openSection)
      throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);
    return nestTokens(squashTokens(tokens));
  }
  /**
   * Combines the values of consecutive text tokens in the given `tokens` array
   * to a single token.
   */
  function squashTokens(tokens) {
    var squashedTokens = [];
    var token, lastToken;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];
      if (token) {
        if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
          lastToken[1] += token[1];
          lastToken[3] = token[3];
        } else {
          squashedTokens.push(token);
          lastToken = token;
        }
      }
    }
    return squashedTokens;
  }
  /**
   * Forms the given array of `tokens` into a nested tree structure where
   * tokens that represent a section have two additional items: 1) an array of
   * all tokens that appear in that section and 2) the index in the original
   * template that represents the end of that section.
   */
  function nestTokens(tokens) {
    var nestedTokens = [];
    var collector = nestedTokens;
    var sections = [];
    var token, section;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];
      switch (token[0]) {
      case '#':
      case '^':
        collector.push(token);
        sections.push(token);
        collector = token[4] = [];
        break;
      case '/':
        section = sections.pop();
        section[5] = token[2];
        collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
        break;
      default:
        collector.push(token);
      }
    }
    return nestedTokens;
  }
  /**
   * A simple string scanner that is used by the template parser to find
   * tokens in template strings.
   */
  function Scanner(string) {
    this.string = string;
    this.tail = string;
    this.pos = 0;
  }
  /**
   * Returns `true` if the tail is empty (end of string).
   */
  Scanner.prototype.eos = function eos() {
    return this.tail === '';
  };
  /**
   * Tries to match the given regular expression at the current position.
   * Returns the matched text if it can match, the empty string otherwise.
   */
  Scanner.prototype.scan = function scan(re) {
    var match = this.tail.match(re);
    if (!match || match.index !== 0)
      return '';
    var string = match[0];
    this.tail = this.tail.substring(string.length);
    this.pos += string.length;
    return string;
  };
  /**
   * Skips all text until the given regular expression can be matched. Returns
   * the skipped string, which is the entire tail if no match can be made.
   */
  Scanner.prototype.scanUntil = function scanUntil(re) {
    var index = this.tail.search(re), match;
    switch (index) {
    case -1:
      match = this.tail;
      this.tail = '';
      break;
    case 0:
      match = '';
      break;
    default:
      match = this.tail.substring(0, index);
      this.tail = this.tail.substring(index);
    }
    this.pos += match.length;
    return match;
  };
  /**
   * Represents a rendering context by wrapping a view object and
   * maintaining a reference to the parent context.
   */
  function Context(view, parentContext) {
    this.view = view;
    this.cache = { '.': this.view };
    this.parent = parentContext;
  }
  /**
   * Creates a new context using the given view with this context
   * as the parent.
   */
  Context.prototype.push = function push(view) {
    return new Context(view, this);
  };
  /**
   * Returns the value of the given name in this context, traversing
   * up the context hierarchy if the value is absent in this context's view.
   */
  Context.prototype.lookup = function lookup(name) {
    var cache = this.cache;
    var value;
    if (cache.hasOwnProperty(name)) {
      value = cache[name];
    } else {
      var context = this, names, index, lookupHit = false;
      while (context) {
        if (name.indexOf('.') > 0) {
          value = context.view;
          names = name.split('.');
          index = 0;
          /**
           * Using the dot notion path in `name`, we descend through the
           * nested objects.
           *
           * To be certain that the lookup has been successful, we have to
           * check if the last object in the path actually has the property
           * we are looking for. We store the result in `lookupHit`.
           *
           * This is specially necessary for when the value has been set to
           * `undefined` and we want to avoid looking up parent contexts.
           **/
          while (value != null && index < names.length) {
            if (index === names.length - 1)
              lookupHit = hasProperty(value, names[index]);
            value = value[names[index++]];
          }
        } else {
          value = context.view[name];
          lookupHit = hasProperty(context.view, name);
        }
        if (lookupHit)
          break;
        context = context.parent;
      }
      cache[name] = value;
    }
    if (isFunction(value))
      value = value.call(this.view);
    return value;
  };
  /**
   * A Writer knows how to take a stream of tokens and render them to a
   * string, given a context. It also maintains a cache of templates to
   * avoid the need to parse the same template twice.
   */
  function Writer() {
    this.cache = {};
  }
  /**
   * Clears all cached templates in this writer.
   */
  Writer.prototype.clearCache = function clearCache() {
    this.cache = {};
  };
  /**
   * Parses and caches the given `template` and returns the array of tokens
   * that is generated from the parse.
   */
  Writer.prototype.parse = function parse(template, tags) {
    var cache = this.cache;
    var tokens = cache[template];
    if (tokens == null)
      tokens = cache[template] = parseTemplate(template, tags);
    return tokens;
  };
  /**
   * High-level method that is used to render the given `template` with
   * the given `view`.
   *
   * The optional `partials` argument may be an object that contains the
   * names and templates of partials that are used in the template. It may
   * also be a function that is used to load partial templates on the fly
   * that takes a single argument: the name of the partial.
   */
  Writer.prototype.render = function render(template, view, partials) {
    var tokens = this.parse(template);
    var context = view instanceof Context ? view : new Context(view);
    return this.renderTokens(tokens, context, partials, template);
  };
  /**
   * Low-level method that renders the given array of `tokens` using
   * the given `context` and `partials`.
   *
   * Note: The `originalTemplate` is only ever used to extract the portion
   * of the original template that was contained in a higher-order section.
   * If the template doesn't use higher-order sections, this argument may
   * be omitted.
   */
  Writer.prototype.renderTokens = function renderTokens(tokens, context, partials, originalTemplate) {
    var buffer = '';
    var token, symbol, value;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      value = undefined;
      token = tokens[i];
      symbol = token[0];
      if (symbol === '#')
        value = this.renderSection(token, context, partials, originalTemplate);
      else if (symbol === '^')
        value = this.renderInverted(token, context, partials, originalTemplate);
      else if (symbol === '>')
        value = this.renderPartial(token, context, partials, originalTemplate);
      else if (symbol === '&')
        value = this.unescapedValue(token, context);
      else if (symbol === 'name')
        value = this.escapedValue(token, context);
      else if (symbol === 'text')
        value = this.rawValue(token);
      if (value !== undefined)
        buffer += value;
    }
    return buffer;
  };
  Writer.prototype.renderSection = function renderSection(token, context, partials, originalTemplate) {
    var self = this;
    var buffer = '';
    var value = context.lookup(token[1]);
    // This function is used to render an arbitrary template
    // in the current context by higher-order sections.
    function subRender(template) {
      return self.render(template, context, partials);
    }
    if (!value)
      return;
    if (isArray(value)) {
      for (var j = 0, valueLength = value.length; j < valueLength; ++j) {
        buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate);
      }
    } else if (typeof value === 'object' || typeof value === 'string' || typeof value === 'number') {
      buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate);
    } else if (isFunction(value)) {
      if (typeof originalTemplate !== 'string')
        throw new Error('Cannot use higher-order sections without the original template');
      // Extract the portion of the original template that the section contains.
      value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);
      if (value != null)
        buffer += value;
    } else {
      buffer += this.renderTokens(token[4], context, partials, originalTemplate);
    }
    return buffer;
  };
  Writer.prototype.renderInverted = function renderInverted(token, context, partials, originalTemplate) {
    var value = context.lookup(token[1]);
    // Use JavaScript's definition of falsy. Include empty arrays.
    // See https://github.com/janl/mustache.js/issues/186
    if (!value || isArray(value) && value.length === 0)
      return this.renderTokens(token[4], context, partials, originalTemplate);
  };
  Writer.prototype.renderPartial = function renderPartial(token, context, partials) {
    if (!partials)
      return;
    var value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
    if (value != null)
      return this.renderTokens(this.parse(value), context, partials, value);
  };
  Writer.prototype.unescapedValue = function unescapedValue(token, context) {
    var value = context.lookup(token[1]);
    if (value != null)
      return value;
  };
  Writer.prototype.escapedValue = function escapedValue(token, context) {
    var value = context.lookup(token[1]);
    if (value != null)
      return mustache.escape(value);
  };
  Writer.prototype.rawValue = function rawValue(token) {
    return token[1];
  };
  mustache.name = 'mustache.js';
  mustache.version = '2.3.0';
  mustache.tags = [
    '{{',
    '}}'
  ];
  // All high-level mustache.* functions use this writer.
  var defaultWriter = new Writer();
  /**
   * Clears all cached templates in the default writer.
   */
  mustache.clearCache = function clearCache() {
    return defaultWriter.clearCache();
  };
  /**
   * Parses and caches the given template in the default writer and returns the
   * array of tokens it contains. Doing this ahead of time avoids the need to
   * parse templates on the fly as they are rendered.
   */
  mustache.parse = function parse(template, tags) {
    return defaultWriter.parse(template, tags);
  };
  /**
   * Renders the `template` with the given `view` and `partials` using the
   * default writer.
   */
  mustache.render = function render(template, view, partials) {
    if (typeof template !== 'string') {
      throw new TypeError('Invalid template! Template should be a "string" ' + 'but "' + typeStr(template) + '" was given as the first ' + 'argument for mustache#render(template, view, partials)');
    }
    return defaultWriter.render(template, view, partials);
  };
  // This is here for backwards compatibility with 0.4.x.,
  /*eslint-disable */
  // eslint wants camel cased function name
  mustache.to_html = function to_html(template, view, partials, send) {
    /*eslint-enable*/
    var result = mustache.render(template, view, partials);
    if (isFunction(send)) {
      send(result);
    } else {
      return result;
    }
  };
  // Export the escaping function so that the user may override it.
  // See https://github.com/janl/mustache.js/issues/244
  mustache.escape = escapeHtml;
  // Export these mainly for testing, but also for advanced usage.
  mustache.Scanner = Scanner;
  mustache.Context = Context;
  mustache.Writer = Writer;
  return mustache;
}));
text_template_profilemst = '<div class="Profile{{#class}} {{class}}{{/class}}{{#theme}} {{theme}}{{/theme}}" data-profile="profile"><a href="#" class="Profile-thumbnail" data-profile="thumbnail" style="background-image: url({{user.avatar}});" role="button" aria-haspopup="true" aria-expanded="false" aria-label="{{user.display_name}}{{user.honorific_title}}"{{#tracking}} {{tracking.dataProperty}}="{{tracking.prefix}}{{tracking.avatar}}"{{/tracking}} data-cs-mask></a><div class="Profile-dropdown" data-profile="dropdown"><a href="{{endpoint.accountURL}}" class="Profile-header" aria-label="{{strings.v}}" data-profile="header" daa-ll="View Account"><div class="Profile-data"><p class="Profile-name" data-profile="name" data-cs-mask>{{user.display_name}}{{user.honorific_title}}</p><p class="Profile-email" data-profile="email" title="{{user.email}}" data-cs-mask>{{user.email}}</p><span class="Profile-header-cta">{{strings.v}}</span></div><div class="Profile-avatar" role="link" tabindex="0"{{#strings.l}} aria-label="{{strings.l}}"{{/strings.l}} data-profile="avatar" data-url="{{endpoint.profileURL}}" style="background-image: url({{user.avatar}});" data-cs-mask></div></a>{{#behance}}<div class="Profile-applications" data-profile="applications"><ul class="Profile-menu"><li class="Profile-menu-item"><a href="{{behance}}" class="Profile-menu-link" data-profile="behance"><div class="Profile-menu-text">{{strings.b}}</div></a></li></ul></div>{{/behance}}{{#adminTemplate}}<div class="Profile-content" data-profile="links"><ul class="Profile-menu">{{#user.teamAdmin}}<li class="Profile-menu-item"><a href="{{strings.u}}" class="Profile-menu-link" daa-ll="Manage Team"><div class="Profile-menu-text">{{strings.t}}</div></a></li>{{/user.teamAdmin}}{{#user.enterpriseAdmin}}<li class="Profile-menu-item"><a href="{{strings.w}}" class="Profile-menu-link" daa-ll="Manage Enterprise"><div class="Profile-menu-text">{{strings.e}}</div></a></li>{{/user.enterpriseAdmin}}</ul></div>{{/adminTemplate}}{{#localMenu}}<div class="Profile-localLinks-menu" data-profile="local-links"><div class="Profile-localLinks-title">{{title}}</div><ul class="Profile-menu">{{#links}}<li class="Profile-menu-item"><a href="{{#hasUrl}}{{action}}{{/hasUrl}}{{^hasUrl}}#{{/hasUrl}}" class="Profile-menu-link{{#hasClass}} {{class}}{{/hasClass}}"{{#target}} target="{{target}}" rel="noopener"{{/target}}{{#analyticsID}} id="Profile.Menu.{{analyticsID}}"{{/analyticsID}}{{#description}} aria-label="{{description}}"{{/description}} data-profile="local-link"{{#analyticsProperty}} daa-ll="{{analyticsProperty}}"{{/analyticsProperty}}><div class="Profile-menu-text">{{label}}</div></a></li>{{/links}}</ul></div>{{/localMenu}}<ul class="Profile-menu"><li class="Profile-menu-item"><a href="#" class="Profile-menu-link" data-profile="sign-out" daa-ll="Sign Out"><div class="Profile-menu-text">{{strings.s}}</div></a></li></ul></div></div>';
profile = function (Config, Imslib, Lang, Request, Dom, Text, Logger, Locales, ConfigValidator, Browser, Keys, Mustache, template) {
  var _ = {
      data: null,
      labels: null,
      locale: undefined,
      event: new Dom.Events(),
      //using this instead of a real promise implementation
      ready: {
        profileLabels: false,
        profileData: false,
        checked: false,
        checkConstraint: function () {
          if (this.profileLabels && this.profileData && !this.checked) {
            this.checked = true;
            _.event.dispatchEvent(Config.events.data_ready, _.data);
          }
        }
      }
    }, Debug = new Logger(window.location.search.indexOf(Config.strings.debug) > -1), profile = {};
  /**
  * @description Since the data is retrieved from multiple places, we need to map it so it is grouped in just one object.
  * @private
  * @method mapProfileData
  * @param {Object} data - The profile data containing the avatar and team/enterprise information.
  * @param {Object} imsProfile - The profile data coming from IMS
  * @return {Object} The profile object with all the necessary properties.
  */
  _.mapProfileData = function (data, imsProfile) {
    var avatar = Lang.getPropertySafely(data, 'user.avatar'), team = Lang.getPropertySafely(data, 'sections.manage.items.team.id'), enterprise = Lang.getPropertySafely(data, 'sections.manage.items.enterprise.id'), name_id = Lang.getPropertySafely(data, 'user.name.id'), profile = {};
    profile.id = imsProfile.userId;
    profile.first_name = imsProfile.first_name;
    profile.last_name = imsProfile.last_name;
    profile.display_name = imsProfile.displayName;
    profile.name_id = name_id;
    profile.email = imsProfile.email;
    profile.avatar = avatar;
    profile.teamAdmin = !!team;
    profile.enterpriseAdmin = !!enterprise;
    return profile;
  };
  /**
  * @describe Parse menu items and make a few adjustments to the data
  * @private
  * @method mapProfileLabels
  * @param {Object} data Profile localized data
  * @returns {Object} Profile parsed localized data
  */
  _.mapProfileLabels = function (data) {
    var i, len;
    //re-add || !data.m when links are required
    if (!data || Lang.isEmptyObject(data)) {
      return undefined;
    }
    //uncomment when links are required
    // len = data.m.length;
    // for (i = 0; i < len; i++) {
    // 	if (data.m[i].c) {
    // 		data.m[i]['is' + data.m[i].c.toUpperCase()] = true; //is[cloud_icon]
    // 	}
    // 	data.m[i].o = (data.m[i].o === 'true'); //open in new window
    // 	data.m[i].h = (data.m[i].h === 'true'); //hidden
    // }
    return data;
  };
  /**
  * @description Expands the profile dropdown
  * @private
  * @method expandProfile
  */
  _.expandProfile = function () {
    var profile = document.querySelector('[data-profile="profile"]'), thumb = profile && profile.querySelector('[data-profile="thumbnail"]');
    if (!_.checkElementsExist([
        profile,
        thumb
      ])) {
      return;
    }
    // Stop execution if profile is already expanded
    if (_.isProfileExpanded()) {
      return;
    }
    // Call the analytics callback if defined
    _.executeMethodWithAnalytics({ type: 'render' }, true, function eventExpandProfileMenu() {
      // Although `remove` supports multiple arguments, IE only accepts one at a time
      profile.classList.remove('Profile-hidden');
      profile.classList.remove('Profile-collapsed');
      profile.classList.add('Profile-expanded');
      thumb.setAttribute('aria-expanded', true);
    });
  };
  /**
  * @description Collapses the profile dropdown
  * @private
  * @method collapseProfile
  */
  _.collapseProfile = function () {
    var profile = document.querySelector('[data-profile="profile"]'), thumb = profile && profile.querySelector('[data-profile="thumbnail"]');
    if (!_.checkElementsExist([
        profile,
        thumb
      ])) {
      return;
    }
    // Stop execution if profile is already hidden
    if (!_.isProfileExpanded()) {
      return;
    }
    // Call the analytics callback if defined
    _.executeMethodWithAnalytics({ type: 'hide' }, true, function eventCollapseProfileMenu() {
      profile.classList.remove('Profile-expanded');
      profile.classList.add('Profile-collapsed');
      thumb.setAttribute('aria-expanded', false);
    });
  };
  /**
  * @description Determines if the profile is currently expanded or collapsed
  * @method isProfileExpanded
  * @private
  * @return {Boolean} Whether the profile dropdown is currently in its expanded or collapsed state
  */
  _.isProfileExpanded = function () {
    var profile = document.querySelector('[data-profile="profile"]'), thumb = profile && profile.querySelector('[data-profile="thumbnail"]');
    if (!_.checkElementsExist([
        profile,
        thumb
      ])) {
      return false;
    }
    return profile.classList.contains('Profile-expanded') && thumb.getAttribute('aria-expanded') === 'true';
  };
  /**
  * @description Maps the profile data into a single object and marks
  * the profile data as being ready to use
  * @private
  * @method setProfileData
  * @param {Object} data Profile data to be mapped
  */
  _.setProfileData = function (data) {
    Imslib.getProfile().then(function (imsProfile) {
      _.data = _.mapProfileData(data, imsProfile);
      _.ready.profileData = true;
      _.ready.checkConstraint();
    }).catch(function () {
    });
  };
  /**
  * @description Performs the request to retrieve the profile data, with certain actions to be executed if the request is successful or not.
  * If there's an error with the call, it will still execute a positive callback, with limited data.
  * @private
  * @method getProfileData
  */
  _.getProfileData = function (successCallback, errorCallback) {
    var headers = { Authorization: 'Bearer ' + Imslib.getAccessToken() };
    //Prevent cache on IE
    if (Browser.isIE()) {
      headers['Cache-Control'] = 'no-cache';
      headers.Pragma = 'no-cache';
      headers.Expires = '-1';
    }
    Request.get({
      endpoint: Config.endpoints.profile,
      headers: headers,
      success: function (data) {
        if (Lang.isFunction(successCallback)) {
          successCallback(JSON.parse(data));
        }
        Debug.log(Config.messages.profile_data, _.data);
      }.bind(this),
      error: function (error) {
        if (Lang.isFunction(errorCallback)) {
          errorCallback({ user: { avatar: Config.profile.defaultAvatar } });
        }
        Debug.error(Lang.formatString(Config.messages.request_error, [Config.endpoints.profile]));
      }.bind(this)
    });
  };
  /**
  * @description Performs the request to retrieve the profile labels, with certain actions to be executed if the request is successful or not.
  * @private
  * @method getProfileLabels
  */
  _.getProfileLabels = function () {
    Request.get({
      endpoint: Lang.formatString('{0}/{1}/{2}/profile.json', [
        Config.endpoints.locales,
        window.location.hostname,
        _.locale
      ]),
      success: function (data) {
        _.labels = _.mapProfileLabels(JSON.parse(data).p);
        //when cloud link are required, add Array.isArray(_.labels.m) in the condition
        if (!Lang.isEmptyObject(_.labels)) {
          Debug.log(Config.messages.profile_labels, _.labels);
          _.ready.profileLabels = true;
          _.ready.checkConstraint();
        } else {
          _.ready.profileLabels = false;
          Debug.error(Lang.formatString(Config.messages.request_error, [Config.endpoints.locales]));
        }
      }.bind(this),
      error: function (error) {
        _.ready.profileLabels = false;
        Debug.error(Lang.formatString(Config.messages.request_error, [Config.endpoints.locales]));
      }.bind(this)
    });
  };
  /**
  * @description Checks if all the mandatory fields needed to render the profile are available.
  * @private
  * @method checkProfileData
  * @param {Object} data - The current data in the profile object.
  * @return {Boolean} <em>True</em> if all the mandatory fields exist. Otherwise, it will return <em>false</em>.
  */
  _.checkProfileData = function (data) {
    var properties = Config.profile.requiredProperties, len = properties.length, i;
    if (!data) {
      return false;
    }
    for (i = 0; i < len; i++) {
      if (!Lang.getPropertySafely(data, properties[i])) {
        Debug.warn(Lang.formatString(Config.messages.profile_data_missing, [properties[i]]));
        return false;
      }
    }
    return true;
  };
  /**
  * @description Checks if elements are present on the page, in the DOM
  * @method checkElementsExist
  * @private
  * @param {Array} elements Array of elements to be verified
  */
  _.checkElementsExist = function (elements) {
    var i, iLen;
    if (!(elements instanceof Array && elements.length > 0)) {
      return false;
    }
    iLen = elements.length;
    for (i = 0; i < iLen; i++) {
      if (!(elements[i] instanceof HTMLElement)) {
        return false;
      }
    }
    return true;
  };
  /**
  * @description Renders the profile element in the DOM.
  * @private
  * @method buildProfile
  * @param {Object} config - Configuration object containing information about additional classes, custom themes and Behance profile.
  */
  _.buildProfile = function (config) {
    console.log(config);
    var target = config.target,
      //needed for local globalnav development, since SSI vars are not available in nodejs server
      accountManagementURL = Lang.getPropertySafely(config, 'accountURL') || Config.endpoints.account, accountManagementProfileURL = Lang.getPropertySafely(config, 'accountProfileURL') || Config.endpoints.accountProfile, languageParameter = _.toAccountManagementLanguage(), profileElement, profile = {
        user: _.data,
        strings: _.labels,
        class: config.class,
        theme: config.theme,
        behance: config.behanceProfile,
        tracking: config.tracking,
        localMenu: _.localMenuData,
        endpoint: {
          accountURL: Lang.formatString(accountManagementURL, [languageParameter]),
          profileURL: Lang.formatString(accountManagementProfileURL, [languageParameter])
        }
      };
    profile.adminTemplate = Lang.getPropertySafely(profile, 'user.teamAdmin') || Lang.getPropertySafely(profile, 'user.enterpriseAdmin');
    //honorific title should be displayed only if the value from profile service - user.name.id - is set,
    //and the honorific title is defined in content (string)
    if (typeof Lang.getPropertySafely(profile, 'user.name_id') !== 'undefined' && _.labels.h) {
      profile.user.honorific_title = ' ' + _.labels.h;
    }
    Debug.log(Config.messages.build_profile);
    Debug.log(Lang.formatString(Config.messages.locale, [_.locale]));
    Debug.log(Lang.formatString(Config.messages.custom_theme, [config.theme ? config.theme : false]));
    Debug.log(Lang.formatString(Config.messages.custom_class, [config.class ? config.class : false]));
    Debug.log(Lang.formatString(Config.messages.custom_behance, [!!config.behanceProfile]));
    target.insertAdjacentHTML('afterend', Mustache.render(template, profile));
    target.parentNode.removeChild(target);
    _.formatData();
    _.setEvents();
    profileElement = document.querySelector('[data-profile="profile"]');
    if (profileElement instanceof HTMLElement) {
      profileElement.classList.add('Profile-hidden');
    }
    _.event.dispatchEvent(Config.events.profile_ready);
    // Call the analytics callback if defined. Empty function is sent for debug purposes
    _.executeMethodWithAnalytics({ type: 'init' }, true, function eventInitProfileMenu() {
    });
  };
  /**
  * @description Attaches all profile event listeners and the callbacks to be executed when they are triggered.
  * @private
  * @method setEvents
  */
  _.setEvents = function () {
    var profile = document.querySelector('[data-profile="profile"]'), dropdown = profile && profile.querySelector('[data-profile="dropdown"]'), thumb = profile && profile.querySelector('[data-profile="thumbnail"]'), header = profile && profile.querySelector('[data-profile="header"]'), logout = profile && profile.querySelector('[data-profile="sign-out"]'), localLinks = profile && profile.querySelector('[data-profile="local-links"]'), behance = profile && profile.querySelector('[data-profile="behance"]'), headerLinkNewTab = false, behanceLinkNewTab = false;
    if (!_.checkElementsExist([
        profile,
        dropdown,
        thumb,
        header,
        logout
      ])) {
      return;
    }
    Debug.log(Config.messages.build_events);
    // Initialize keyboard navigation inside the profile
    _.initKeyboardNavigation();
    // Close the profile dropdown whenever a click outside of
    // the profile area occurs
    document.addEventListener('click', function (event) {
      if (!Dom.closest(event.target, '[data-profile="profile"]') && _.isProfileExpanded()) {
        _.collapseProfile();
      }
    });
    dropdown.addEventListener('animationend', function (event) {
      if (profile.classList.contains('Profile-collapsed')) {
        profile.classList.add('Profile-hidden');
      }
    });
    // Toggle the profile dropdown visibility when the thumbnail is clicked
    thumb.addEventListener('click', function (event) {
      event.preventDefault();
      if (_.isProfileExpanded()) {
        _.collapseProfile();
      } else {
        _.expandProfile();
      }
      // Reset the focus index to the thumbnail element when it is clicked.
      // This is used by the keyboard navigation logic.
      _.focusedLinkIndex = 0;
    });
    // When clicking on the avatar image, redirect the user to his Account Profile page
    header.addEventListener('click', function (event) {
      var url;
      if (event.target.getAttribute('data-profile') === 'avatar') {
        url = event.target.getAttribute('data-url');
        if (url && url !== '') {
          event.preventDefault();
          // Call the analytics callback if defined
          _.executeMethodWithAnalytics({
            type: 'click',
            subType: 'avatar',
            event: event
          }, // this will take the user to another page, so analytics should run sync (nonBlocking = false)
          false, function eventAvatarProfileMenu() {
            window.location = url;
          });
        }
      } else {
        //Execute custom logic only if analytics is defined
        if (_.analytics && !Lang.isEmptyObject(_.analytics)) {
          headerLinkNewTab = header.getAttribute('target') === '_blank';
          //If header link needs to open in the same tab, stop default click
          if (!headerLinkNewTab) {
            event.preventDefault();
          }
          _.executeMethodWithAnalytics({
            type: 'click',
            subType: 'account',
            event: event  //If header link needs to open in a new tab analytics can execute async (nonBlocking = true), since the page won't change.
                   //Otherwise, analytics needs to execute sync (nonBlocking = true)
          }, headerLinkNewTab, function eventAccountProfileMenu() {
            var href = header.getAttribute('href');
            if (!headerLinkNewTab) {
              if (href !== '') {
                window.location = href;
              }
            }
          });
        }
      }
    });
    // When the log out button is clicked, call the IMS sign out method
    logout.addEventListener('click', function (event) {
      event.preventDefault();
      _.event.dispatchEvent(Config.events.sign_out);
      // Call the analytics callback if defined
      _.executeMethodWithAnalytics({
        type: 'click',
        subType: 'sign-out',
        event: event
      }, // this will take the user to another page, so analytics should run sync (nonBlocking = false)
      false, function eventSignOutProfileMenu() {
        Imslib.signOut();
      });
    });
    // Listen for clicks on local links and execute the
    // proper callback, depending on the config setting
    if (localLinks instanceof HTMLElement) {
      localLinks.addEventListener('click', function (event) {
        var localLink = Dom.closest(event.target, '[data-profile="local-link"]');
        if (localLink instanceof HTMLElement) {
          // Stop default event when running async
          if (localLink.getAttribute('href') === Config.strings.hashtag) {
            event.preventDefault();
          }
          // Call the analytics callback if defined
          _.executeMethodWithAnalytics({
            type: 'click',
            subType: localLink.getAttribute('id') || Config.strings.localLink,
            event: event
          }, // this might take the user to another page, so analytics should run sync (nonBlocking = false)
          false, function eventSignOutProfileMenu() {
            _.executeLocalLinkCallback(localLink, event);
          });
        }
      });
    }
    // Add listener for tracking purposes on behance element
    if (_.analytics && !Lang.isEmptyObject(_.analytics)) {
      if (behance && behance instanceof HTMLElement) {
        behance.addEventListener('click', function (event) {
          behanceLinkNewTab = behance.getAttribute('target') === '_blank';
          //If behance link needs to open in the same tab, stop default click
          if (!behanceLinkNewTab) {
            event.preventDefault();
          }
          _.executeMethodWithAnalytics({
            type: 'click',
            subType: 'behance',
            event: event  //If behance link needs to open in a new tab analytics can execute async (nonBlocking = true), since the page won't change.
                   //Otherwise, analytics need to execute sync (nonBlocking = true)
          }, behanceLinkNewTab, function eventBehanceProfileMenu() {
            var href = behance.getAttribute('href');
            if (!behanceLinkNewTab) {
              if (href !== '') {
                window.location = href;
              }
            }
          });
        });
      }
    }
  };
  /**
  * @description Listens to keyboard events inside the profile element
  * and executes the appropriate logic
  * @private
  * @method initKeyboardNavigation
  */
  _.initKeyboardNavigation = function () {
    var profile = document.querySelector('[data-profile="profile"]'), focusableLinks = profile instanceof HTMLElement && profile.querySelectorAll('a');
    // Ensure links actually exist in the profile element
    if (!(focusableLinks instanceof NodeList)) {
      return;
    }
    _.focusedLinkIndex = 0;
    // Actions to be executed when the 'esc' key is pressed.
    // The profile dropdown should be closed and the focus restored to the thumbnail.
    function handleEsc() {
      _.collapseProfile();
      _.focusedLinkIndex = 0;
      focusableLinks[0].focus();
    }
    // Actions to be executed when the 'tab' key is pressed.
    // When just 'tab' is pressed, increase the index of the currently focused element.
    // When combined with the 'shift' key, decrease the index of the currently focused element.
    function handleTab(event) {
      // Don't change the focus index if the event doesn't occur on an actual anchor element
      if (!Dom.closest(event.target, '[tabindex="0"]')) {
        if (!event.shiftKey) {
          if (_.focusedLinkIndex < focusableLinks.length - 1) {
            _.focusedLinkIndex++;
          }
        } else {
          if (_.focusedLinkIndex !== 0) {
            _.focusedLinkIndex--;
          }
        }
      }
    }
    // Actions to be executed when the 'down' key is pressed.
    // If the profile is expanded, increase the index of the currently focused element.
    // Otherwise, expand the profile and set focus to the first element in the dropdown.
    function handleDown() {
      if (_.isProfileExpanded()) {
        if (_.focusedLinkIndex < focusableLinks.length - 1) {
          _.focusedLinkIndex++;
        }
      } else {
        _.expandProfile();
        _.focusedLinkIndex = 1;
      }
      focusableLinks[_.focusedLinkIndex].focus();
    }
    // Actions to be executed when the 'up' key is pressed.
    // If the profile is expanded and focus is set to the thumbnail, close the dropdown.
    // If focus is set to another element, decrease the index of the currently focused element.
    function handleUp() {
      if (_.isProfileExpanded()) {
        if (_.focusedLinkIndex === 0) {
          _.collapseProfile();
        } else if (_.focusedLinkIndex > 0) {
          _.focusedLinkIndex--;
          focusableLinks[_.focusedLinkIndex].focus();
        }
      }
    }
    // Actions to be executed when the 'space' key is pressed.
    // When the 'space' key is pressed on a link, simulate a click on it.
    function handleSpace(event) {
      var actualLink = Dom.closest(event.target, 'a'), forcedLink = Dom.closest(event.target, '[tabindex="0"]'), link = forcedLink instanceof HTMLElement ? forcedLink : actualLink, isLinkInProfile;
      if (link instanceof HTMLElement) {
        // Ensure that the found link is part of the profile
        isLinkInProfile = Dom.closest(link, '[data-profile="profile"]');
        if (!!isLinkInProfile) {
          link.click();
        }
      }
    }
    // Actions to be executed when the 'return/enter' key is pressed.
    // Normally, the 'return' key acts like a click. But since we have
    // elements that act like links, although they're not encapsulated in anchor tags,
    // we need to ensure the same functionality for these elements as well.
    function handleReturn(event) {
      var forcedLink = Dom.closest(event.target, '[tabindex="0"]'), isLinkInProfile;
      if (forcedLink instanceof HTMLElement) {
        // Ensure that the found link is part of the profile
        isLinkInProfile = Dom.closest(forcedLink, '[data-profile="profile"]');
        if (!!isLinkInProfile) {
          forcedLink.click();
        }
      }
    }
    // Listens to keyboard events inside the profile element
    profile.addEventListener('keydown', function (event) {
      switch (event.keyCode) {
      case Keys.ESC:
        handleEsc();
        break;
      case Keys.TAB:
        handleTab(event);
        break;
      case Keys.DOWN:
        event.preventDefault();
        handleDown();
        break;
      case Keys.UP:
        event.preventDefault();
        handleUp();
        break;
      case Keys.SPACE:
        event.preventDefault();
        handleSpace(event);
        break;
      case Keys.RETURN:
        handleReturn(event);
        break;
      default:
        break;
      }
    });
  };
  /**
  * @description Adjusts style properties of the name and email elements according to the user's profile data.
  * @private
  * @method formatData
  */
  _.formatData = function () {
    var profile = document.querySelector('[data-profile="profile"]'), isProfileInitiallyHidden = profile instanceof HTMLElement && profile.classList.contains('Profile-hidden'), email = profile instanceof HTMLElement && profile.querySelector('[data-profile="email"]'), name = profile instanceof HTMLElement && profile.querySelector('[data-profile="name"]'), emailText, emailProperties, nameText, nameProperties, emailUser, emailDomain, emailArray;
    if (!_.checkElementsExist([
        profile,
        email,
        name
      ])) {
      return;
    }
    // In order for the size calculations to be performed, the profile
    // shouldn't have 'display: none;'. The style is quickly removed
    // so all calculations can be done, then re-added at the end.
    if (isProfileInitiallyHidden) {
      profile.classList.add('Profile-invisible');
    }
    // Get the user's e-mail address text and measure the space it occupies with the current styles
    emailText = email.textContent.trim();
    emailProperties = Text.getElementProperties(email, [
      'width',
      'font-family',
      'font-size',
      'font-weight'
    ]);
    // Get the user's name text and measure the space it occupies with the original styles,
    // not the ones applied by the modifier. For example, let's say we have a long name.
    // Its font-size will be decreased by the modifier class. If the user changes his name to
    // something shorter, the font-size will need to be the original one.
    nameText = name.textContent.trim();
    name.classList.remove('Profile-name_long');
    nameProperties = Text.getElementProperties(name, [
      'width',
      'font-family',
      'font-size',
      'font-weight'
    ]);
    // If the e-mail text flows on two rows, trim its two components
    // (the one before the '@' and the one after it) to be of equal length
    if (Text.measure(emailText, emailProperties) > parseFloat(emailProperties.width)) {
      emailArray = emailText.split('@');
      emailUser = emailArray[0];
      emailDomain = emailArray[1];
      Debug.log(Lang.formatString(Config.messages.format_email, [
        emailText,
        Text.truncateEmail(emailUser, emailDomain, emailProperties)
      ]));
      email.textContent = Text.truncateEmail(emailUser, emailDomain, emailProperties);
    }
    // If the name text occupies multiple lines, reduce it's font-size
    if (Text.measure(nameText, nameProperties) > parseFloat(nameProperties.width)) {
      Debug.log(Lang.formatString(Config.messages.format_name, [nameText]));
      name.classList.add('Profile-name_long');
    }
    // In order for the size calculations to be performed, the profile
    // shouldn't have 'display: none;'. The style has been removed above
    // so all calculations can be done, then re-added here.
    if (isProfileInitiallyHidden) {
      profile.classList.remove('Profile-invisible');
    }
  };
  /**
  * @description Export the list of events so one can easily add event listeners without knowing the event name.
  * @private
  * @method exportEvents
  * @example
  * //adobeProfile.addEventListener(adobeProfile.events.sign_out, function() {});
  */
  _.exportEvents = function () {
    profile.events = Config.events;
  };
  /**
  * @description Calls the IMS method that updates and returns the user's data
  * @private
  * @method updateUserProfileData
  * @param {Function} callback The method to be called after the data has been retreived
  */
  _.updateUserProfileData = function (callback) {
    // Only call the IMS user data update method if the user is signed in
    if (!Imslib.isSignedInUser()) {
      return;
    }
    // Retrieve the updated profile data
    Imslib.refreshToken(function () {
      Imslib.getProfile().then(function (imsProfile) {
        // If a callback method exists, call it with the updated user data
        if (imsProfile && Lang.isFunction(callback)) {
          callback(imsProfile);
        }
      });
    });
  };
  /**
  * @description Updates the contents of the elements holding the user's profile data (name and email)
  * and the respective fields from the publicly available _.data object
  * @private
  * @method updateUserProfileDisplay
  * @param {Object} imsData The updated user data
  */
  _.updateUserProfileDisplay = function (imsData) {
    // Find and store all the required DOM elements holding
    // the name and email data to be updated from the profile
    var profileElement = document.querySelector('[data-profile="profile"]'), emailElement = profileElement instanceof HTMLElement && profileElement.querySelector('[data-profile="email"]'), nameElement = profileElement instanceof HTMLElement && profileElement.querySelector('[data-profile="name"]');
    // Check if:
    // - the IMS data is available
    // - the locally cached and publicly available '_.data' object is defined
    // - all the required DOM elements are present on the page
    if (typeof imsData === 'object' && typeof _.data === 'object' && emailElement instanceof HTMLElement && nameElement instanceof HTMLElement) {
      // Update the '_.data' object with the new data
      _.data.email = imsData.email;
      _.data.first_name = imsData.first_name;
      _.data.last_name = imsData.last_name;
      _.data.display_name = imsData.displayName;
      // Replace the content of the elements holding the data that has been updated
      emailElement.textContent = imsData.email;
      nameElement.textContent = imsData.displayName;
      // Perform the size calculations with the new user data values
      _.formatData();
    }
  };
  /**
  * @description Retrieves the user's updated profile data and replaces it in
  * the profile view and publicly available object holding the user's data
  * @private
  * @method updateUserProfile
  */
  _.updateUserProfile = function () {
    _.updateUserProfileData(_.updateUserProfileDisplay);
  };
  /**
  * @description Calls the endpoint that updates and returns the user's avatar image
  * @private
  * @method updateUserAvatarData
  * @param {Function} callback The method to be called after the data has been retreived
  */
  _.updateUserAvatarData = function (callback) {
    var avatarData;
    // Only call the avatar endpoint if the user is signed in
    if (!Imslib.isSignedInUser()) {
      return;
    }
    // Store the updated avatar data
    function setAvatarData(data) {
      avatarData = Lang.getPropertySafely(data, 'user.avatar');
      // If a callback method exists, call it with the updated avatar data
      if (avatarData && Lang.isFunction(callback)) {
        callback(avatarData);
      }
    }
    // Call the profile endpoint to update the user's avatar image
    _.getProfileData(setAvatarData, setAvatarData);
  };
  /**
  * @description Updates the contents of the elements holding the user's avatar image
  * and the respective fields from the publicly available _.data object
  * @private
  * @method updateUserAvatarDisplay
  * @param {String} avatarData The updated avatar data
  */
  _.updateUserAvatarDisplay = function (avatarData) {
    // Find and store all the required DOM elements holding
    // the avatar data to be updated from the profile
    var profileElement = document.querySelector('[data-profile="profile"]'), thumbnailElement = profileElement instanceof HTMLElement && profileElement.querySelector('[data-profile="thumbnail"]'), avatarElement = profileElement instanceof HTMLElement && profileElement.querySelector('[data-profile="avatar"]');
    // Check if:
    // - the avatar data is available
    // - the locally cached and publicly available '_.data' object is defined
    // - all the required DOM elements are present on the page
    if (typeof avatarData === 'string' && typeof _.data === 'object' && thumbnailElement instanceof HTMLElement && avatarElement instanceof HTMLElement) {
      // Update the '_.data' object with the new data
      _.data.avatar = avatarData;
      // Replace the content of the elements holding the data that has been updated
      thumbnailElement.style.backgroundImage = 'url(' + avatarData + ')';
      avatarElement.style.backgroundImage = 'url(' + avatarData + ')';
    }
  };
  /**
  * @description Retrieves the user's updated avatar image data and replaces it in
  * the profile view and publicly available object holding the user's data
  * @private
  * @method updateUserProfile
  */
  _.updateUserAvatar = function () {
    _.updateUserAvatarData(_.updateUserAvatarDisplay);
  };
  /**
  * @description Updates the profile view and data with newly retrieved values
  * @private
  * @method update
  */
  _.update = function () {
    var updated = false, imsData, avatarData;
    // Pseudo-promise method that ensures that both the IMS and the avatar data is ready
    // before updating the profile view and publicly available cached data
    function onProfileDataReady() {
      if (!updated && imsData && avatarData) {
        // This flag is used like a throttle, to ensure that multiple
        // updates to the profile aren't being done simultaneously
        updated = true;
        // Update the profile view with the new data
        _.updateUserProfileDisplay(imsData);
        _.updateUserAvatarDisplay(avatarData);
      }
    }
    // Call the IMS endpoint to store and update the user's name and e-mail address
    _.updateUserProfileData(function (data) {
      imsData = data;
      onProfileDataReady();
    });
    // Call the avatar endpoint to store and update the user's avatar image
    _.updateUserAvatarData(function (data) {
      avatarData = data;
      onProfileDataReady();
    });
  };
  /**
  * @description Returns the corresponding Account Management supported language
  * @method toAccountManagementLanguage
  * @private
  * @returns {String} Corresponding Account Management language
  */
  _.toAccountManagementLanguage = function () {
    var formatted = Locales.getDefault(),
      // Map adobe.com locales to Account Management languages
      map = {
        'africa': 'en',
        'at': 'de',
        'au': 'en',
        'be_en': 'en',
        'be_fr': 'fr',
        'be_nl': 'nl',
        'bg': 'bg',
        'br': 'pt',
        'ca': 'en',
        'ca_fr': 'fr',
        'ch_de': 'de',
        'ch_fr': 'fr',
        'ch_it': 'it',
        'cis_en': 'en',
        'cis_ru': 'ru',
        'cn': 'zh_CN',
        'cy_en': 'en',
        'cz': 'cs',
        'de': 'de',
        'dk': 'da',
        'eeurope': 'en',
        'ee': 'et',
        'en': 'en',
        'es': 'es',
        'fi': 'fi',
        'fr': 'fr',
        'gr_en': 'en',
        'hk_en': 'en',
        'hk_zh': 'zh_TW',
        'hr': 'hr',
        'hu': 'hu',
        'ie': 'en',
        'il_en': 'en',
        'il_he': 'he',
        'in': 'en',
        'it': 'it',
        'jp': 'ja',
        'kr': 'ko',
        'la': 'es',
        'lt': 'lt',
        'lu_de': 'de',
        'lu_en': 'en',
        'lu_fr': 'fr',
        'lv': 'lv',
        'mena_ar': 'ar',
        'mena_en': 'en',
        'mena_fr': 'fr',
        'mt': 'en',
        'mx': 'es',
        'nl': 'nl',
        'no': 'nb',
        'nz': 'en',
        'pl': 'pl',
        'pt': 'pt',
        'ro': 'ro',
        'rs': 'sr',
        'ru': 'ru',
        'se': 'sv',
        'sea': 'en',
        'sg': 'en',
        'si': 'sl',
        'sk': 'sk',
        'tr': 'tr',
        'tw': 'zh_TW',
        'ua': 'ua',
        'uk': 'en'
      };
    if (!Locales.isMatch(_.locale)) {
      return formatted;
    }
    if (map[_.locale]) {
      formatted = map[_.locale];
    }
    return formatted;
  };
  /**
  * @description Executes the action defined in the local menu configuration object.
  * It will either just follow an URL or execute a callback method.
  * @method executeLocalLinkCallback
  * @private
  * @param {Object} link The link that was clicked in the local links section
  * @param {Event} event Event information related to the clicked link
  */
  _.executeLocalLinkCallback = function (link, event) {
    var linkElement, linksListElement, linkIndexInList;
    if (link instanceof HTMLElement) {
      linkElement = Dom.closest(link, 'li');
      linksListElement = Dom.closest(link, 'ul');
      if (linkElement instanceof HTMLElement && linksListElement instanceof HTMLElement && linksListElement.childNodes instanceof NodeList) {
        linkIndexInList = Array.prototype.indexOf.call(linksListElement.childNodes, linkElement);
      }
    }
    if (typeof linkIndexInList === 'number' && linkIndexInList > -1 && !Lang.isEmptyObject(_.localMenuData) && Lang.isFunction(_.localMenuData.links[linkIndexInList].action) && event instanceof Event) {
      event.preventDefault();
      _.localMenuData.links[linkIndexInList].action();
    }
  };
  /**
  * @description Checks that the local menu data provided in the configuration object is correct.
  * @method checkLocalMenuData
  * @private
  * @param {Object} data The local links configuration object provided when initialising the profile library
  * @return {Boolean} <em>True</em> if the local menu data is valid, <em>false</em> otherwise
  */
  _.isLocalMenuDataValid = function (data) {
    var isValid;
    isValid = ConfigValidator.isValid(data, {
      mandatory: {
        title: 'string',
        links: 'array'
      }
    });
    if (isValid) {
      isValid = data.links.every(function (link) {
        return ConfigValidator.isValid(link, {
          mandatory: {
            label: 'string',
            action: [
              'string',
              'function'
            ]
          },
          optional: {
            description: 'string',
            class: 'string',
            target: '^_\\w+$',
            analyticsID: 'string'
          }
        });
      });
    }
    return isValid;
  };
  /**
  * @description Maps the local menu data provided in the configuration object
  * to the format required by the template
  * @method mapLocalMenuData
  * @private
  * @param {Object} data The local menu data provided in the configuration object
  * @return {Object|undefined} The mapped data, if it is valid. 'undefined' otherwise
  */
  _.mapLocalMenuData = function (data) {
    if (data && !Lang.isEmptyObject(data)) {
      // A maximum of 7 links are allowed in the local links menu.
      // If more are provided in the config, they will be removed
      if (data.links instanceof Array && data.links.length > 0) {
        data.links = data.links.slice(0, 7);
      }
      // Check to see that all fields in the local links configuration object are valid
      if (_.isLocalMenuDataValid(data)) {
        // Since the action of a link can be either a URL or a callback method,
        // we need to be able to tell the template what to render in the 'href' attribute's value
        data.links.forEach(function (link) {
          if (typeof link.action === 'string') {
            link.hasUrl = true;
          }
          // Prevent using override class from Profile Menu
          // Class should be applied only if it's specified in the locale menu link config
          if (typeof link.class === 'string' && link.class.length) {
            link.hasClass = true;
          }
          // Set daa-ll analytics value for links
          try {
            link.analyticsProperty = link.label.replace(/\s/g, '_');
          } catch (e) {
          }
        });
        return data;
      } else {
        //TODO: move to a var
        Debug.warn('localMenu config is not valid');
      }
    }
  };
  /**
  * @description Validates and sets custom analytics callback and timeout.
  * This will support Ingest API and will have limited usage.
  * @method setupCustomAnalytics
  * @private
  * @param {Object} config Profile configuration object
  */
  _.setupCustomAnalytics = function (config) {
    var timeout, callback;
    if (config.analytics && !Lang.isEmptyObject(config.analytics)) {
      timeout = parseInt(config.analytics.timeout, 10);
      callback = Lang.isFunction(config.analytics.callback) ? config.analytics.callback : undefined;
      if (Dom.isInteger(timeout) && typeof callback !== 'undefined') {
        _.analytics = {
          callback: callback,
          timeout: timeout < Config.analytics.timeout ? timeout : Config.analytics.timeout
        };
      }
    }
  };
  /**
  * @description Executes a given method together with analytics callback if that's defined.
  * If no analytics callback is defined, the method will be executed direclty.
  * If analytics callback and timeout are defined, there are multiple use cases:
  * 1. the method has an "in-page" action (e.g. expand/ collapse profile): it will be executed directly, then the callback is executed
  * Since the user does not leave the page, the callback (tracking) can be executed async.
  * 2. the method takes the user to another page (e.g. manage account): a timeout will be set and the callback will be executed.
  * Whichever is done first will execute the original method.
  * @method executeMethodWithAnalytics
  * @private
  * @param  {Object} data        Tracking data to be sent to callback
  * @param  {Boolean} nonBlocking Method has an in-page (nonBlocking) action or takes the user to another page (blocking)
  * @param  {Function} method    Method to be executed
  */
  _.executeMethodWithAnalytics = function (data, nonBlocking, method) {
    var executed = false, timeout;
    // Set a function for all use-cases
    function executeMethod(debug) {
      if (executed) {
        return;
      }
      method();
      executed = true;
      Debug.log(Lang.formatString(Config.messages.method_executed, [
        method.name,
        debug
      ]));
    }
    if (Lang.isEmptyObject(_.analytics)) {
      // Analytics is not configured, execute the original method without any delay
      executeMethod(0);
    } else {
      // Analytics is configured; if the method is a page action (open, hide the profile), it can be executed directly.
      // If the method will redirect to another page, set a timeout and execute the callback
      // Need to make sure that once the original method is executed, it won't be executed again
      if (nonBlocking) {
        executeMethod(1);
      } else {
        timeout = setTimeout(function () {
          executeMethod(2);
        }, _.analytics.timeout);
      }
      _.analytics.callback.apply(null, [
        data,
        function () {
          // this is the equivalent of clear - if the callback is successful faster than timeout,
          // execute the original method and clear the timeout.
          executeMethod(3);
          clearTimeout(timeout);
        }
      ]);
    }
  };
  /**
  * @description Method to initialize the profile. It checks if it has the mandatory configuration properties,
  *              it retrieves the profile data and checks if it is correct and then renders the profile element.
  *              This method can only be called once, since it is deleted from the interface after it is first used.
  * @method init
  * @param {Object} config - Configuration object for setting different options to customize the profile.
  * @param {Object} config.target - DOM element where the profile should be rendered.
  * @param {String} [config.locale] Profile locale
  * @param {String} [config.theme] - The theme to be used for the profile. Current options are <em>'theme-grey'</em> and <em>'theme-dark'</em>.
  * If it is not provided, the default theme (white) will be used.
  * @param {String} [config.class] - Additional custom class to be added to the root profile element.
  * @param {String} [config.behanceProfile] - The URL to the user's Behance profile. If not specified, then the Behance section will not be rendered.
  * @param {Object} [config.data] - Specifies the data to be used to render the user's profile, if the data has already been cached locally.
  * If not passed, then the data will be automatically retrieved from the proper endpoint.
  * @param {Object} [config.labels] Optional localised content (used for integration with globalnav only)
  * @param {Object} [config.tracking] Optional tracking attributes
  * @param {Object} [config.localMenu] Configuration object for the local links section
  */
  profile.init = function (config) {
    console.log(config);
    var data, labels;
    if (!config || Lang.isEmptyObject(config)) {
      Debug.error(Config.messages.no_config);
      return;
    }
    if (!config.target || !(config.target instanceof HTMLElement)) {
      Debug.error(Config.messages.no_target);
      return;
    }
    if (Lang.isEmptyObject(window.adobeIMS)) {
      Debug.error(Config.messages.imslib);
      return;
    }
    if (!config.locale || !Locales.isMatch(config.locale)) {
      config.locale = Locales.getDefault();
    }
    _.locale = config.locale;
    data = config.data || _.data;
    labels = _.mapProfileLabels(config.labels) || _.labels;
    // Ensure proper format of the local menu configuration object
    _.localMenuData = _.mapLocalMenuData(config.localMenu);
    if (_.checkProfileData(data)) {
      Debug.log(Lang.formatString(Config.messages.request_data, [config.data ? Config.messages.config : Config.messages.storage]));
      _.data = data;
      Debug.log(Config.messages.profile_data, _.data);
      setTimeout(function () {
        _.ready.profileData = true;
        _.ready.checkConstraint();
      }, 0);
    } else {
      Debug.log(Lang.formatString(Config.messages.request_data, [Config.endpoints.profile]));
      _.getProfileData(_.setProfileData, _.setProfileData);
    }
    if (labels && !Lang.isEmptyObject(labels)) {
      Debug.log(Lang.formatString(Config.messages.request_data, [config.data ? Config.messages.config : Config.messages.storage]));
      _.labels = labels;
      Debug.log(Config.messages.profile_labels, _.labels);
      setTimeout(function () {
        _.ready.profileLabels = true;
        _.ready.checkConstraint();
      }, 0);
    } else {
      Debug.log(Lang.formatString(Config.messages.request_data, [Config.endpoints.locales]));
      _.getProfileLabels();
    }
    this.addEventListener(Config.events.data_ready, function () {
      var targetRemovedFromDOM = false, targetParent;
      if (!config.target || !(config.target instanceof HTMLElement)) {
        //target is not a valid DOM element
        targetRemovedFromDOM = true;
      } else {
        //target is a valid DOM element, check if it's still attached to parent
        targetParent = config.target.parentElement;
        if (!targetParent || !(targetParent instanceof HTMLElement)) {
          //target got removed from the DOM
          targetRemovedFromDOM = true;
        }
      }
      //prevent the Profile Menu from throwing an error if the target gets removed from DOM
      if (targetRemovedFromDOM) {
        Debug.error(Config.messages.no_target);
        return;
      }
      _.buildProfile(config);
    });
    _.setupCustomAnalytics(config);
    _.exportEvents();
    delete this.init;
  };
  /**
  * @description Method to add new event listeners to the profile, on top of the ones already defined.
  * @method addEventListener
  * @param {String} event - The type of event that should be listened for.
  * @param {Function} callback - The action to execute when the event is fired.
  */
  profile.addEventListener = function (event, callback) {
    _.event.addEventListener(event, callback);
  };
  /**
  * @description Method that logs and returns the current user profile data; object.
  * @method getUserProfile
  * @return {Object} The current user profile data used for rendering.
  */
  profile.getUserProfile = function () {
    Debug.log(Config.messages.profile_data, _.data);
    return _.data;
  };
  /**
  * @description Opens the profile
  * @method expand
  */
  profile.expand = function () {
    _.expandProfile();
  };
  /**
  * @description Closes the profile
  * @method collapse
  */
  profile.collapse = function () {
    _.collapseProfile();
  };
  /**
  * @description Updates the profile view and data with the updated values
  * @method update
  */
  profile.update = function () {
    _.update();
  };
  /**
  * @description Updates the profile view and data with
  * the updated name and e-mail address values
  * @method updateProfile
  */
  profile.updateProfile = function () {
    _.updateUserProfile();
  };
  /**
  * description] Updates the profile view and data with the updated avatar image
  * @method updateAvatar
  */
  profile.updateAvatar = function () {
    _.updateUserAvatar();
  };
  return profile;
}(Config, utils_Imslib, utils_Lang, utils_Request, utils_Dom, utils_Text, utils_Logger, utils_Locales, utils_ConfigValidator, utils_Browser, keyboard_Keys, mustache, text_template_profilemst);
window.adobeProfile=profile;
}());