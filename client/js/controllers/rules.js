function managerulesFunc ($window, $scope, $location, $routeParams, $http, socket) {
  //This first line is to assure the session id in rules
  $scope.sessionid = $routeParams.id;
  $scope.formData = {};
  $scope.rulesData = {};
  $scope.typesRules = {};
  $scope.sessionRules = {};
  $scope.actions = {};
  
  // GET ALL RULES OF A SESSION
  $http.get('/api/v2/rules/all/'+$scope.sessionid)
  .success(function(data){
    $scope.sessionRules = data;
  })
  .error(function(error){
    console.log('Error: ' + error);
  });

  //get all typeofRules=typesRules
   var dataObj = {
        id_session : $scope.sessionid,
        type : 'type'
    };
    //LIST ALL THE TYPE OF RULES
   $http.get('/api/v2/rules/types', dataObj)
    .success(function(typeR){
      $scope.typeRules = typeR;
    })
    .error(function(error){
      console.log('Error: ' + error);
    });

    //LIST ALL ACTIONS OF A SESSION
    $http.get('/api/v2/rules/actions/'+$scope.sessionid)
    .success(function(objs){
      $scope.actions = objs;
      console.log($scope.sessionid);
    })
    .error(function(error){
      console.log('Error: ' + error);
    });

    //function to show input
    $scope.ShowInput = function(){
        $scope.IsVisible = $scope.IsVisible = true;
    }

    //FUNCTION TO SHOW FORM ACCORDING TO THE TYPE OF RULE
    $scope.ShowInputTime = function( ){
        $scope.ShowSecond = $scope.ShowSecond = true;
        console.log(type);
        $scope.IsVisibleTime = $scope.IsVisibleTime = true;
        if (type==2) {
          $scope.causalityR = $scope.causalityR = false;
          $scope.frequencyR = $scope.frequencyR = false;
          $scope.timeR = $scope.timeR = true;
        }
        if (type==1) {
          $scope.timeR = $scope.timeR = false;
          $scope.causalityR = $scope.causalityR = true;
          $scope.frequencyR = $scope.frequencyR = false;
        }
        if (type==3) {
          $scope.timeR = $scope.timeR = false;
          $scope.causalityR = $scope.causalityR = false;
          $scope.frequencyR = $scope.frequencyR = true;
          $scope.ShowSecond = $scope.ShowSecond = false;
        }
        //if ($scope.selectedType) {}
    }

    //ADD NEW RULE
    $scope.AddNewRule = function(type, first, causality, second){
      var magnitude = "";
      var value = "";
      if(type == 1){magnitude='Causality'; value = causality}
      if(type == 2){magnitude='Time'; value = $scope.TimeFrame}
      if(type == 3){magnitude='Frequency'; value = $scope.Frequency}

      const dataObjRule = {
        typeRule : type,
        sessionid : $scope.sessionid,
        name : $scope.Name,
        firstAction : first,
        secondAction : second,
        magnitude : magnitude,
        value : value,
        feedbackCorrect: $scope.inputIfCorrect,
        feedbackWrong: $scope.inputIfWrong,
      };
    //console.log(dataObjRule);
    //insert new rule
    $http.post('/api/v2/rules/addRule/', dataObjRule)
    .success(function(allrules){
      $scope.IsVisible = false;
      $scope.IsVisibleTime = false;
      $scope.Name = '';
      $scope.TimeFrame = '';
      $scope.Frequency = '';
      $scope.inputIfCorrect = '';
      $scope.inputIfWrong = '';
      $scope.selectedFirst = '';
      $scope.selectedSecond = '';
      $scope.causality = '';
      $scope.sessionRules = allrules;

    })
    .error(function(error){
      console.log('Error: ' + error);
    });
  }

    //console.log('here we are');
  $scope.endSession = function(){
      var dataObj = {
          id_session : $scope.sessionid,
      };

      $http.post('/api/v1/sessions/stop', dataObj )
      .success(function(data){
      console.log(data);
      $scope.sourceSession = data;
      })
      .error((error) => {
        console.log('Error: ' + error);
      });
      $location.path('/');
    };

});