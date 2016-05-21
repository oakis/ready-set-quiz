app.controller('QuestionCtrl', function($scope,$http,$state,$ionicLoading,$localStorage){

  $scope.$on('$ionicView.enter', function() {
    $scope.username = $localStorage.username;
    $scope.loggedIn = $localStorage.loggedIn;
  })
  
  $scope.$on('$ionicView.enter', function() {
    /*$ionicLoading.show({
      template: 'Loading...',
      noBackdrop: true
    });*/
    $http.get(serverUrl+'/question').then(getSuccess, error);
  })

  $scope.questions = [];
  $scope.currentQuestion = 0;
  $scope.score = 0;
  $scope.message;

  $scope.answer = function (index) {
    var correct = $scope.questions[$scope.currentQuestion].answer;
    var userAnswer = $scope.questions[$scope.currentQuestion].choices[index];
    $scope.userClicked = true;

    if (correct !== userAnswer) {
      this.class = 'button-assertive';
      correct.class = 'button-balanced';
    } else {
      this.class = 'button-balanced';
      $scope.score += 1;
    }
    console.log($scope.score)

  }

  $scope.next = function () {
    if ($scope.currentQuestion != $scope.questions.length-1) {
      $scope.currentQuestion += 1;
      $scope.userClicked = false;
    } else {
      $http.post(serverUrl+'/userscore/', { username: $scope.username, newScore: $scope.score }).then(postSuccess, error);
      $scope.gameOver = true;
    }
  }

  $scope.quit = function () {
    $scope.questions = [];
    $scope.currentQuestion = 0;
    $scope.score = 0;
    $scope.message;
    $scope.gameOver = false;
    $state.go('home');
  }

  function getSuccess (res) {
    $scope.questions = [];
    for (q of res.data.question) {
      $scope.questions.push({
        _id: q._id,
        question: q.question,
        choices: shuffleArray(q.choices),
        answer: q.answer
      });
    }
  }

  function postSuccess (res) {
    $scope.newScore = res.data.newScore;
  }
  
});

app.controller('ProfileCtrl', function($scope,$http,$localStorage){
  
  $scope.userData;
  $scope.username = $localStorage.username;
  $scope.loggedIn = $localStorage.loggedIn;

  $scope.$on('$ionicView.enter', function() {
    $http.get(serverUrl+'/user/'+$scope.username).then(userSuccess, error);
  });

  function userSuccess (res) {
    $scope.userData = res.data.user;
  }

});

app.controller('LoginCtrl', function($scope,$http,$ionicPopup,$state,$localStorage){

  $scope.$on('$ionicView.enter', function() {
    $scope.username = $localStorage.username;
    $scope.loggedIn = $localStorage.loggedIn;
  })

  $scope.login = function (username,password) {
    $http({
      url: serverUrl+'/login',
      method: 'post',
      data: {
        'username': username,
        'password': password
      }
    }).then(loginSuccess,error);
  }

  function loginSuccess (res) {
    if (res.data.success) {
      $http.defaults.headers.common['x-access-token'] = res.data.token;
      // set username, loggedin etc
      $localStorage.username = res.data.username;
      $localStorage.loggedIn = true;
      // go to profile
      $state.go('profile');
    } else {
      $ionicPopup.alert({
        title: 'Inloggning misslyckad',
        template: 'Fel användarnamn eller lösenord.'
      });
    }
  }

  // This is the success callback from the login method
  var fbLoginSuccess = function(response) {
    if (!response.authResponse){
      fbLoginError("Cannot find the authResponse");
      return;
    }

    var authResponse = response.authResponse;

    getFacebookProfileInfo(authResponse)
    .then(function(profileInfo) {
      // For the purpose of this example I will store user data on local storage
      UserService.setUser({
        authResponse: authResponse,
        userID: profileInfo.id,
        name: profileInfo.name,
        email: profileInfo.email,
        picture : "http://graph.facebook.com/" + authResponse.userID + "/picture?type=large"
      });
      $ionicLoading.hide();
      $state.go('app.home');
    }, function(fail){
      // Fail get profile info
      console.log('profile info fail', fail);
    });
  };

  // This is the fail callback from the login method
  var fbLoginError = function(error){
    console.log('fbLoginError', error);
    $ionicLoading.hide();
  };

  // This method is to get the user profile info from the facebook api
  var getFacebookProfileInfo = function (authResponse) {
    var info = $q.defer();

    facebookConnectPlugin.api('/me?fields=email,name&access_token=' + authResponse.accessToken, null,
      function (response) {
        console.log(response);
        info.resolve(response);
      },
      function (response) {
        console.log(response);
        info.reject(response);
      }
    );
    return info.promise;
  };

  //This method is executed when the user press the "Login with facebook" button
  $scope.facebookSignIn = function() {
    facebookConnectPlugin.getLoginStatus(function(success){
      if(success.status === 'connected'){
        // The user is logged in and has authenticated your app, and response.authResponse supplies
        // the user's ID, a valid access token, a signed request, and the time the access token
        // and signed request each expire
        console.log('getLoginStatus', success.status);

        // Check if we have our user saved
        var user = UserService.getUser('facebook');

        if(!user.userID){
          getFacebookProfileInfo(success.authResponse)
          .then(function(profileInfo) {
            // For the purpose of this example I will store user data on local storage
            UserService.setUser({
              authResponse: success.authResponse,
              userID: profileInfo.id,
              name: profileInfo.name,
              email: profileInfo.email,
              picture : "http://graph.facebook.com/" + success.authResponse.userID + "/picture?type=large"
            });

            $state.go('app.home');
          }, function(fail){
            // Fail get profile info
            console.log('profile info fail', fail);
          });
        }else{
          $state.go('app.home');
        }
      } else {
        // If (success.status === 'not_authorized') the user is logged in to Facebook,
        // but has not authenticated your app
        // Else the person is not logged into Facebook,
        // so we're not sure if they are logged into this app or not.

        console.log('getLoginStatus', success.status);

        $ionicLoading.show({
          template: 'Logging in...'
        });

        // Ask the permissions you need. You can learn more about
        // FB permissions here: https://developers.facebook.com/docs/facebook-login/permissions/v2.4
        facebookConnectPlugin.login(['email', 'public_profile'], fbLoginSuccess, fbLoginError);
      }
    });
  };

});

app.controller('HomeCtrl', function($scope,$http,$ionicPopup,$state,$localStorage){

  $scope.$on('$ionicView.enter', function() {
    $scope.username = $localStorage.username;
    $scope.loggedIn = $localStorage.loggedIn;
  })

  $scope.logout = function () {
    $localStorage.$reset();
    $scope.username = null;
    $scope.loggedIn = null;
    $http.defaults.headers.common['x-access-token'] = null;
    // Facebook logout
    facebookConnectPlugin.logout(function(){
      $ionicLoading.hide();
      $state.go('welcome');
    },
    function(fail){
      $ionicLoading.hide();
    });
    $ionicPopup.alert({
      title: 'Utloggning lyckad',
      template: 'Du är nu utloggad. Välkommen åter!'
    }).then(
      $state.go($state.current, {}, {reload: true})
    );
  }

});

app.controller('RegCtrl', function($scope,$http,$ionicPopup,$state,$localStorage){

  $scope.$on('$ionicView.enter', function() {
    $scope.username = $localStorage.username;
    $scope.loggedIn = $localStorage.loggedIn;
  })

  $scope.register = function (username, email, pw, pw2) {
    if (!username) {
      $ionicPopup.alert({
        title: 'Registrering misslyckad',
        template: 'Var god fyll i ett användarnamn.'
      });
    } else if (!email) {
      $ionicPopup.alert({
        title: 'Registrering misslyckad',
        template: 'Var god fyll i en email.'
      });
    } else if (!pw || !pw2) {
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
      $http.post(serverUrl+'/register', { 'username': username, 'password': pw, 'email': email }).then(successReg, error);
    }
  }

  function successReg (res) {
    if (res.data.success) {
      $ionicPopup.alert({
        title: 'Registrering lyckades',
        template: 'Välkommen som användare '+res.data.user+'. Nu kan du logga in.'
      }).then(
        $state.go('login', {}, {reload: true})
      );
    } else if (res.data.exists) {
      $ionicPopup.alert({
        title: 'Registrering misslyckad',
        template: 'Det finns redan en användare registrerad med användarnamn '+res.data.user+'.'
      });
    } else {
      $ionicPopup.alert({
        title: 'Registrering misslyckad',
        template: 'Serverfel.'
      });
    }
  }

});