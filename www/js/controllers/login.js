app.controller('LoginCtrl', function($scope,$http,$ionicPopup,$state,$localStorage){

  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.username = $localStorage.username;
    $scope.loggedIn = $localStorage.loggedIn;
    $scope.role = $localStorage.role;
    $http.defaults.headers.common['x-access-token'] = $localStorage.token;
    if ($localStorage.loggedIn) {
      $state.go('tab.home');
    }
  })

  $scope.data = {};

  $scope.login = function () {

    $http({
      url: serverUrl+'/login',
      method: 'post',
      data: {
        'username': $scope.data.username,
        'password': $scope.data.password
      }
    }).then(loginSuccess,error);
  }

  function loginSuccess (res) {
    if (res.data.success) {
      // set username, loggedin etc
      $localStorage.token = res.data.token;
      $localStorage.username = res.data.username;
      $localStorage.loggedIn = true;
      $localStorage.role = res.data.role;
      $http.defaults.headers.common['x-access-token'] = $localStorage.token;
      // go to profile
      $state.go('tab.profile');
    } else {
      $ionicPopup.alert({
        title: 'Inloggning misslyckad',
        template: 'Fel användarnamn eller lösenord.'
      });
    }
  }

});