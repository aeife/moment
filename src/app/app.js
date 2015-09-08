'use strict';

angular.module('moment', [
  'moment.home',
  'moment.nav',
  'moment.dashboard',
  'ngAnimate',
  'ui.router',
  'ui.bootstrap'
  ])
  .config(function ($locationProvider, $stateProvider, $compileProvider) {
    if (MOMENT_CONFIG.ENVIRONMENT === 'PRODUCTION') {
      $compileProvider.debugInfoEnabled(false);
    }

    $locationProvider.html5Mode(true).hashPrefix('!');

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'app/home/home.tpl.html',
        controller: 'HomeCtrl',
        controllerAs: 'HomeCtrl'
      })
      .state('dashboard', {
        templateUrl: 'app/dashboard/dashboard.tpl.html',
        controller: 'DashboardCtrl',
        controllerAs: 'DashboardCtrl'
      });
  })
  .run(function ($rootScope, $state) {
    $rootScope.$on('oauth:logout', function () {
      $state.go('home');
    });
  })
  .constant('MOMENT_CONFIG', MOMENT_CONFIG);
