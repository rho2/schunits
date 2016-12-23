angular.module('app.controllers', ['ionic', 'app.services', 'ionic-toast', 'ionic-datepicker'])

.controller('startCtrl', function($scope, $stateParams) {

})

.controller('stundenplanHeuteCtrl', function($scope, $state, $ionicLoading, $ionicViewSwitcher, $ionicSlideBoxDelegate, $ionicPopover, LoggingService, TimetableService, ionicToast, ionicDatePicker) {
    $scope.d = {}
    $scope.date = new Date();
    $scope.dates = '' + $scope.date.getFullYear() + ('0' + ($scope.date.getMonth() + 1)).slice(-2) + ('0' + $scope.date.getDate()).slice(-2);
    $scope.t = '1';
    $scope.typ = 5;
    // $scope.timegrid = JSON.parse(localStorage.timegrid);
    $scope.full = true;

	$scope.$on("$ionicView.loaded", function(event, data){
		document.addEventListener("volumedownbutton", $scope.prevWeek, false);
    	document.addEventListener("volumeupbutton", $scope.nextWeek, false);
	});

	$scope.openDatePicker = function(){
		var dpo = {
	      callback: function (val) {

	        var date = new Date(val);
	        var d = '' + date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
	        $scope.dates = d;
	        $scope.date = date;
	        $scope.popover.hide();
	        $scope.reload();
	      },
	      inputDate: $scope.date
	  	}

		ionicDatePicker.openDatePicker(dpo);
	};

	$scope.change = function(){
		$scope.typ = ($scope.typ == 5)? 1 : 5;
		$scope.popover.hide();
	    $scope.reload();
	}

	$scope.toggle = function(){$scope.full = !$scope.full;}

	$scope.shortDateString = function(s){
		return shortDateString(s);
	}

    $scope.reload = function() {

        if(!$scope.timegrid){
            try{
                $scope.timegrid = JSON.parse(localStorage.timegrid);
            }
            catch(err){}
        }

        TimetableService.load($scope.date, $scope.typ).then(function(response) {
            $scope.data = response;
            console.log(response);
            if(!$scope.full){
	            try {
	                $scope.start = Object.keys($scope.data).indexOf($scope.dates) || 0;
	                $scope.swiper.slideTo($scope.start)
	            } catch (err) {
	                LoggingService.log('TimetableSwipe', err)
	            }
	        }
            
        }).catch(function(error) {
            ionicToast.show(error.status + '\n' + error.statusText, 'top', false, 1000);

        }).finally(function() {
        	$scope.reDates();
            $scope.$broadcast('scroll.refreshComplete');
        });

    };

    $scope.nextWeek = function(){
    	$scope.date.setDate($scope.date.getDate() + 7);
    	$scope.reload();
    }

    $scope.prevWeek = function(){
		$scope.date.setDate($scope.date.getDate() - 7);
    	$scope.reload();
    }

    $scope.onSwipeRight = function(){
        $scope.prevWeek();
    }

    $scope.onSwipeLeft = function(){
        $scope.nextWeek();
    }

    $scope.reDates = function(){
    	var s = dateString(getMonday($scope.date));
    	$scope.d.currentPage = s.substring(6) + '-' + s.substring(4, 6) + '-' + s.substring(0, 4)
    }

    $scope.gts = function() {
        if (!$scope.full && $scope.start != -1 && $scope.swiper) {
            $scope.swiper.slideTo($scope.start)
            $scope.start = -1;
        }

    }

    $scope.doClick = function(lesson) {
        TimetableService.selectedLesson = lesson;
        goTo($state, 'stundenplanDetail');
    };

    $scope.d.sliderOptions = {
        direction: 'horizontal',
        speed: 500,
        onInit: function(swiper) {
            $scope.swiper = swiper;
        }
    };

    $scope.d.sliderDelegate = null;
    $scope.reload();
    $scope.$watch('d.sliderDelegate', function(newVal, oldVal) {
        if (newVal != null) {
        	$scope.reload();
            $scope.d.sliderDelegate.on('slideChangeEnd', function() {
                var s = '' + Object.keys($scope.data)[$scope.d.sliderDelegate.activeIndex]

                $scope.d.currentPage = s.substring(6) + '-' + s.substring(4, 6) + '-' + s.substring(0, 4);
                $scope.start = -1;
                $scope.$apply();

            });
        }

    });
})

.controller('stundenplanDetailCtrl', function($scope, $stateParams, $state, $ionicViewSwitcher, $ionicHistory, $ionicPlatform, TimetableService) {
    $scope.showClasses = false;
    $scope.showRooms = false;

    $scope.$on("$ionicView.beforeEnter", function(event, data) {
        $scope.lesson = TimetableService.selectedLesson;

        var h = document.getElementsByTagName('ion-header-bar')[0]
        h.style.backgroundColor = $scope.lesson.backColor;

        $scope.showClasses = false;
        $scope.showRooms = false;
    });



    $scope.$on('$stateChangeStart', function(e) {
        var h = document.getElementsByTagName('ion-header-bar')[0]
        h.style.backgroundColor = '#F8F8F8';
    });

    $scope.goBack = function() {
        
        goBack($ionicHistory);
    }

    $scope.toggleClasses = function() {
        $scope.showClasses = !$scope.showClasses;
    }
    $scope.toggleRooms = function() {
        $scope.showRooms = !$scope.showRooms;
    }

    // $ionicPlatform.onHardwareBackButton(function() {
    //     $scope.goBack();
    // }, 100);
    $ionicPlatform.onHardwareBackButton(function() {
        $scope.goBack();
    }, 100);

})

.controller('sprechstundenCtrl', function($scope, $stateParams, $ionicViewSwitcher, $state, $ionicLoading, $ionicPopover, OfficeHourService, ionicToast, ionicDatePicker) {

    $scope.date = new Date('2016-01-01');
    $scope.dates = '' + $scope.date.getFullYear() + '-' + ('0' + ($scope.date.getMonth() + 1)).slice(-2) + '-' + ('0' + $scope.date.getDate()).slice(-2);


    $ionicPopover.fromTemplateUrl('templates/modals/officehour.html', {
	    scope: $scope,
	}).then(function(popover) {
	    $scope.popover = popover;
	});

    $scope.hourClick = function(hour) {
        OfficeHourService.selectedHour = hour
        goTo($state, 'sprechstundenDetail')
    };

    $scope.reload = function() {
        OfficeHourService.getData($scope.dates).then(function(response) {
            $scope.data = response;

        }).catch(function(error) {
            ionicToast.show(error.status + '\n' + error.statusText, 'top', false, 1000);

        }).finally(function() {
            $scope.$broadcast('scroll.refreshComplete');
        });
    };

	$scope.openDatePicker = function(){
		var dpo = {
	      callback: function (val) {

	        var date = new Date(val);
	        var d = '' + date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
	        $scope.dates = d;
	        $scope.date = date;
	        $scope.popover.hide();
	        $scope.reload();
	      },
	      inputDate: $scope.date
	  	}

		ionicDatePicker.openDatePicker(dpo);
	};


    $scope.reload();
})

.controller('sprechstundenDetailCtrl', function($scope, $stateParams, $state, $ionicViewSwitcher, $ionicHistory, $ionicPlatform, OfficeHourService) {
    $scope.$on("$ionicView.beforeEnter", function(event, data) {
        $scope.hour = OfficeHourService.selectedHour;
    });

    $scope.goBack = function() {
        
        goBack($ionicHistory);
    }

    $ionicPlatform.onHardwareBackButton(function() {
        $scope.goBack();
    }, 100);
})

.controller('menuCtrl', function($scope, $stateParams) {})

.controller('meinUnterrichtCtrl', function($scope, $state, $ionicPopover, LessonListService, ionicToast, DateChoiceService) {

    DateChoiceService.set($scope, 'CURRENT_WEEK', true);

    $scope.lessonClick = function(lesson) {
        LessonListService.selectedLesson = lesson
        goTo($state, 'meinUnterrichtDetail')
    };

    $scope.reload = function() {
        var d = $scope.getParam();

        LessonListService.getData(d).then(function(response) {
            $scope.data = response;
           
        }).catch(function(error) {
            ionicToast.show(error.status + '\n' + error.statusText, 'top', false, 1000);
        }).finally(function() {
            $scope.$broadcast('scroll.refreshComplete');
        });
    };

    $scope.reload();
})

.controller('meinUnterrichtDetailCtrl', function($scope, $stateParams, $state, $ionicViewSwitcher, $ionicHistory, $ionicPlatform, LessonListService) {
    $scope.$on("$ionicView.beforeEnter", function(event, data) {
        $scope.lesson = LessonListService.selectedLesson;
    });

    $scope.goBack = function() {
        
        goBack($ionicHistory);
    }

    $ionicPlatform.onHardwareBackButton(function() {
        $scope.goBack();
    }, 100);
})

.controller('unterrichtSchulerCtrl', function($scope,  $state, LessonStudentService, ionicToast, DateChoiceService) {
        
        DateChoiceService.set($scope, 'CURRENT_WEEK');

        $scope.lessonClick = function(lesson) {
            LessonStudentService.selectedLesson = lesson;
            goTo($state, 'unterrichtSchulerDetail');
        };

        $scope.reload = function() {
            var d = $scope.getParam();

            LessonStudentService.getData(d).then(function(response) {
                $scope.data = response;

            }).catch(function(error) {
                ionicToast.show(error.status + '\n' + error.statusText, 'top', false, 1000);

            }).finally(function() {
                $scope.$broadcast('scroll.refreshComplete');
            });
        }

        $scope.reload()
})

.controller('unterrichtSchulerDetailCtrl', function($scope, $stateParams, $state, $ionicViewSwitcher, $ionicHistory, $ionicPlatform, LessonStudentService) {
        $scope.$on("$ionicView.beforeEnter", function(event, data) {
            $scope.lesson = LessonStudentService.selectedLesson;
        });

        $scope.goBack = function() {  
            goBack($ionicHistory);
        }

        $ionicPlatform.onHardwareBackButton(function() {
            $scope.goBack();
        }, 100);
})

.controller('prufungenCtrl', function($scope, $state, ExamService, ionicToast, DateChoiceService) {

    DateChoiceService.set($scope, 'TILL_END_OF_SCHOOLYEAR', true);

    $scope.examClick = function(exam) {
        ExamService.selectedExam = exam
        goTo($state, 'prufungenDetail')
    };

    $scope.reload = function() {
        var d = $scope.getParam();

        ExamService.getData(d).then(function(response) {
            $scope.data = response;

        }).catch(function(error) {
            ionicToast.show(error.status + '\n' + error.statusText, 'top', false, 1000);

        }).finally(function() {
            $scope.$broadcast('scroll.refreshComplete');
        });
    }

    $scope.reload()
})

.controller('prufungenDetailCtrl', function($scope, $stateParams, $state, $ionicViewSwitcher, $ionicHistory, $ionicPlatform, ExamService) {
    $scope.$on("$ionicView.beforeEnter", function(event, data) {
        $scope.exam = ExamService.selectedExam;
    });

    $scope.goBack = function() {
        
        goBack($ionicHistory);
    }

    $ionicPlatform.onHardwareBackButton(function() {
        $scope.goBack();
    }, 100);
})

.controller('tagesunterrichtKlassenCtrl', function($scope, $stateParams, $state, $ionicViewSwitcher, $ionicLoading,  LessonKlasseService, ionicToast) {

    $scope.lessonClick = function(lesson) {
        LessonKlasseService.selectedLesson = lesson
        goTo($state, 'tagesunterrichtKlassenDetail')
    };

    $scope.reload = function() {

        LessonKlasseService.getData().then(function(response) {
            $scope.data = response;

        }).catch(function(error) {
            ionicToast.show(error.status + '\n' + error.statusText, 'top', false, 1000);

        }).finally(function() {
            $scope.$broadcast('scroll.refreshComplete');
        })
    }

    $scope.reload()
})

.controller('tagesunterrichtKlassenDetailCtrl', function($scope, $stateParams, $state, $ionicViewSwitcher, $ionicHistory, $ionicPlatform, LessonKlasseService) {
    $scope.$on("$ionicView.beforeEnter", function(event, data) {
        $scope.lesson = LessonKlasseService.selectedLesson;
    });

    $scope.goBack = function() {
        
        goBack($ionicHistory);
    }

    $ionicPlatform.onHardwareBackButton(function() {
        $scope.goBack();
    }, 100);
})

.controller('meineAbwesenheitenCtrl', function($scope, $state, AbsenceListService, ionicToast, DateChoiceService) {
    
    DateChoiceService.set($scope, 'CURRENT_WEEK');

    $scope.absenceClick = function(absence) {
        AbsenceListService.selectedAbsence = absence
        goTo($state, 'meineAbwesenheitenDetail')
    };

    $scope.reload = function() {
        var d = $scope.getParam();

        AbsenceListService.getData(d).then(function(response) {
            $scope.data = response;

        }).catch(function(error) {
            ionicToast.show(error.status + '\n' + error.statusText, 'top', false, 1000);

        }).finally(function() {
            $scope.$broadcast('scroll.refreshComplete');
        });
    }


    $scope.reload()
})

.controller('meineAbwesenheitenDetailCtrl', function($scope, $stateParams, $state, $ionicViewSwitcher, $ionicHistory, $ionicPlatform, AbsenceListService) {
    $scope.$on("$ionicView.beforeEnter", function(event, data) {
        $scope.absence = AbsenceListService.selectedAbsence;
    });

    $scope.goBack = function() {
        
        goBack($ionicHistory);
    }

    $ionicPlatform.onHardwareBackButton(function() {
        $scope.goBack();
    }, 100);
})

.controller('fehlzeitenCtrl', function($scope, $state, AbsenceTimesService, ionicToast, DateChoiceService) {
    DateChoiceService.set($scope, 'CURRENT_WEEK');

    $scope.absenceClick = function(absence) {
        AbsenceTimesService.selectedAbsence = absence
        goTo($state, 'fehlzeitenDetail')
    };

    $scope.reload = function() {
        var d = $scope.getParam();

        AbsenceTimesService.getData(d).then(function(response) {
            $scope.data = response;

        }).catch(function(error) {
            ionicToast.show(error.status + '\n' + error.statusText, 'top', false, 1000);

        }).finally(function() {
            $scope.$broadcast('scroll.refreshComplete');
        });
    }


    $scope.reload()
})

.controller('fehlzeitenDetailCtrl', function($scope, $stateParams, $state, $ionicViewSwitcher, $ionicHistory, $ionicPlatform, AbsenceTimesService) {
    $scope.$on("$ionicView.beforeEnter", function(event, data) {
        $scope.absence = AbsenceTimesService.selectedAbsence;
    });

    $scope.goBack = function() {
        
        goBack($ionicHistory);
    }

    $ionicPlatform.onHardwareBackButton(function() {
        $scope.goBack();
    }, 100);
})

.controller('klassenbucheintrageCtrl', function($scope, $stateParams) {})

.controller('hausaufgabenCtrl', function($scope, $state, HomeworkService, ionicToast, DateChoiceService) {

    DateChoiceService.set($scope, 'CURRENT_WEEK');

    $scope.homeworkClick = function(homework) {
        HomeworkService.selectedHomework = homework
        goTo($state, 'hausaufgabenDetail')
    };

    $scope.reload = function() {
        var d = $scope.getParam();

        HomeworkService.getData(d).then(function(response) {
            $scope.data = response;
        }).catch(function(error) {
            ionicToast.show(error.status + '\n' + error.statusText, 'top', false, 1000);
        }).finally(function() {
            $scope.$broadcast('scroll.refreshComplete');
        });
    };

    $scope.reload();
})

.controller('hausaufgabenDetailCtrl', function($scope, $stateParams, $state, $ionicViewSwitcher, $ionicHistory, $ionicPlatform, HomeworkService) {
    $scope.$on("$ionicView.beforeEnter", function(event, data) {
        $scope.homework = HomeworkService.selectedHomework;
    });

    $scope.goBack = function() {
        goBack($ionicHistory);
    }

    $ionicPlatform.onHardwareBackButton(function() {
        $scope.goBack();
    }, 100);
})

.controller('klassendiensteCtrl', function($scope, $state, ClassServiceService, ionicToast, DateChoiceService) {
    
    DateChoiceService.set($scope, 'CURRENT_WEEK');

    $scope.serviceClick = function(service) {
        ClassServiceService.selectedService = service
        goTo($state, 'klassendiensteDetail')
    };

    $scope.reload = function() {
        var d = $scope.getParam();

        ClassServiceService.getData(d).then(function(response) {
            $scope.data = response;

        }).catch(function(error) {
            ionicToast.show(error.status + '\n' + error.statusText, 'top', false, 1000);

        }).finally(function() {
            $scope.$broadcast('scroll.refreshComplete');
        });
    };
    $scope.me = localStorage.dName;
    $scope.reload();
})

.controller('klassendiensteDetailCtrl', function($scope, $stateParams, $state, $ionicViewSwitcher, $ionicHistory, $ionicPlatform, ClassServiceService) {
    $scope.$on("$ionicView.beforeEnter", function(event, data) {
        $scope.service = ClassServiceService.selectedService;
    });

    $scope.goBack = function() {
        
        goBack($ionicHistory);
    }

    $ionicPlatform.onHardwareBackButton(function() {
        $scope.goBack();
    }, 100);
})

.controller('befreiungenCtrl', function($scope, $stateParams) {})


.controller('loginCtrl', function($scope, $state, $ionicHistory, $ionicViewSwitcher, $ionicPlatform, LoginService, ionicToast, TimegridService, InfoService, TeacherEmailService, PeopleService, PageConfigService) {
    $scope.data = {};

    $scope.$on("$ionicView.beforeEnter", function(event, data) {
        $scope.data.user = localStorage.username;
        $scope.data.password = localStorage.password;
        $scope.data.school = localStorage.school || 'fts-villingen-schwenningen';

        console.log($scope.data.user);
        console.log($scope.data.password);
        console.log($scope.data.school);

    });

    $scope.goBack = function() {
        
        goBack($ionicHistory);
    }

    $scope.login = function() {

        localStorage.username = $scope.data.user;
        localStorage.password = $scope.data.password;
        localStorage.school = $scope.data.school;

        LoginService.login().then(function(response) {
            if (response.data.state == "SUCCESS") {
                InfoService.load().then(function(){
                    TeacherEmailService.load();
                    PeopleService.load();
                    PageConfigService.load();
                    TimegridService.load();
                    goTo($state, 'startseite.start');
                });
            }

            ionicToast.show(response.data.state + '\n' + (response.data.loginError || ''), 'bottom', true, 1000)
        });
    }

    $ionicPlatform.onHardwareBackButton(function() {
        $scope.goBack();
    }, 100);
})

.controller('feiertageCtrl', function($scope, $state, $ionicHistory, $ionicViewSwitcher, $ionicPlatform) {

    $scope.$on("$ionicView.beforeEnter", function(event, data) {
        $scope.data = JSON.parse(localStorage.holidays);
    });

    $scope.goBack = function() {
        
        goBack($ionicHistory);
    }

    $ionicPlatform.onHardwareBackButton(function() {
        $scope.goBack();
    }, 100);
})

.controller('temailCtrl', function($scope, $state, $ionicHistory, $ionicViewSwitcher, $ionicPlatform, TeacherEmailService) {
    $scope.$on("$ionicView.beforeEnter", function(event, data) {
        $scope.data = JSON.parse(localStorage.temails);
    });


    $scope.reload = function() {

        TeacherEmailService.load().then(function(response) {
            $scope.data = JSON.parse(localStorage.temails);

        }).catch(function(error) {
            ionicToast.show(error.status + '\n' + error.statusText, 'top', false, 1000);

        }).finally(function() {
            $scope.$broadcast('scroll.refreshComplete');
        });
    };


    $scope.goBack = function() {
        
        goBack($ionicHistory);
    }

    $ionicPlatform.onHardwareBackButton(function() {
        $scope.goBack();
    }, 100);
})

.controller('peopleCtrl', function($scope, $state, $ionicHistory, $ionicViewSwitcher, $ionicPlatform, PeopleService) {
    $scope.$on("$ionicView.beforeEnter", function(event, data) {
        $scope.data = JSON.parse(localStorage.people);
    });


    $scope.reload = function() {

        PeopleService.load().then(function(response) {
            $scope.data = JSON.parse(localStorage.people);

        }).catch(function(error) {
            ionicToast.show(error.status + '\n' + error.statusText, 'top', false, 1000);

        }).finally(function() {
            $scope.$broadcast('scroll.refreshComplete');
        });
    };


    $scope.goBack = function() {
        
        goBack($ionicHistory);
    }

    $ionicPlatform.onHardwareBackButton(function() {
        $scope.goBack();
    }, 100);
})

.controller('sonstigesCtrl', function($scope, $stateParams, LoggingService, ionicToast) {
    $scope.erlink = localStorage.erlink;

    $scope.sendLog = function(){
        LoggingService.get().then(function(response) {
           
            console.log(response)
            var link = 'mailto:schunits@rho2.eu?subject=Log+Datei&body=' + encodeURIComponent(response) 
            window.open(link, '_system', 'location=yes');
        });
    }

    $scope.del= function(){
        LoggingService.del().then(function(a){
            console.log('del')
            ionicToast.show('deleted', 'top', false, 1000);
        });
    }
})

.controller('einstellungenCtrl', function($scope, $stateParams) {})

.controller('infoCtrl', function($scope, $stateParams) {})

.controller('stundenplanCtrl', function($scope, $state, $ionicLoading, $ionicViewSwitcher, $ionicSlideBoxDelegate, $ionicPopover,  TimetableService, ionicToast, ionicDatePicker) {
	$scope.timegrid = JSON.parse(localStorage.timegrid);
	$scope.d = {}
    $scope.date = new Date();
    $scope.dates = '' + $scope.date.getFullYear() + ('0' + ($scope.date.getMonth() + 1)).slice(-2) + ('0' + $scope.date.getDate()).slice(-2);
    $scope.t = '1';

    $scope.typ = 5;

    $ionicPopover.fromTemplateUrl('templates/modals/timetable.html', {
	    scope: $scope,
	}).then(function(popover) {
	    $scope.popover = popover;
	});

	$scope.openDatePicker = function(){
		var dpo = {
	      callback: function (val) {

	        var date = new Date(val);
	        var d = '' + date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
	        $scope.dates = d;
	        $scope.date = date;
	        $scope.popover.hide();
	        $scope.reload();
	      },
	      inputDate: $scope.date
	  	}

		ionicDatePicker.openDatePicker(dpo);
	};

	$scope.change = function(t){
		$scope.typ = t;
		console.log($scope.typ)
		$scope.popover.hide();
	    $scope.reload();
	}

    $scope.reload = function() {

        TimetableService.load($scope.date, $scope.typ).then(function(response) {
            $scope.data = response;
        }).catch(function(error) {
            ionicToast.show(error.status + '\n' + error.statusText, 'top', false, 1000);

        }).finally(function() {
            $scope.$broadcast('scroll.refreshComplete');
        });

    };

    $scope.$on("$ionicView.loaded", function(event, data) {
        $scope.reload();
    });

    $scope.doClick = function(lesson) {
        TimetableService.selectedLesson = lesson;
        goTo($state, 'stundenplanDetail');
    };
})

var goTo = function(st, tar){
    st.go(tar);
    window.plugins.nativepagetransitions.slide(
          {"direction":"left"},
          function (msg) {},
          function (msg) {} 
    );
}

var goBack = function(h){
    window.plugins.nativepagetransitions.slide(
          {"direction":"right"},
          function (msg) {}, 
          function (msg) {} 
    );
    h.goBack();
}

var getMonday = function(date) {
    var day = date.getDay() || 7;  
    if( day !== 1 ) 
        date.setHours(-24 * (day - 1)); 
    return date;
}

var dateString = function(date){
	return ('' + date.getFullYear() + ('0' + (date.getMonth() + 1)).slice(-2) + ('0' + date.getDate()).slice(-2));
}

var addDays = function(date, d) {
	return date.setDate(date.getDate() + d);
}

var shortDateString = function(s){
	return s.substring(6) + '.' + s.substring(4, 6) + '.' + s.substring(2, 4)
}

