'use strict';

angular.module('moment.nav', ['oauth', 'moment.components.api.wunderlist'])
  .directive('momentNav', function () {
    return {
      templateUrl: 'app/nav/nav.tpl.html',
      controller: 'NavCtrl',
      controllerAs: 'NavCtrl'
    };
  })
  .controller('NavCtrl', function ($rootScope, AccessToken, wunderlistApi, $state) {
    var NavCtrl = this;

    var _fetchUserData = function () {
      wunderlistApi.getCurrentUser().then(function (res) {
        NavCtrl.user = res.data;
      });
    };

    NavCtrl.isLoggedIn = function () {
      return !!AccessToken.get();
    }

    NavCtrl.displayHomeLink = function () {
      return $state.current.name === 'about';
    }

    if (!!AccessToken.get()) {
      _fetchUserData();
    } else {
      var listener = $rootScope.$watch(function () {
        return !!AccessToken.get();
      }, function(value) {
        if (value) {
          _fetchUserData();
          listener();
        }
      });
    }
  });
