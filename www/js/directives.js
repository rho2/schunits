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
          					'<button style="width: 100%" class="button button-outline button-positive b1" ng-click="openSelect()">{{choices[choice.value]}}</button>' +
        				'</div>' +
 					'</div>'
    };
});
