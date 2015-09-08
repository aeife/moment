'use strict';

angular.module('moment.home', ['oauth'])
  .controller('HomeCtrl', function (AccessToken) {
    var HomeCtrl = this;
    
    HomeCtrl.isLoggedIn = function () {
      return !!AccessToken.get();
    }
  });
