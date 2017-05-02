var app = angular.module("app",[]);

app.directive('enter',function(){
	return function(scope,element,attrs){
		console.log(element);
		element.bind('mouseenter',function(){
			element.addClass('alert-box');
		})
	}
})

app.directive('leave',function(){
	return function(scope,element,attrs){
		console.log(element);
		element.bind('mouseleave',function(){
			element.removeClass('alert-box');
		})
	}
})

app.directive('hello',function(){
	return {
		restrict:"E",
		template:'<div><input ng-model="txt"></div><div>{{txt}}</div>',
		link:function(scope,element){
			scope.$watch('txt',function(newVal){
				if (newVal === 'error') {
					element.addClass('alert-box alert');
				}
			})
		}
	}
})