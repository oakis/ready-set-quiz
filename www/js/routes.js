app.config(function($stateProvider,$urlRouterProvider) {
  $urlRouterProvider.otherwise('/home');
  $stateProvider
  .state('index', {
    url: '/',
    templateUrl: 'index.html',
    controller: 'IndexCtrl'
  })
  .state('question', {
    url: '/question',
    templateUrl: 'templates/question.html',
    controller: 'QuestionCtrl'
  })
  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })
  .state('profile', {
    url: '/profile',
    templateUrl: 'templates/profile.html',
    controller: 'ProfileCtrl'
  })
  .state('home', {
    url: '/home',
    templateUrl: 'templates/home.html',
    controller: 'HomeCtrl'
  })
  .state('register', {
    url: '/register',
    templateUrl: 'templates/register.html',
    controller: 'RegCtrl'
  });
});