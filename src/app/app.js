'use strict';

angular.module('moment', [
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
      .state('dashboard', {
        url: '/',
        templateUrl: 'app/dashboard/dashboard.tpl.html',
        controller: 'DashboardCtrl',
        controllerAs: 'DashboardCtrl'
      });
  })
  .constant('MOMENT_CONFIG', MOMENT_CONFIG);
