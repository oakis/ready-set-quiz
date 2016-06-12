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
      
      if (obj.username == $scope.userData.username) {
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