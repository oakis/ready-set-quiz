app.controller('HighscoreCtrl', function($scope,$http,$ionicPopup,$state,$localStorage,$timeout){

  Chart.defaults.global.maintainAspectRatio = false;

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
  });

  $scope.$on('$ionicView.loaded', function() {
    $timeout(function(){
      $http.get(serverUrl+'/users').then(highscoreSuccess, error);
    },100);
    $timeout(function(){
      $http.get(serverUrl+'/questionstats').then(qSuccess, error);
    },200);
    $timeout(function(){
      $http.get(serverUrl+'/game/getmatches').then(matchSuccess, error);
    },300);
  });

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