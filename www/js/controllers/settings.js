app.controller('SettingsCtrl', function($scope,$http,$localStorage){

  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.username = $localStorage.username;
    $scope.loggedIn = $localStorage.loggedIn;
    $scope.role = $localStorage.role;
    $http.defaults.headers.common['x-access-token'] = $localStorage.token;
    $scope.sound = $localStorage.sound;
    $scope.music = $localStorage.music;
  })

  $scope.saveSound = function () {
    if ($localStorage.sound) {
      $localStorage.sound = false;
    } else {
      $localStorage.sound = true;
    }
  }

  $scope.saveMusic = function () {
    if ($localStorage.music) {
      $localStorage.music = false;
    } else {
      $localStorage.music = true;
    }
  }

});