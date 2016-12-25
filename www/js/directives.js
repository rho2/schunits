angular.module('app.directives', [])

.directive('footerc', function() {
    return {
        template:   '<div class="bar bar-footer row bw text-right">' +
        				'<div style="width: 21%">' + 
            				'<button style="width: 100%" class="button button-outline b1 {{ choice.value == \'CUSTOM\' ? \'button-positive\':\'button-stable\' }}" ng-click="openDatePicker(0)">{{ dates[0].d | date : \'d/M/yy\'}}</button>' +
        				'</div>' + 
						'<div style="width: 3%"></div>' + 
        				'<div style="width: 21%">' +
            				'<button style="width: 100%" class="button button-outline b1 {{ choice.value == \'CUSTOM\' ? \'button-positive\':\'button-stable\' }}" ng-click="openDatePicker(1)">{{ dates[1].d | date : \'d/M/yy\'}}</button>' +
        				'</div>' +
						'<div style="width: 15%"></div>' +
			        	'<div style="width: 40%">' +
          					'<button style="width: 100%" id="selectButton" class="button button-outline button-positive b1" ng-click="openSelect()">{{choices[choice.value]}}</button>' +
        				'</div>' +
 					'</div>'
    };
})

.directive('black', function ($compile) {
    return {
      restrict: 'A',
      replace: false,
      terminal: true,
      priority: 1000,
      link: function link(scope,element, attrs) {
        element.attr('ng-class', "settings.darkmode && 'black'");
        element.removeAttr("black"); //remove the attribute to avoid indefinite loop

        $compile(element)(scope);
      }
    };
})

.directive('itemBlack', function ($compile) {
    return {
      restrict: 'A',
      replace: false,
      terminal: true,
      priority: 1000,
      link: function link(scope,element, attrs) {
        element.attr('ng-class', "settings.darkmode && 'item-black'");
        element.removeAttr("item-black"); //remove the attribute to avoid indefinite loop

        $compile(element)(scope);
      }
    };
})

.directive('barBlack', function ($compile) {
    return {
      restrict: 'A',
      replace: false,
      terminal: true,
      priority: 1000,
      link: function link(scope,element, attrs) {
        element.attr('ng-class', "settings.darkmode && 'bar-black'");
        element.removeAttr("bar-black"); //remove the attribute to avoid indefinite loop

        $compile(element)(scope);
      }
    };
})