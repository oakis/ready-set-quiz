app.config(function($stateProvider,$urlRouterProvider) {
  $stateProvider
  .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html"
  })
  .state('tab.home', {
    url: '/home',
    views: {
      'tab-home': {
        templateUrl: 'templates/home.html',
        controller: 'HomeCtrl'
      }
    }
  })
  .state('tab.game', {
    url: '/game',
    views: {
      'tab-game': {
        templateUrl: 'templates/game.html',
        controller: 'GameCtrl'
      }
    }
  })
  .state('tab.profile', {
    url: '/profile',
    views: {
      'tab-profile': {
        templateUrl: 'templates/profile.html',
        controller: 'ProfileCtrl'
      }
    }
  })
  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })
  .state('register', {
    url: '/register',
    templateUrl: 'templates/register.html',
    controller: 'RegCtrl'
  })
  .state('tab.highscore', {
    url: '/highscore',
    views: {
      'tab-home': {
        templateUrl: 'templates/highscore.html',
        controller: 'HighscoreCtrl'
      }
    }
  })
  .state('tab.addQuestion', {
    url: '/addquestion',
    views: {
      'tab-profile': {
        templateUrl: 'templates/question.add.html',
        controller: 'ProfileCtrl'
      }
    }
  })
  .state('tab.admin', {
    url: '/admin',
    views: {
      'tab-profile': {
        templateUrl: 'templates/admin.html',
        controller: 'AdminCtrl'
      }
    }
  })
  .state('tab.settings', {
    url: '/settings',
    views: {
      'tab-profile': {
        templateUrl: 'templates/settings.html',
        controller: 'SettingsCtrl'
      }
    }
  });
  $urlRouterProvider.otherwise('/login');
});