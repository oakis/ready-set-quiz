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