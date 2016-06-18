app.controller('GameCtrl', function($scope,$http,$state,$localStorage,loadingService,$cordovaNativeAudio,$interval,$timeout){

  $scope.$on('$ionicView.beforeEnter', function() {
        // #### ADS START #### //
    var admobid = {};

    // TODO: replace the following ad units with your own
    if( /(android)/i.test(navigator.userAgent) ) { 
      admobid = { // for Android
        banner: 'ca-app-pub-9499730006251681~9859429457',
        interstitial: 'ca-app-pub-9499730006251681/7676189052'
      };
    } else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {
      admobid = { // for iOS
        banner: 'ca-app-pub-9499730006251681~9859429457',
        interstitial: 'ca-app-pub-9499730006251681/7676189052'
      };
    } else {
      admobid = { // for Windows Phone
        banner: 'ca-app-pub-9499730006251681~9859429457',
        interstitial: 'ca-app-pub-9499730006251681/7676189052'
      };
    }

    function initApp() {
      if (! AdMob ) { alert( 'admob plugin not ready' ); return; }

      // this will create a banner on startup
      /*AdMob.createBanner( {
        adId: admobid.banner,
        position: AdMob.AD_POSITION.BOTTOM_CENTER,
        isTesting: true, // TODO: remove this line when release
        overlap: false,
        offsetTopBar: false,
        bgColor: 'black'
      } );*/

      // this will load a full screen ad on startup
      AdMob.prepareInterstitial({
        adId: admobid.interstitial,
        isTesting: true, // TODO: remove this line when release
        autoShow: false
      });
    }

    if(( /(ipad|iphone|ipod|android|windows phone)/i.test(navigator.userAgent) )) {
        document.addEventListener('deviceready', initApp, false);
    } else {
        initApp();
    }

    // #### ADS END #### //
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
          $scope.progressval += 0.75;
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
      if ($localStorage.sound) { $cordovaNativeAudio.play('wrong'); }
    } else {
      this.class = 'button-balanced';
      $scope.score += 1;
      if ($localStorage.sound) { $cordovaNativeAudio.play('correct'); }
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
      // show the interstitial later, e.g. at end of game level
      if (window.AdMob) AdMob.showInterstitial();
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