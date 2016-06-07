app.controller('QuestionCtrl', function($scope,$http,$state,$localStorage,loadingService,$cordovaNativeAudio,$interval,$timeout){

  

  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.questions = [];
    $scope.currentQuestion = 0;
    $scope.user = {};
    $scope.score = 0;
    $scope.userClicked = false;
    $scope.stage1 = true;
    $scope.stage2 = false;
    $scope.stage3 = false;
    $scope.gameStart = false;
    $scope.gameOver = false;
    $scope.opponent = null;
    //loadingService.load('Frågor');
    $scope.username = $localStorage.username;
    $scope.loggedIn = $localStorage.loggedIn;
    $scope.role = $localStorage.role;
    $http.defaults.headers.common['x-access-token'] = $localStorage.token;
    $scope.userMatches = [];
    $scope.userPlayed = [];
    getMatches('true','false',matchesSuccess);
    getMatches('false','true',playedSuccess);
    $scope.currentGame = null;
  })

  $scope.doRefresh = function() {
    getMatches('true','false',matchesSuccess);
    getMatches('false','true',playedSuccess);
    $scope.$broadcast('scroll.refreshComplete');
  };

  function getMatches(active,finnished,cb) {
    $http.post(serverUrl+'/game/matches/'+active+'/'+finnished, { username: $scope.username }).then(cb, error);
  }

  $scope.lfm = function () {
    $http.post(serverUrl+'/game/queue', { username: $scope.username }).then(queueSuccess, error);
  }

  function queueSuccess (res) {
    //$scope.stage1 = false;
    $scope.stage2 = true;
    console.log(res.data.message)
    $timeout(function(){
      $http.post(serverUrl+'/game/lfm', { username: $scope.username }).then(lfmSuccess, error);
    },5000);
  }

  function lfmSuccess (res) {
    if (res.data.success) {
      console.log('show games')
      getMatches('true','false',matchesSuccess);
      getMatches('false','true',playedSuccess);
      $scope.stage2 = false;
    } else {
      queueSuccess();
    }
  }

  function matchesSuccess (res) {
    $scope.userMatches = res.data
    console.log('Matches loaded.')
    // Visa meddelande att match hittades
  }

  function playedSuccess (res) {
    $scope.userPlayed = res.data
    console.log('Played loaded.')
  }

  $scope.start = function (id) {
    console.log(id);
    $http.get(serverUrl+'/game/getmatch/'+id).then(startGame,error);
  }

  function startGame (res) {
    console.log(res.data[0]);
    $scope.questions = res.data[0].questions;
    $scope.stage1 = false;
    $scope.gameStart = true;
    $scope.currentGame = res.data[0]._id;
    startprogress();
  }

  function startprogress() {
    $scope.progressval = 0;
    
    if ($scope.stopinterval) {
      $interval.cancel($scope.stopinterval);
    }
    
    $scope.stopinterval = $interval(function() {
          $scope.progressval += 1;
           if( $scope.progressval >= 100 ) {
                 $interval.cancel($scope.stopinterval);
                 $scope.userClicked = true;
                 return;
            }
     }, 100);
  }

  $scope.answer = function (index) {
    $interval.cancel($scope.stopinterval);
    var correct = $scope.questions[$scope.currentQuestion].answer;
    var userAnswer = $scope.questions[$scope.currentQuestion].choices[index];
    $scope.userClicked = true;

    if (correct !== userAnswer) {
      this.class = 'button-assertive';
      if (!$scope.isWebView && $localStorage.sound) { $cordovaNativeAudio.play('wrong'); }
    } else {
      this.class = 'button-balanced';
      $scope.score += 1;
      console.log('Score:',$scope.score)
      if (!$scope.isWebView && $localStorage.sound) { $cordovaNativeAudio.play('correct'); }
    }

  }

  $scope.next = function () {
    if ($scope.currentQuestion != $scope.questions.length-1) {
      $scope.currentQuestion += 1;
      $scope.userClicked = false;
      startprogress();
    } else {
      $http.post(serverUrl+'/userscore/', { username: $scope.username, newScore: $scope.score }).then(postSuccess, error);
      $http.post(serverUrl+'/game/savescore/', { gameId: $scope.currentGame, username: $scope.username, score: $scope.score })
      $scope.gameOver = true;
      $scope.gameStart = false;
    }
  }

  $scope.quit = function () {
    $scope.questions = [];
    $scope.currentQuestion = 0;
    $scope.score = 0;
    $scope.gameOver = false;
    $scope.currentGame = null;
    $state.go($state.current, {}, {reload: true})
  }

  function postSuccess (res) {
    $scope.newScore = res.data.newScore;
  }
  
});

app.controller('ProfileCtrl', function($scope,$http,$localStorage,$ionicPopup,$state,loadingService,$timeout){
  
  $scope.userData;
  $scope.data = {};
  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.disable = false;
    $scope.username = $localStorage.username;
    $scope.loggedIn = $localStorage.loggedIn;
    $scope.role = $localStorage.role;
    $http.defaults.headers.common['x-access-token'] = $localStorage.token;
    $scope.rankPercent;
    $scope.win;
    $scope.loss;
    $scope.tied;
  });

  $scope.$on('$ionicView.beforeEnter', function() {
    $http.get(serverUrl+'/user/'+$scope.username).then(userSuccess, error);
    $http.get(serverUrl+'/game/getmatches').then(matchSuccess, error);
    $http.get(serverUrl+'/users').then(highscoreSuccess, error);
  });

  function userSuccess (res) {
    $scope.userData = res.data.user;
  }

  function highscoreSuccess (res) {
    $scope.userlist = [];
    $scope.userlist = res.data.users.sort(function(a, b) {
      return b.totalPoints - a.totalPoints;
    });
    var count = 1;
    for (var obj of $scope.userlist) {
      
      if (obj.username == $scope.username) {
        $scope.rankCorrect = count;
      }
      count ++;
    }
  }

  function matchSuccess (res) {
    var tempArr = res.data;
    var count = 1;

    tempArr.sort(function(a, b) {
      return b.ratio - a.ratio;
    });
    for (var obj of tempArr) {
      
      if (obj._id == $scope.username) {
        console.log(obj._id,$scope.username)
        $scope.rankPercent = count;
        $scope.win = obj.wins;
        $scope.loss = obj.losses;
        $scope.tied = obj.tied;
      }
      count ++;
    }
    
  }

  $scope.addQuestion = function () {
    if (!$scope.data.question || !$scope.data.choice1 || !$scope.data.choice2 || !$scope.data.choice3 || !$scope.data.answer) {
      $ionicPopup.alert({
        title: 'Ofullständig fråga',
        template: 'Du måste fylla i alla fält för att spara en fråga.'
      });
    } else {
      $scope.disable = true;
      loadingService.save('Frågan');
      var newQuestion = {
        author: $scope.username,
        question: $scope.data.question,
        choices: $scope.data.choice1.replace(',','')+','+$scope.data.choice2.replace(',','')+','+$scope.data.choice3.replace(',','')+','+$scope.data.answer.replace(',',''),
        answer: $scope.data.answer.replace(',',''),
        role: $localStorage.role
      }
      $http.post(serverUrl+'/question/', newQuestion).then(addSuccess, error);
    }
  }

  function addSuccess (res) {
    $ionicPopup.alert({
      title: 'Fråga sparad',
      template: 'Tack för att du bidrog med en fråga!'
    });
    $scope.data = {};
    loadingService.stop();
    $timeout(function(){
      $scope.disable = false;
    },3000);
    $state.go('tab.profile');
  }

});

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

app.controller('AdminCtrl', function($scope,$http,$ionicPopup,$state,$localStorage){

  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.username = $localStorage.username;
    $scope.loggedIn = $localStorage.loggedIn;
    $scope.role = $localStorage.role;
    $http.defaults.headers.common['x-access-token'] = $localStorage.token;
  })

  $scope.$on('$ionicView.beforeEnter', function() {
    $http.get(serverUrl+'/question/false').then(questionSuccess, error);
    $http.get(serverUrl+'/users').then(roleSuccess, error);
  })

  $scope.data;

  function questionSuccess (res) {
    $scope.notAccepted = res.data.question;
    for (var x in $scope.notAccepted) {
      $scope.notAccepted[x].editing = false;
    }
  }

  function roleSuccess (res) {
    $scope.adminRoles = res.data.users;
  }

  $scope.accept = function (index) {
    $ionicPopup.confirm({
      title: 'Godkänna',
      template: 'Är du säker på att du vill godkänna frågan?'
    }).then(function(res) {
      if(res) {
        $http.put(serverUrl+'/accept/', { id: $scope.notAccepted[index]._id }).then(successAccept, error);
          function successAccept (res) {
            $scope.notAccepted.splice(index,1);
            $ionicPopup.alert({
              title: 'Godkänd',
              template: 'Frågan godkänd.'
            })
          }
      }
    });
  }
  

  $scope.edit = function (index) {
    $scope.notAccepted[index].editing = true;
    $scope.data = $scope.notAccepted[index];
  }

  $scope.save = function (index) {
    $scope.notAccepted[index].editing = false;
    var updateQuestion = {
      question: $scope.data.question,
      choices: $scope.data.choices[0]+','+$scope.data.choices[1]+','+$scope.data.choices[2]+','+$scope.data.answer,
      answer: $scope.data.answer
    }
    $http.put(serverUrl+'/question/'+$scope.data._id, updateQuestion).then(successSave, error);
  }

  function successSave (res) {
    $scope.data = null;
    $ionicPopup.alert({
      title: 'Uppdaterad',
      template: 'Frågan uppdaterad.'
    })
  }

  $scope.delete = function (index) {
    $ionicPopup.confirm({
      title: 'Radera',
      template: 'Är du säker på att du vill ta bort frågan?'
    }).then(function(res) {
      if(res) {
        $http.delete(serverUrl+'/question/'+$scope.notAccepted[index]._id).then(successDelete, error);
          function successDelete (res) {
            $scope.notAccepted.splice(index,1);
            $ionicPopup.alert({
              title: 'Raderad',
              template: 'Frågan raderad.'
            })
          }
      }
    });
  }

  $scope.updateRole = function (index,role) {
    $ionicPopup.confirm({
      title: 'Uppdatera roll',
      template: 'Är du säker på att du vill uppdatera '+$scope.adminRoles[index].username+'\'s roll till '+role+'?'
    }).then(function(res) {
      if(res) {
        $http.put(serverUrl+'/role/'+$scope.adminRoles[index].username, { role: role }).then(successRole, error);
      }
    });
  }

  function successRole (res) {
    console.log('success role')
  }

});

app.controller('HighscoreCtrl', function($scope,$http,$ionicPopup,$state,$localStorage,$timeout){

  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.username = $localStorage.username;
    $scope.loggedIn = $localStorage.loggedIn;
    $scope.role = $localStorage.role;
    $http.defaults.headers.common['x-access-token'] = $localStorage.token;
    $scope.qUser = [];
    $scope.qSum = [];
    $scope.tempSum = [];
    $scope.statsUser = [];
    $scope.statsPoints = [];
    $scope.tempPoints = [];
    $scope.rankUser = [];
    $scope.rankSum = [];
    $scope.ranktempSum = [];
    $timeout(function(){
      $http.get(serverUrl+'/users').then(highscoreSuccess, error);
    },100);
    $timeout(function(){
      $http.get(serverUrl+'/questionstats').then(qSuccess, error);
    },200);
    $timeout(function(){
      $http.get(serverUrl+'/game/getmatches').then(matchSuccess, error);
    },300);
  })

  $scope.doRefresh = function() {
    $timeout(function(){
      $http.get(serverUrl+'/users').then(highscoreSuccess, error);
    },100);
    $timeout(function(){
      $http.get(serverUrl+'/questionstats').then(qSuccess, error);
    },200);
    $timeout(function(){
      $http.get(serverUrl+'/game/getmatches').then(matchSuccess, error);
    },300);
    $scope.$broadcast('scroll.refreshComplete');
  };

  $scope.statsSeries = ['Total poäng'];
  $scope.qSeries = ['Godkända frågor'];
  $scope.rankSeries = ['Vinstprocent']
  

  function qSuccess (res) {
    $scope.qUser = [];
    $scope.qSum = [];
    $scope.qlist = res.data.question.sort(function(a, b) {
      return b.sum - a.sum;
    });
    var count = 1;
    for (var user of $scope.qlist) {
      $scope.qUser.push('#'+count+' '+user._id)
      $scope.tempSum.push(user.sum);
      count ++;
    }
    $scope.qSum.push($scope.tempSum);
    $scope.qUser.splice(10);
    $scope.qSum.splice(10);
  }

  function highscoreSuccess (res) {
    $scope.statsUser = [];
    $scope.statsPoints = [];
    $scope.userlist = res.data.users.sort(function(a, b) {
      return b.totalPoints - a.totalPoints;
    });
    var count = 1;
    for (var user of $scope.userlist) {
      $scope.statsUser.push('#'+count+' '+user.username);
      $scope.tempPoints.push(user.totalPoints);
      count ++;
    }
    $scope.statsPoints.push($scope.tempPoints);
    $scope.statsUser.splice(10);
    $scope.statsPoints.splice(10);
  }

  function matchSuccess (res) {
    $scope.rankUser = [];
    $scope.rankSum = [];
    var tempArr = res.data;
    var count = 1;

    tempArr.sort(function(a, b) {
      return b.ratio - a.ratio;
    });
    for (var obj of tempArr) {
      $scope.rankUser.push('#'+count+' '+obj._id);
      $scope.ranktempSum.push(obj.ratio);
      count ++;
    }
    $scope.rankSum.push($scope.ranktempSum);
    $scope.rankUser.splice(10);
    $scope.rankSum.splice(10);
  }

});

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