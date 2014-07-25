'use strict';
/* global getHashAndSalt: false */

angular.module('openhimWebui2App')
  .controller('ProfileCtrl', function ($scope, Api, login) {

    var consoleSession = localStorage.getItem('consoleSession');
    consoleSession = JSON.parse(consoleSession);
    $scope.consoleSession = consoleSession;


    $scope.user =  Api.Users.get({ email: $scope.consoleSession.sessionUser }, function (userProfile) {
      return userProfile;
    });

    var done = function () {
      // reset backing object and refresh user profile
      Api.Users.get({ email: $scope.consoleSession.sessionUser }, function (userProfile) {
        $scope.user = userProfile;
      });
      $scope.alerts = [];
      $scope.alerts.push({ type: 'success', msg: 'Your profile was successfully updated!' });
    };

    var saveUser = function (user,email,password) {
      user.$update(function () {
        if (password !== '') {
          //re-login with new credentials
          login.login(email, password, function (loggedIn) {
            $scope.alerts = [];
            if (loggedIn) {
              done();
            } else {
              $scope.alerts.push({ type: 'danger', msg: 'Failed to re - login' });
            }
          });
        } else {
          done();
        }
      });
    };

    var setHashAndSave = function (user, hash, salt,email,password) {
      if (typeof salt !== 'undefined' && salt !== null) {
        user.passwordSalt = salt;
      }
      user.passwordHash = hash;
      saveUser(user,email,password);
    };

    $scope.save = function (user, password) {
      if (password) {
        var h = getHashAndSalt(password);
        user.passwordAlgorithm = h.algorithm;
        setHashAndSave(user, h.hash, h.salt,user.email,password);
      } else {
        saveUser(user,'','');
      }
    };

    $scope.isUserValid = function (user, password, passwordRetype) {
      return  !(password && password !== passwordRetype);
    };
  });
