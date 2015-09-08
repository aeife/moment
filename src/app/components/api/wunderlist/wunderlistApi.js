'use strict';

angular.module('moment.components.api.wunderlist', [])
  .config(function($httpProvider) {
      $httpProvider.interceptors.push('wunderlistAuthInterceptor');
  })
  .service('wunderlistAuthInterceptor', function(AccessToken) {
      return {
          'request': function(config) {
              if(config.url.indexOf('a.wunderlist.com/api/v1/') !== -1) {
                if (!!AccessToken.get()) {
                  config.headers['X-Access-Token'] = AccessToken.get().access_token;
                  config.headers['X-Client-ID'] = 'a9b289a663deb74050b2';
                }
              }
              return config;
          }
      };
  })
  .service('wunderlistApi', function ($http) {
    var wunderlistApi = {
      getCurrentUser: function () {
        return $http({
          method: 'GET',
          url: 'https://a.wunderlist.com/api/v1/user',
        });
      },
      getAllLists: function () {
        return $http({
          method: 'GET',
          url: 'https://a.wunderlist.com/api/v1/lists',
        });
      },
      getAllTasksForList: function (list) {
        return $http({
          method: 'GET',
          url: 'https://a.wunderlist.com/api/v1/tasks',
          params: {
            list_id: list.id
          }
        });
      },
      updateTask: function (task) {
        return $http({
          method: 'PATCH',
          url: 'https://a.wunderlist.com/api/v1/tasks/' + task.id,
          data: task
        });
      },
      deleteTask: function (task) {
        return $http({
          method: 'DELETE',
          url: 'https://a.wunderlist.com/api/v1/tasks/' + task.id,
          params: {
            revision: task.revision
          }
        });
      },
      getAllRemindersForList: function (list) {
        return $http({
          method: 'GET',
          url: 'https://a.wunderlist.com/api/v1/reminders',
          params: {
            list_id: list.id
          }
        });
      },
      createReminderForTask: function (task, date) {
        return $http({
          method: 'POST',
          url: 'https://a.wunderlist.com/api/v1/reminders',
          data: {
            task_id: task.id,
            date: date
          }
        });
      }
    };

    return wunderlistApi;
  });
