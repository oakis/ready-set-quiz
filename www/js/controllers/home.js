app.controller('HomeCtrl', function($scope,$http,$ionicPopup,$state,$localStorage){

  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.username = $localStorage.username;
    $scope.loggedIn = $localStorage.loggedIn;
    $scope.role = $localStorage.role;
    $http.defaults.headers.common['x-access-token'] = $localStorage.token;
    if ($localStorage.sound == undefined) {
      $localStorage.sound = true;
    } else if ($localStorage.music == undefined) {
      $localStorage.music = true;
    }
  })

  $scope.$on('$ionicView.beforeEnter', function() {
    $http.get(serverUrl+'/stats').then(statsSuccess, error);
  })

  function statsSuccess (res) {
    $scope.stats = res.data;
  }

  $scope.logout = function () {
    $localStorage.username = null;
    $localStorage.loggedIn = null;
    $localStorage.role = null;
    $localStorage.token = null;
    $ionicPopup.alert({
      title: 'Utloggning lyckad',
      template: 'Du är nu utloggad. Välkommen åter!'
    }).then(
      $state.go('login', {}, {reload: true})
    );
  }

});