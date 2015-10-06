'use strict';

module.exports = {

  /**
   * validates the userInput to see if a appName was entered
   * @param  {string} userInput input of user
   * @return {boolean|string}   true if ok, string if failed
   */
  validateAppName: function (userInput) {
    return userInput ? true : 'Please enter a name';
  },

  /**
   * validates the userInput to see if a valid bundle identifier was entered
   * @param  {string} userInput input of user
   * @return {boolean|string}   true if ok, string if failed
   */
  validateAppId: function (userInput) {
    var pattern = /^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+[0-9a-z_]$/i;
    return pattern.test(userInput) ? true : 'Please enter a valid bundle identifier! E.g. com.company.project';
  }

};
