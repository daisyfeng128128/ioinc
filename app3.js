var app = angular.module("app",[]);

app.direcive('enter',function(){
	return function(scope,element,attrs){
		console.log(element);
		element.bind('mouseenter',function(){
			
		})
	}
})