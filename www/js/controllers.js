angular.module('app.controllers', ['ionic', 'app.services', 'ionic-toast', 'ionic-datepicker', 'ngCordova'])

.controller('startCtrl', function($scope, $http, $state) {
  $scope.$on("$ionicView.loaded", function(event, data) {
    $http({
      method: 'GET',
      url: 'https://schunits.rho2.eu/changelog.json',
    }).then(function(response) {
      console.log(response)
      $scope.changelog = response.data
    });
  });

  $scope.open = function(l) {
    if (l.isURL) {
      window.open(l.link, '_system', 'location=yes');
    } else {
      goTo($state, l.link);
    }
  }
})

.controller('stundenplanHeuteCtrl', function($scope, $state, $ionicLoading, $ionicViewSwitcher, $ionicPopover, $ionicPlatform, LoggingService, TimetableService, ionicToast, ionicDatePicker) {
  $scope.d = {}
  $scope.w = {}
  $scope.date = new Date();
  $scope.dates = dateString($scope.date)
  $scope.t = '1';
  $scope.typ = 5;
  $scope.full = true;

  $scope.$on("$ionicView.afterEnter", function(event, data) {
    document.addEventListener("volumedownbutton", $scope.prevWeek, false);
    document.addEventListener("volumeupbutton", $scope.nextWeek, false);
  });

  $scope.$on("$ionicView.beforeLeave", function(event, data) {
    document.removeEventListener("volumedownbutton", $scope.prevWeek, false);
    document.removeEventListener("volumeupbutton", $scope.nextWeek, false);
  });

  $scope.openDatePicker = function() {
    var dpo = {
      callback: function(val) {

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

  $scope.change = function() {
    $scope.typ = ($scope.typ == 5) ? 1 : 5;
    $scope.reload();
  }

  $scope.toggle = function() {
    $scope.full = !$scope.full;
  }

  $scope.shortDateString = function(s) {
    return shortDateString(s);
  }

  $scope.reload = function() {

    if (!$scope.timegrid) {
      try {
        $scope.timegrid = JSON.parse(localStorage.timegrid || '{}');
      } catch (err) {}
    }

    $scope.data = JSON.parse(localStorage['c_timetable_' + dateString(getMonday($scope.date))] || '{}')

    TimetableService.load($scope.date, $scope.typ).then(function(response) {
      $scope.data = response;
    }).catch(function(error) {
      ionicToast.show(error.status + '\n' + error.statusText, 'top', false, 1000);

    }).finally(function() {
      $scope.reDates();
      $scope.$broadcast('scroll.refreshComplete');

      if (!$scope.full) {
        try {
          $scope.start = Object.keys($scope.data).indexOf($scope.dates) || 0;
          $scope.swiper.slideTo($scope.start)
        } catch (err) {
          LoggingService.log('TimetableSwipe', err)
        }
      } else {
        $scope.swiperw.slideTo(1, 0)
      }
    });
  };

  $scope.nextWeek = function() {
    $scope.date.setDate($scope.date.getDate() + 7);
    $scope.reload();
  }

  $scope.prevWeek = function() {
    $scope.date.setDate($scope.date.getDate() - 7);
    $scope.reload();
  }

  $scope.reDates = function() {
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

.controller('stundenplanDetailCtrl', function($scope, $stateParams, $state, $ionicViewSwitcher, $ionicHistory, $ionicPlatform, $ionicModal, TimetableService) {
  $scope.showClasses = false;
  $scope.showRooms = false;

  $ionicModal.fromTemplateUrl('templates/create/prufung.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.nE = {};

  $scope.create = function() {
    $scope.ownE = JSON.parse(localStorage.ownExam || '[]')
    $scope.ownE.push($scope.nE)
    localStorage.ownExam = JSON.stringify($scope.ownE)
    $scope.modal.hide();
  }

  $scope.$on("$ionicView.beforeEnter", function(event, data) {
    $scope.lesson = TimetableService.selectedLesson;

    var lesson = $scope.lesson;

    console.log(lesson)

    var h = document.getElementsByTagName('ion-header-bar')[0]
    $scope.savedBack = h.style.backgroundColor;
    h.style.backgroundColor = $scope.lesson.backColor;

    $scope.showClasses = false;
    $scope.showRooms = false;

    var d = lesson.date + '';

    $scope.nE = {
      class_name: lesson.class_name,
      date: d.substring(6, 8) + '.' + d.substring(4, 6) + '.' + d.substring(0, 4),
      start: lesson.start,
      end: lesson.end,
      subject: lesson.e[3][0].longName,
      subject_short: lesson.subject,
      teacher: lesson.e[2][0].name,
      room: lesson.e[4][0].name
    }

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

  $scope.addExam = function() {

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

  $scope.openDatePicker = function() {
    var dpo = {
      callback: function(val) {

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

  $scope.swipeRight = function() {
    if ($scope.reorder) {
      //hide delete
      $scope.reorder = !$scope.reorder;
      $ionicListDelegate.showReorder($scope.reorder);
      return;
    }

    if (!$scope.remove) {
      //show delete and hide move
      $scope.remove = !$scope.remove;
      $ionicListDelegate.showDelete($scope.remove);
      $scope.reorder = false;
      $ionicListDelegate.showReorder(false)
    }
  }

  $scope.swipeLeft = function() {
    if ($scope.remove) {
      //hide delete
      $scope.remove = !$scope.remove;
      $ionicListDelegate.showDelete($scope.remove);
      return;
    }

    if (!$scope.reorder) {
      //show reorder and hide delete
      $scope.reorder = !$scope.reorder;
      $ionicListDelegate.showReorder($scope.reorder)
      $scope.remove = false;
      $ionicListDelegate.showDelete(false);
    }


  }

  $scope.save = function() {
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

.controller('unterrichtSchulerCtrl', function($scope, $state, LessonStudentService, ionicToast, DateChoiceService) {

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

.controller('prufungenCtrl', function($scope, $state, $cordovaCalendar, $ionicActionSheet, ExamService, ionicToast, DateChoiceService) {

  DateChoiceService.set($scope, 'TILL_END_OF_SCHOOLYEAR', true);

  $scope.sort = 0;
  $scope.getIcon = function(i) {
    return ($scope.sort == i ? 'ion-ios-circle-filled' : 'ion-ios-circle-outline')
  }

  var getButtons = function() {
    return [{
      text: '<i class="icon ion-ios-calendar-outline"></i> Alle in Kalender'
    }, {
      text: '<i class="icon ' + $scope.getIcon(0) + '"></i>Nach Datum sortieren'
    }, {
      text: '<i class="icon ' + $scope.getIcon(1) + '"></i>Nach Fach sortieren'
    }, {
      text: '<i class="icon ' + $scope.getIcon(2) + '"></i>Nach Note sortieren'
    }]
  }

  var sort = function() {
    switch ($scope.sort) {
      case 0:
        $scope.data.sort(sort_by('date', false, function(a) {
          return pDate(a)
        }));
        break;
      case 1:
        $scope.data.sort(sort_by('subject', false, function(a) {
          return a.toUpperCase()
        }));
        break;
      case 2:
        $scope.data.sort(sort_by('mark', true, function(a) {
          return parseInt(a) || 0
        }));
        break;
    }
  }

  var parseDate = function(parts, time) {
    var date = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    var t = time.split(":")
    date.setHours(parseInt(t[0]))
    date.setMinutes(parseInt(t[1]))
    return date;
  }

  var parseExam = function(exam) {
    var parts = exam.date.split(".");

    return {
      title: exam.subject_short + '-' + exam.typ || '' + ': ' + exam.name || '',
      location: exam.room,
      notes: exam.text,
      startDate: parseDate(parts, exam.start),
      endDate: parseDate(parts, exam.end)
    }
  }

  $scope.addToCalender = function(exam) {
    var calInter = $scope.settings.calInter;
    var e = parseExam(exam);
    addToCalender(e.title, e.location, e.notes, e.startDate, e.endDate, calInter, ionicToast)
  }

  $scope.addAll = function() {
    var calOptions = window.plugins.calendar.getCalendarOptions();
    calOptions.firstReminderMinutes = null

    var exams = $scope.data.slice(0);

    var add = function() {

      if (exams.length == 0) {
        ionicToast.show('Alle hinzugefügt', 'top', false, 1000);
        return;
      }

      var e = parseExam(exams[0]);
      window.plugins.calendar.findEvent(e.title, e.location, e.notes, e.startDate, e.endDate,
        function(result) {
          if (!result.length) {
            window.plugins.calendar.createEventWithOptions(e.title, e.location, e.notes, e.startDate, e.endDate, calOptions,
              function(result) {
                exams.splice(0, 1);
                add();
              },
              function(err) {

              }
            );
          } else {
            exams.splice(0, 1);
            add();
          }
        },
        function(err) {

        });
    }

    add();
  }

  $scope.more = function() {
    $ionicActionSheet.show({
      buttons: getButtons(),
      buttonClicked: function(index) {
        switch (index) {
          case 0:
            $scope.addAll()
            break;
          default:
            $scope.sort = index - 1;
            sort();
            break;
        }
        return true;
      }
    });
  }

  $scope.examClick = function(exam) {
    ExamService.selectedExam = exam
    goTo($state, 'prufungenDetail')
  };

  $scope.reload = function() {
    var d = $scope.getParam();

    ExamService.getData(d).then(function(response) {
      $scope.data = response || [];
      $scope.ownE = JSON.parse(localStorage.ownExam || '[]')

      if ($scope.data.push) {
        $scope.data.push.apply($scope.data, $scope.ownE)
      } else {
        $scope.data = $scope.ownE
      }

      sort();
      if ($scope.settings.examSync) {
        $scope.addAll();
      }

    }).catch(function(error) {
      ionicToast.show(error.status + '\n' + error.statusText, 'top', false, 1000);

    }).finally(function() {
      $scope.$broadcast('scroll.refreshComplete');
    });
  }

  $scope.ownE = JSON.parse(localStorage.ownExam || '[]')
  $scope.data = JSON.parse(localStorage.c_exam || '[]')
  if ($scope.data.push) {
    $scope.data.push.apply($scope.data, $scope.ownE)
  } else {
    $scope.data = $scope.ownE
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

.controller('tagesunterrichtKlassenCtrl', function($scope, $stateParams, $state, $ionicViewSwitcher, $ionicLoading, LessonKlasseService, ionicToast) {

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

.controller('hausaufgabenCtrl', function($scope, $state, $ionicActionSheet, $ionicModal, HomeworkService, ionicToast, DateChoiceService) {

  DateChoiceService.set($scope, 'CURRENT_WEEK');

  $scope.sort = 0;
  $scope.getIcon = function(i) {
    return ($scope.sort == i ? 'ion-ios-circle-filled' : 'ion-ios-circle-outline')
  }

  var getButtons = function() {
    return [{
      text: '<i class="icon ion-ios-calendar-outline"></i> Alle in Kalender'
    }, {
      text: '<i class="icon ion-ios-plus-outline"></i> Hausaufgabe hinzufügen'
    }, {
      text: '<i class="icon ' + $scope.getIcon(0) + '"></i>Nach Aufgabedatum sortieren'
    }, {
      text: '<i class="icon ' + $scope.getIcon(1) + '"></i>Nach Abgabedatum sortieren'
    }, {
      text: '<i class="icon ' + $scope.getIcon(2) + '"></i>Nach Fach sortieren'
    }]
  }

  var sort = function() {
    console.log($scope.data)
    switch ($scope.sort) {
      case 0:
        $scope.data.sort(sort_by('start', false, function(a) {
          return pDate(a.substring(3))
        }));
        break;
      case 1:
        $scope.data.sort(sort_by('end', false, function(a) {
          return pDate(a.substring(3))
        }));
        break;
      case 2:
        $scope.data.sort(sort_by('subject', false, function(a) {
          return a.toUpperCase()
        }));
        break;
    }
  }

  var parseHomework = function(h) {
    var ds = h.end.substring(3).split(".");

    var start = new Date(parseInt(ds[2], 10), parseInt(ds[1], 10) - 1, parseInt(ds[0], 10));
    start.setHours(0);

    var end = new Date(parseInt(ds[2], 10), parseInt(ds[1], 10) - 1, parseInt(ds[0], 10));
    end.setHours(24);

    return {
      title: h.subject + '-Hausaufgabe: ' + h.text.substring(0, 7) + '...',
      notes: h.text,
      startDate: start,
      endDate: end
    }
  }

  $ionicModal.fromTemplateUrl('templates/create/hausaufgaben.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
    console.log(modal)
  });
  $scope.nH = {};

  $scope.ownH = JSON.parse(localStorage.ownHomework || '[]')

  $scope.create = function() {

    var nH = $scope.nH

    nH.start = dateString2(nH.startDate)
    nH.end = dateString2(nH.endDate)

    delete nH.startDate
    delete nH.endDate

    $scope.data.push(nH)

    $scope.ownH.push(nH)

    localStorage.ownHomework = JSON.stringify($scope.ownH)
  }

  $scope.addToCalender = function(h) {
    var calInter = $scope.settings.calInter;
    var e = parseHomework(h);
    addToCalender(e.title, e.location, e.notes, e.startDate, e.endDate, calInter, ionicToast)
  }

  $scope.addAll = function() {
    var calOptions = window.plugins.calendar.getCalendarOptions();
    calOptions.firstReminderMinutes = null

    var hom = $scope.data.slice(0);

    var add = function() {

      if (hom.length == 0) {
        ionicToast.show('Alle hinzugefügt', 'top', false, 1000);
        return;
      }

      var e = parseHomework(hom[0]);
      window.plugins.calendar.findEvent(e.title, e.location, e.notes, e.startDate, e.endDate,
        function(result) {
          console.log(result);
          if (!result.length) {
            window.plugins.calendar.createEventWithOptions(e.title, e.location, e.notes, e.startDate, e.endDate, calOptions,
              function(result) {
                hom.splice(0, 1);
                add();
              },
              function(err) {
                console.log(err)
              }
            );
          } else {
            hom.splice(0, 1);
            add();
          }
        },
        function(err) {
          console.log(err)
        });
    }

    add();
  }

  $scope.more = function() {
    $ionicActionSheet.show({
      buttons: getButtons(),
      buttonClicked: function(index) {
        switch (index) {
          case 0:
            $scope.addAll()
            break;
          case 1:
            $scope.modal.show()
            break;
          default:
            $scope.sort = index - 2;
            sort();
            break;
        }
        return true;
      }
    });
  }

  $scope.homeworkClick = function(homework) {
    HomeworkService.selectedHomework = homework
    goTo($state, 'hausaufgabenDetail')
  };

  $scope.reload = function() {
    var d = $scope.getParam();

    HomeworkService.getData(d).then(function(response) {
      $scope.data = response || [];

      if ($scope.data.push) {
        $scope.data.push.apply($scope.data, $scope.ownH)
      } else {
        $scope.data = $scope.ownH
      }

      sort();
      if ($scope.settings.homeworkSync) {
        $scope.addAll();
      }
    }).catch(function(error) {
      ionicToast.show(error.status + '\n' + error.statusText, 'top', false, 1000);
    }).finally(function() {
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.data = JSON.parse(localStorage.c_homework || '[]')
  if ($scope.data.push) {
    $scope.data.push.apply($scope.data, $scope.ownH)
  } else {
    $scope.data = $scope.ownH
  }

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

.controller('klassendiensteCtrl', function($scope, $state, $ionicActionSheet, ClassServiceService, ionicToast, DateChoiceService) {

  DateChoiceService.set($scope, 'CURRENT_WEEK');

  var p = 9;

  $scope.showAll = true;
  $scope.sort = 2;
  $scope.getIcon = function(i) {
    return ($scope.sort == i ? 'ion-ios-circle-filled' : 'ion-ios-circle-outline')
  }

  var getI = function() {
    return ($scope.showAll ? 'ion-ios-close-outline assertive' : 'ion-ios-checkmark-outline balanced')
  }

  var parseDate = function(time) {
    var dates = time.split('-')
    var parts = dates[0].split('.')

    var c = new Date();
    var cm = c.getMonth();
    var cy = c.getFullYear()

    var m = parts[1]
    var year = 0;

    if (m < p) {
      if (cm < p) {
        year = cy;
      } else {
        year = cy + 1;
      }
    } else {
      if (cm < p) {
        year = cy - 1;
      } else {
        year = cy;
      }
    }

    var date = new Date(year, parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    return date;
  }

  var getButtons = function() {
    return [{
      text: '<i class="icon ' + getI() + '"></i> Nur mich anzeigen'
    }, {
      text: '<i class="icon ' + $scope.getIcon(0) + '"></i>Nach Datum sortieren'
    }, {
      text: '<i class="icon ' + $scope.getIcon(1) + '"></i>Nach Name sortieren'
    }, {
      text: '<i class="icon ' + $scope.getIcon(2) + '"></i>Nach Dienst sortieren'
    }]
  }

  var sort = function() {
    switch ($scope.sort) {
      case 0:
        $scope.data.sort(sort_by('time', false, function(a) {
          return parseDate(a)
        }));
        break;
      case 1:
        $scope.data.sort(sort_by('name', false, function(a) {
          return a.toUpperCase()
        }));
        break;
      case 2:
        $scope.data.sort(sort_by('service', false, function(a) {
          return a.toUpperCase()
        }));
        break;
    }
  }

  $scope.more = function() {
    $ionicActionSheet.show({
      buttons: getButtons(),
      buttonClicked: function(index) {
        switch (index) {
          case 0:
            $scope.showAll = !$scope.showAll;
            break;
          default:
            $scope.sort = index - 1;
            sort();
            break;
        }
        return true;
      }
    });
  }

  $scope.serviceClick = function(service) {
    ClassServiceService.selectedService = service
    goTo($state, 'klassendiensteDetail')
  };

  $scope.reload = function() {
    var d = $scope.getParam();

    ClassServiceService.getData(d).then(function(response) {
      $scope.data = response;
      sort();

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


.controller('loginCtrl', function($scope, $cordovaBarcodeScanner, $state, $ionicHistory, $ionicViewSwitcher, $ionicPlatform, LoginService, ionicToast, TimegridService, InfoService, TeacherEmailService, PeopleService, PageConfigService) {
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
        InfoService.load().then(function() {
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

  $scope.scan = function() {
    $cordovaBarcodeScanner.scan().then(function(imageData) {
      var url = imageData.text;
      $scope.data.school = getParameterByName('school', url).toLowerCase();
      $scope.data.user = getParameterByName('user', url).toLowerCase();
    }, function(error) {
      ionicToast.show(error, 'bottom', true, 1000)
    });
  }

  $ionicPlatform.onHardwareBackButton(function() {
    $scope.goBack();
  }, 100);
})

.controller('feiertageCtrl', function($scope, $state, $ionicHistory, $ionicViewSwitcher, $ionicPlatform, ionicToast, $ionicPopup) {

  $scope.$on("$ionicView.beforeEnter", function(event, data) {
    $scope.data = JSON.parse(localStorage.holidays);
  });

  $scope.goBack = function() {
    goBack($ionicHistory);
  }

  var parseHoliday = function(h) {

    var start = new Date(h.startDate);
    start.setHours(0);

    var end = new Date(h.endDate)
    end.setHours(24);

    return {
      title: h.longName,
      startDate: start,
      endDate: end
    }
  }

  $scope.addToCal = function(h) {
    var calInter = $scope.settings.calInter;
    var e = parseHoliday(h);
    addToCalender(e.title, null, null, e.startDate, e.endDate, calInter, ionicToast)
  }

  $scope.addAll = function() {
    var confirmPopup = $ionicPopup.confirm({
      template: 'Alle Feiertage zum Kalender hinzufügen?'
    });

    confirmPopup.then(function(res) {
      if (res) {
        add();
      } else {
        return;
      }
    });


    var calOptions = window.plugins.calendar.getCalendarOptions();
    calOptions.firstReminderMinutes = null

    var holi = $scope.data.slice(0);

    var add = function() {

      if (holi.length == 0) {
        ionicToast.show('Alle hinzugefügt', 'top', false, 1000);
        return;
      }

      var e = parseHoliday(holi[0]);
      window.plugins.calendar.findEvent(e.title, e.location, e.notes, e.startDate, e.endDate,
        function(result) {
          if (!result.length) {
            window.plugins.calendar.createEventWithOptions(e.title, null, null, e.startDate, e.endDate, calOptions,
              function(result) {
                holi.splice(0, 1);
                add();
              },
              function(err) {

              }
            );
          } else {
            holi.splice(0, 1);
            add();
          }
        },
        function(err) {

        });
    }



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

  $scope.sendLog = function() {
    console.log('send')
    LoggingService.get().then(function(response) {

      cordova.plugins.email.open({
        to: 'schunits@rho2.eu',
        attachments: response,
        subject: 'Log-Datei',
        body: '<b>Beschreibung des Fehlers:</b><br>',
        isHtml: true
      });
    });
  }

  $scope.del = function() {
    LoggingService.del().then(function(a) {
      console.log('del')
      ionicToast.show('deleted', 'top', false, 1000);
    });
  }
})

.controller('einstellungenCtrl', function($scope, $state, $ionicHistory, $window) {
  loadSettings($scope);

  $scope.save = function() {
    localStorage.settings = JSON.stringify($scope.settings);

    var element = angular.element(document.getElementById('navbar'));
    var element1 = angular.element(document.getElementById('menu-button'));

    if ($scope.settings.darkmode) {
      console.log('dark')
      element.removeClass('bar-stable');

      element.addClass('bar-black');
      element1.addClass('button-dark');
    } else {
      element.removeClass('bar-black');

      element.addClass('bar-stable');
    }
    $window.location.reload(true);
  }

  $scope.resetMenu = function() {
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

var goTo = function(st, tar) {
  window.plugins.nativepagetransitions.slide({},
    function(msg) {
      console.log("success: " + msg)
    },
    function(msg) {
      alert("error: " + msg)
    }
  );
  st.go(tar);
}

var goBack = function(h) {
  window.plugins.nativepagetransitions.slide({
      "direction": "right",
    },
    function(msg) {
      console.log("success: " + msg)
    },
    function(msg) {
      alert("error: " + msg)
    }
  );
  h.goBack();
}

var getMonday = function(date) {
  var day = date.getDay() || 7;
  if (day !== 1)
    date.setHours(-24 * (day - 1));
  return date;
}

var dateString = function(date) {
  return ('' + date.getFullYear() + ('0' + (date.getMonth() + 1)).slice(-2) + ('0' + date.getDate()).slice(-2));
}

var dateString2 = function(date) {
  var d = weekDays[date.getDay()]
  d += ' '
  d += ('0' + date.getDate()).slice(-2)
  d += '.'
  d += ('0' + (date.getMonth() + 1)).slice(-2)
  d += '.20'
  d += ('0' + date.getFullYear()).slice(-2)
  return d
}

var addDays = function(date, d) {
  return date.setDate(date.getDate() + d);
}

var shortDateString = function(s) {
  return s.substring(6) + '.' + s.substring(4, 6) + '.' + s.substring(2, 4)
}

var loadSettings = function(scope) {
  scope.$on("$ionicView.beforeEnter", function(event, data) {
    scope.settings = JSON.parse(localStorage.settings || defSettings);
    console.log(scope.settings)
  });
}

var addToCalender = function(title, eventLocation, notes, startDate, endDate, calInter, ionicToast) {

  var calOptions = window.plugins.calendar.getCalendarOptions();
  calOptions.firstReminderMinutes = null

  ionicToast = ionicToast || {
    show: function(a, b, c, d) {
      console.log('a')
    }
  }

  window.plugins.calendar.findEvent(title, eventLocation, notes, startDate, endDate,
    function(result) {
      if (!result.length) {
        if (calInter) {
          window.plugins.calendar.createEventInteractivelyWithOptions(title, null, null, startDate, endDate, calOptions, function(result) {}, function(err) {});
        } else {
          window.plugins.calendar.createEventWithOptions(title, eventLocation, notes, startDate, endDate, calOptions,
            function(result) {
              ionicToast.show('Zum Kalender hinzugefügt', 'top', false, 1000);
            },
            function(err) {
              ionicToast.show(err, 'top', false, 1000);
            }
          );
        }
      } else {
        ionicToast.show('Bereits im Kalender', 'top', false, 1000);
      }
    },
    function(err) {
      ionicToast.show(err, 'top', false, 1000);
    });
}

var weekDays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

var defSettings = '{"darkmode": false,"calInter": true,"examSync": false,"homeworkSync" : false}'

var defaultMenu = function() {
  return '[{"text":"Start","icon":"ion-ios-home","link":"startseite.start","class":""},{"text":"Sprechstunden","icon":"ion-ios-telephone","link":"sprechstunden","class":"menu-timetable"},{"text":"Stundenplan","icon":"ion-ios-calendar-outline","link":"startseite.stundenplanHeute","class":"menu-timetable"},{"text":"Mein Unterricht","icon":"ion-ios-bookmarks","link":"meinUnterricht","class":"menu-lesson"},{"text":"Unterricht Schüler","icon":"ion-ios-bookmarks","link":"unterrichtSchuler","class":"menu-lesson"},{"text":"Prüfungen","icon":"ion-ios-bookmarks","link":"startseite.prufungen","class":"menu-lesson"},{"text":"Tagesunterricht Klassen","icon":"ion-ios-bookmarks","link":"tagesunterrichtKlassen","class":"menu-lesson"},{"text":"Meine Abwesenheiten","icon":"ion-ios-flag","link":"meineAbwesenheiten","class":"menu-absence"},{"text":"Fehlzeiten","icon":"ion-ios-flag","link":"fehlzeiten","class":"menu-absence"},{"text":"Befreiungen","icon":"ion-ios-flag","link":"befreiungen","class":"menu-absence"},{"text":"Hausaufgaben","icon":"ion-ios-book","link":"startseite.hausaufgaben","class":"menu-classbook"},{"text":"Klassenbucheinträge","icon":"ion-ios-book","link":"klassenbucheintrage","class":"menu-classbook"},{"text":"Klassendienste","icon":"ion-ios-book","link":"klassendienste","class":"menu-classbook"}]';
}


var pDate = function(d) {
  var parts = d.split(".");
  return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
}

var sort_by = function(field, reverse, primer) {

  var key = primer ?
    function(x) {
      return primer(x[field])
    } :
    function(x) {
      return x[field]
    };

  reverse = !reverse ? 1 : -1;

  return function(a, b) {
    return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
  }
}

var getParameterByName = function(name, url) {
  if (!url) {
    url = window.location.href;
  }
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}
