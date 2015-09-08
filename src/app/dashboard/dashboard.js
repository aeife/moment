'use strict';

angular.module('moment.dashboard', ['oauth', 'ngFitText', 'moment.components.api.wunderlist'])
  .controller('DashboardCtrl', function ($rootScope, $http, $q, $timeout, wunderlistApi, AccessToken) {
    var DashboardCtrl = this;

    DashboardCtrl.listByTaskId = {};

    var _collectTodaysTasks = function () {
      DashboardCtrl.todaysTasks = [];

      DashboardCtrl.lists.forEach(function (list) {
        DashboardCtrl.todaysTasks = DashboardCtrl.todaysTasks.concat(list.tasks);

        list.tasks.forEach(function (task) {
          DashboardCtrl.listByTaskId[task.id] = list;
        });
      });

      DashboardCtrl.todaysTasks = DashboardCtrl.todaysTasks.filter(function (task) {
        var today = new Date();
        var taskDueDate = new Date(task.due_date);

        // TODO: also include past dates, today >= taskDueDate

        return  (task.due_date) &&
                (today.getUTCFullYear() === taskDueDate.getUTCFullYear()) &&
                (today.getUTCMonth() === taskDueDate.getUTCMonth()) &&
                (today.getUTCDate() === taskDueDate.getUTCDate()+1);
      });

      DashboardCtrl.focusedTasks = [DashboardCtrl.todaysTasks[0]];
    }

    var _fetchLists = function () {
      wunderlistApi.getAllLists().then(function (res) {
        DashboardCtrl.lists = res.data;

        var requests = [];
        DashboardCtrl.lists.forEach(function (list) {
          requests.push(wunderlistApi.getAllTasksForList(list).then(function (res) {
            list.tasks = res.data;
          }));
        });

        $q.all(requests).then(function () {
          _collectTodaysTasks();
        });
      });
    }

    var _nextTask = function () {
      DashboardCtrl.todaysTasks.shift();
      DashboardCtrl.focusedTasks.pop();

      DashboardCtrl.showPostponeSubActions = false;

      if (!DashboardCtrl.todaysTasks.length) {
        DashboardCtrl.allDone = true;
      } else {
        DashboardCtrl.focusedTasks.push(DashboardCtrl.todaysTasks[0]);
      }
    }


    DashboardCtrl.resolveTask = function () {
      var task = DashboardCtrl.focusedTasks[0];
      task.completed = true;
      wunderlistApi.updateTask(task).then(function () {
        _nextTask();
      });
    };

    DashboardCtrl.deleteTask = function () {
      var task = DashboardCtrl.focusedTasks[0];
      wunderlistApi.deleteTask(task).then(function () {
        _nextTask();
      });
    };

    DashboardCtrl.postponeTask = function (dayCount) {
      var task = DashboardCtrl.focusedTasks[0];
      var taskDueDate = new Date(task.due_date);
      var postponedDate = new Date(taskDueDate.setUTCDate(taskDueDate.getUTCDate() + dayCount + 1));
      task.due_date = postponedDate.toISOString().split('T')[0];

      wunderlistApi.updateTask(task).then(function () {
        _nextTask();
      });
    };

    DashboardCtrl.todayTask = function () {
      _nextTask();
    };

    DashboardCtrl.showPostponeSubActions = false;

    if (!!AccessToken.get()) {
      _fetchLists();
    } else {
      var listener = $rootScope.$watch(function () {
        return !!AccessToken.get();
      }, function(value) {
        if (value) {
          _fetchLists();
          listener();
        }
      });
    }

    $timeout(function () {
      DashboardCtrl.displayContent = true;
    }, 1.500);
  });
