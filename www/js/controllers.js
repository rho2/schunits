angular.module('app.controllers', ['ionic', 'app.services', 'ionic-toast', 'ionic-datepicker'])

.controller('startCtrl', function($scope, $http, $state) {
    $scope.$on("$ionicView.loaded", function(event, data){
        $http({
                method: 'GET',
                url: 'https://schunits.rho2.eu/changelog.json',
            }).then(function(response) {
                console.log(response)
                $scope.changelog = response.data
            });
    });

    $scope.open = function(l){
        if(l.isURL){
            window.open(l.link, '_system', 'location=yes');
        }
        else{
            goTo($state, l.link);
        }
    }
})

.controller('stundenplanHeuteCtrl', function($scope, $state, $ionicLoading, $ionicViewSwitcher, $ionicPopover,$ionicPlatform, LoggingService, TimetableService, ionicToast, ionicDatePicker) {
    $scope.d = {}
    $scope.w = {}
    $scope.date = new Date();
    $scope.dates =  dateString($scope.date)
    $scope.t = '1';
    $scope.typ = 5;
    $scope.full = true;

	$scope.$on("$ionicView.afterEnter", function(event, data){
		document.addEventListener("volumedownbutton", $scope.prevWeek, false);
    	document.addEventListener("volumeupbutton", $scope.nextWeek, false);
	});

    $scope.$on("$ionicView.beforeLeave", function(event, data){
        document.removeEventListener("volumedownbutton", $scope.prevWeek, false);
        document.removeEventListener("volumeupbutton", $scope.nextWeek, false);
    });

	$scope.openDatePicker = function(){
		var dpo = {
	      callback: function (val) {

	        var date = new Date(val);
            var d = dateString(date)
	        $scope.dates = d;
	        $scope.date = date;
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

        $scope.data = JSON.parse(localStorage['c_timetable_'+ dateString(getMonday($scope.date))] || '{}')

        TimetableService.load($scope.date, $scope.typ).then(function(response) {
            $scope.data = response;
            if(!$scope.full){
	            try {
	                $scope.start = Object.keys($scope.data).indexOf($scope.dates) || 0;
	                $scope.swiper.slideTo($scope.start)
	            } catch (err) {
	                LoggingService.log('TimetableSwipe', err)
	            }
	        }
            else{
                

                $scope.swiperw.slideTo(1, 0)
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

    $scope.w.sliderOptions = {
        direction: 'horizontal',
        speed: 500,
        initialSlide: 1,
        effect: 'slide',
        onInit: function(swiper) {
            $scope.swiperw = swiper;
        }
    }

    $scope.d.sliderDelegate = null;
    $scope.w.sliderDelegate = null;

    $scope.$watch('w.sliderDelegate', function(newVal, oldVal) {
        if (newVal != null) {
            $scope.w.sliderDelegate.on('onReachEnd', function() {
                $scope.nextWeek();
            });
            $scope.w.sliderDelegate.on('onReachBeginning', function() {
                $scope.prevWeek();
            });
        }

    });
    
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

    $scope.reload();
})

.controller('stundenplanDetailCtrl', function($scope, $stateParams, $state, $ionicViewSwitcher, $ionicHistory, $ionicPlatform, TimetableService) {
    $scope.showClasses = false;
    $scope.showRooms = false;

    $scope.$on("$ionicView.beforeEnter", function(event, data) {
        $scope.lesson = TimetableService.selectedLesson;

        console.log($scope.lesson)

        var h = document.getElementsByTagName('ion-header-bar')[0]
        $scope.savedBack = h.style.backgroundColor;
        h.style.backgroundColor = $scope.lesson.backColor;

        $scope.showClasses = false;
        $scope.showRooms = false;
    });

    $scope.goBack = function() {
        var h = document.getElementsByTagName('ion-header-bar')[0]
        h.style.backgroundColor = $scope.savedBack;

        goBack($ionicHistory);
    }

    $scope.toggleClasses = function() {
        $scope.showClasses = !$scope.showClasses;
    }
    $scope.toggleRooms = function() {
        $scope.showRooms = !$scope.showRooms;
    }

    $ionicPlatform.onHardwareBackButton(function() {
        $scope.goBack();
    }, 100);

})

.controller('sprechstundenCtrl', function($scope, $stateParams, $ionicViewSwitcher, $state, $ionicLoading, $ionicPopover, OfficeHourService, ionicToast, ionicDatePicker) {

    $scope.date = new Date('2016-01-01');
    $scope.dates = '' + $scope.date.getFullYear() + '-' + ('0' + ($scope.date.getMonth() + 1)).slice(-2) + '-' + ('0' + $scope.date.getDate()).slice(-2);

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
	        $scope.dates = '' + date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
	        $scope.date = date;
	        $scope.reload();
	      },
	      inputDate: $scope.date
	  	}

		ionicDatePicker.openDatePicker(dpo);
	};

    $scope.data = JSON.parse(localStorage.c_office_hour || '{}')
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

.controller('menuCtrl', function($scope, $stateParams, $ionicListDelegate, $ionicSideMenuDelegate) {
    $scope.items = JSON.parse(localStorage.menu || defaultMenu());
    $scope.reorder = false;
    $scope.remove = false;

    $scope.swipeRight = function(){
        if($scope.reorder){
            //hide delete
            $scope.reorder = !$scope.reorder;
            $ionicListDelegate.showReorder($scope.reorder);
            return;
        }

        if(!$scope.remove){
            //show delete and hide move
            $scope.remove = !$scope.remove;
            $ionicListDelegate.showDelete($scope.remove); 
            $scope.reorder = false;
            $ionicListDelegate.showReorder(false)
        }
    }

    $scope.swipeLeft = function(){
        if($scope.remove){
            //hide delete
            $scope.remove = !$scope.remove;
            $ionicListDelegate.showDelete($scope.remove);
            return;
        }

        if(!$scope.reorder){
            //show reorder and hide delete
            $scope.reorder = !$scope.reorder;
            $ionicListDelegate.showReorder($scope.reorder)
            $scope.remove = false;
            $ionicListDelegate.showDelete(false);
        }

        
    }

    $scope.save = function(){
        localStorage.menu = JSON.stringify($scope.items);
    }

    $scope.moveItem = function(item, fromIndex, toIndex) {
        $scope.items.splice(fromIndex, 1);
        $scope.items.splice(toIndex, 0, item);
        $scope.save();
    };

    $scope.delItem = function(item) {
        $scope.items.splice($scope.items.indexOf(item), 1);
        $scope.save();
    };
})

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

    $scope.data = JSON.parse(localStorage.c_lesson_list || '{}')
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

        $scope.data = JSON.parse(localStorage.c_lesson_student || '{}')
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

    $scope.data = JSON.parse(localStorage.c_exam || '{}')
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

    $scope.data = JSON.parse(localStorage.c_lesson_klasse || '{}')
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

    $scope.data = JSON.parse(localStorage.c_absence_list || '{}')
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

    $scope.data = JSON.parse(localStorage.c_absence_times || '{}')
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

    $scope.data = JSON.parse(localStorage.c_homework || '{}')
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

    $scope.data = JSON.parse(localStorage.c_class_service || '{}')
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

.controller('einstellungenCtrl', function($scope, $state, $ionicHistory, $window) {
    loadSettings($scope);

    $scope.save = function(){
        localStorage.settings = JSON.stringify($scope.settings);

        var element = angular.element(document.getElementById('navbar'));
        var element1 = angular.element(document.getElementById('menu-button'));

          if($scope.settings.darkmode){
            console.log('dark')
            element.removeClass('bar-stable');

            element.addClass('bar-black');
            element1.addClass('button-dark');
          }
          else{
            element.removeClass('bar-black');

            element.addClass('bar-stable');
          }
        $window.location.reload(true);
    }

    $scope.resetMenu = function(){
        localStorage.menu = defaultMenu();
        $window.location.reload(true);
    }

})

.controller('infoCtrl', function($scope, $stateParams) {
    loadSettings($scope);
})

.controller('AppController', function($scope, $stateParams) {
    loadSettings($scope);
})

.controller('stundenplanCtrl', function($scope, $state) {})

var goTo = function(st, tar){
    window.plugins.nativepagetransitions.fade(
          {},
          function (msg) {console.log("success: " + msg)}, 
          function (msg) {alert("error: " + msg)} 
        );
    st.go(tar);
}

var goBack = function(h){
    window.plugins.nativepagetransitions.fade(
          {},
          function (msg) {console.log("success: " + msg)}, 
          function (msg) {alert("error: " + msg)} 
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

var loadSettings = function(scope){
    scope.$on("$ionicView.beforeEnter", function(event, data){
        scope.settings = JSON.parse(localStorage.settings || '{}');
        console.log(scope.settings)
    });
}

var defaultMenu = function(){
    return '[{"text":"Start","icon":"ion-ios-home","link":"startseite.start","class":""},{"text":"Sprechstunden","icon":"ion-ios-telephone","link":"sprechstunden","class":"menu-timetable"},{"text":"Stundenplan","icon":"ion-ios-calendar-outline","link":"startseite.stundenplanHeute","class":"menu-timetable"},{"text":"Mein Unterricht","icon":"ion-ios-bookmarks","link":"meinUnterricht","class":"menu-lesson"},{"text":"Unterricht Schüler","icon":"ion-ios-bookmarks","link":"unterrichtSchuler","class":"menu-lesson"},{"text":"Prüfungen","icon":"ion-ios-bookmarks","link":"startseite.prufungen","class":"menu-lesson"},{"text":"Tagesunterricht Klassen","icon":"ion-ios-bookmarks","link":"tagesunterrichtKlassen","class":"menu-lesson"},{"text":"Meine Abwesenheiten","icon":"ion-ios-flag","link":"meineAbwesenheiten","class":"menu-absence"},{"text":"Fehlzeiten","icon":"ion-ios-flag","link":"fehlzeiten","class":"menu-absence"},{"text":"Befreiungen","icon":"ion-ios-flag","link":"befreiungen","class":"menu-absence"},{"text":"Hausaufgaben","icon":"ion-ios-book","link":"startseite.hausaufgaben","class":"menu-classbook"},{"text":"Klassenbucheinträge","icon":"ion-ios-book","link":"klassenbucheintrage","class":"menu-classbook"},{"text":"Klassendienste","icon":"ion-ios-book","link":"klassendienste","class":"menu-classbook"}]';
}