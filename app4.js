var app = angular.module('app',['ionic']);
app.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if(window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if(window.StatusBar) {
        StatusBar.styleDefault();
      }
    });
})

app.directive('record',function(){
	return {     
    	restrict: 'AE',
        replace: true,
        templateUrl: 'record.html',
        link: function(scope, element, attr){

        }
    }
})

app.controller( 'actionsheetCtl',['$scope','$timeout' ,'$ionicBackdrop',function($scope,$timeout,$ionicBackdrop){

  
  $scope.action = function() {
     $ionicBackdrop.retain();
     console.log("层")
     $("#rec").slideDown();
     	$scope.start = function(){
     		$(".ready").hide()
     		$(".recording").show();
     	}
     
     /*$timeout(function() {    //默认让它1秒后消失
       $ionicBackdrop.release();
     }, 1000);*/
  }
  
}])


