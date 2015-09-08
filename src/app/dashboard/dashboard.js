'use strict';

angular.module('moment.dashboard', ['oauth', 'ngFitText', 'moment.components.api.wunderlist'])
  .controller('DashboardCtrl', function ($rootScope, $http, $q, $timeout, wunderlistApi, AccessToken) {
    var DashboardCtrl = this;

    DashboardCtrl.listByTaskId = {};
    DashboardCtrl.remindersByTaskId = {};

    var _collectTodaysTasks = function () {
      DashboardCtrl.todaysTasks = [];

      DashboardCtrl.lists.forEach(function (list) {
        DashboardCtrl.todaysTasks = DashboardCtrl.todaysTasks.concat(list.tasks);

        list.tasks.forEach(function (task) {
          DashboardCtrl.listByTaskId[task.id] = list;
        });

        list.reminders.forEach(function (reminder) {
          if (!DashboardCtrl.remindersByTaskId[reminder.task_id]) {
            DashboardCtrl.remindersByTaskId[reminder.task_id] = [];
          }
          DashboardCtrl.remindersByTaskId[reminder.task_id].push(reminder);
        });
      });

      DashboardCtrl.todaysTasks = DashboardCtrl.todaysTasks.filter(function (task) {
        var today = new Date();
        today = new Date(today.getUTCFullYear() + '-' + (today.getUTCMonth()+1) + '-' + today.getUTCDate());
        var taskDueDate = new Date(task.due_date);
        task.$overdue = taskDueDate < today;
        return  (task.due_date) && (taskDueDate <= today);
      });

      DashboardCtrl.focusedTasks = [DashboardCtrl.todaysTasks[0]];

      console.log(DashboardCtrl.remindersByTaskId);
    }

    var _fetchLists = function () {
      wunderlistApi.getAllLists().then(function (res) {
        DashboardCtrl.lists = res.data;

        var requests = [];
        DashboardCtrl.lists.forEach(function (list) {
          requests.push(wunderlistApi.getAllTasksForList(list).then(function (res) {
            list.tasks = res.data;
          }));
          requests.push(wunderlistApi.getAllRemindersForList(list).then(function (res) {
            list.reminders = res.data;
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
      DashboardCtrl.showTodaySubActions = false;

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

      if (!dayCount) {
        task.remove = ['due_date'];
      } else {
        var postponeDate = new Date(taskDueDate.setUTCDate(taskDueDate.getUTCDate() + dayCount + 1));
        task.due_date = postponedDate.toISOString().split('T')[0];
      }

      wunderlistApi.updateTask(task).then(function () {
        _nextTask();
      });

      // TODO: remove reminder on postpone?
    };

    DashboardCtrl.todayTask = function () {
      var task = DashboardCtrl.focusedTasks[0];

      if (!DashboardCtrl.remindersByTaskId[task.id]) {
        DashboardCtrl.showPostponeSubActions = false;
        DashboardCtrl.showTodaySubActions = true;
      } else {
        _nextTask();
      }
    };

    DashboardCtrl.remindTask = function (hours) {
      if (!hours) {
        _nextTask();
        return;
      }
      
      var task = DashboardCtrl.focusedTasks[0];

      var date = new Date();
      date.setHours(date.getHours() + hours);

      wunderlistApi.createReminderForTask(task, date).then(function () {
        _nextTask();
      });
    };

    DashboardCtrl.showPostponeSubActions = false;
    DashboardCtrl.showTodaySubActions = false;

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
