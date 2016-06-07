app.controller('RegCtrl', function($scope,$http,$ionicPopup,$state,$localStorage){

  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.username = $localStorage.username;
    $scope.loggedIn = $localStorage.loggedIn;
    $scope.role = $localStorage.role;
    $http.defaults.headers.common['x-access-token'] = $localStorage.token;
    $scope.doLogin = {};
    $scope.doLogin.user;
    $scope.doLogin.pw;
  })

  $scope.register = function (username, email, pw, pw2) {
    var checkEmail = new RegExp('[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}', 'i');
    if (!username) {
      $ionicPopup.alert({
        title: 'Registrering misslyckad',
        template: 'Var god fyll i ett användarnamn.'
      });
    } else if (!email || !checkEmail.test(email)) {
      $ionicPopup.alert({
        title: 'Registrering misslyckad',
        template: 'Var god fyll i en giltig email.'
      });
    } else if (!pw && !pw2) {
      $ionicPopup.alert({
        title: 'Registrering misslyckad',
        template: 'Var god fyll i ett lösenord.'
      });
    } else if (pw != pw2) {
      $ionicPopup.alert({
        title: 'Registrering misslyckad',
        template: 'Lösenorden matchar inte, försök igen.'
      });
    } else {
      $scope.doLogin.user = username;
      $scope.doLogin.pw = pw;
      $http.post(serverUrl+'/register', { 'username': username, 'password': pw, 'email': email }).then(successReg, error);
    }
  }

  function successReg (res) {
    if (res.data.success) {
      $http({
        url: serverUrl+'/login',
        method: 'post',
        data: {
          'username': $scope.doLogin.user,
          'password': $scope.doLogin.pw
        }
      }).then(function(res){
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
      },error);
    } else if (res.data.exists && res.data.error === 'username') {
      $ionicPopup.alert({
        title: 'Registrering misslyckad',
        template: 'Det finns redan en användare registrerad med användarnamn '+res.data.user+'.'
      });
    } else if (res.data.exists && res.data.error === 'email') {
      $ionicPopup.alert({
        title: 'Registrering misslyckad',
        template: 'Det finns redan en användare registrerad med emailen '+res.data.email+'.'
      });
    } else {
      $ionicPopup.alert({
        title: 'Registrering misslyckad',
        template: 'Serverfel.'
      });
    }
  }

});