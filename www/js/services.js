app.service('loadingService', function($ionicLoading){
	
	this.load = function (str) {
		$ionicLoading.show({
		  template: '<p>'+str+' laddas...</p><ion-spinner></ion-spinner>',
		  noBackdrop: true,
		  duration: 10000,
		  delay: 0
		});
	};

	this.save = function (str) {
		$ionicLoading.show({
		  template: '<p>'+str+' sparas...</p><ion-spinner></ion-spinner>',
		  noBackdrop: true,
		  duration: 10000,
		  delay: 0
		});
	};

	this.stop = function () {
		$ionicLoading.hide();
	};

});

app.service('soundService', function($cordovaNativeAudio){
	// Setup sounds
  $ionicPlatform.ready(function() {
      $cordovaNativeAudio
      .preloadSimple('correct', 'sounds/correct.wav')
      .then(function (msg) {
        console.log(msg);
      }, function (error) {
        alert(error);
      });
      $cordovaNativeAudio
      .preloadSimple('wrong', 'sounds/wrong.wav')
      .then(function (msg) {
        console.log(msg);
      }, function (error) {
        alert(error);
      });
  });
});

app.factory('authInterceptor', function($rootScope, $q, $location, $localStorage) {
    return {
      'responseError': function(response) {
	      if (response.status == 403) {
	      	console.log('status 403')
	      	
	      	$localStorage.$reset();

			    $location.path('/login');
	      	return $q.reject(response);
	      } else {
	      	return $q.reject(response);
	      }
	    }
    }
})

app.config(['$httpProvider', function($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');  
  }
])