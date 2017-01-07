angular.module('app.services', ['ionic'])

.service('HomeworkService', function($http, $q, LoggingService, LoginService) {
  return {
    getData: function(d) {
      var deferred = $q.defer();
      LoginService.login();
      $http({
        method: 'POST',
        url: 'https://arche.webuntis.com/WebUntis/studenthomeworklist.do',
        headers: formEncHeader,
        data: 'selectedDateRange=' + encodeURIComponent(JSON.stringify(d))
      }).then(function(response) {
        try {
          var headers = ["start", "end", "subject", "teacher", "text"];
          var table = parseTable(response, headers, "list");
        } catch (err) {
          LoggingService.log('error', JSON.stringify(err) + '\n' + JSON.stringify(response))

        }
        localStorage.c_homework = JSON.stringify(table) || '{}';
        deferred.resolve(table);
      }, function(response) {
        LoggingService.log('error', JSON.stringify(response))
        deferred.reject(response);
      });
      return deferred.promise;
    },
    selectedHomework: null
  };
})

.service('ExamService', function($http, $q, LoggingService, LoginService) {
  return {
    getData: function(d) {
      var deferred = $q.defer();
      LoginService.login();
      $http({
        method: 'POST',
        url: 'https://arche.webuntis.com/WebUntis/examlist.do',
        headers: formEncHeader,
        data: 'selectedDateRange=' + encodeURIComponent(JSON.stringify(d))
      }).then(function(response) {
        try {
          var headers = ["typ", "name", "class_name", "date", "start", "end", "subject", "teacher", "room", "text", "mark"]
          var data = parseTable(response, headers, "list");
          for (var i = 0; i < data.length; i++) {
            var a = data[i]['subject'].split('</tooltip>')
            data[i]['subject'] = getOnlyText(a[0])
            data[i]['subject_short'] = getOnlyText(a[1])
          }
        } catch (err) {
          LoggingService.log('error', JSON.stringify(err) + '\n' + JSON.stringify(response))

        }
        localStorage.c_exam = JSON.stringify(data) || '{}';
        deferred.resolve(data);
      }, function(response) {
        LoggingService.log('error', JSON.stringify(response))
        deferred.reject(response);
      });
      return deferred.promise;
    },
    selectedExam: null
  };
})

.service('OfficeHourService', function($http, $q, LoggingService, LoginService) {
  return {
    getData: function(d) {
      var deferred = $q.defer();
      LoginService.login();
      $http({
        method: 'POST',
        url: 'https://arche.webuntis.com/WebUntis/officehourlist.do',
        headers: formEncHeader,
        data: 'date=' + d
      }).then(function(response) {
        try {
          var headers = ["teacher", "day", "date", "start", "end", "mail"];
          var data = parseTable(response, headers, "table")
          for (var i = 0; i < data.length; i++) {
            data[i]['mail'] = getOnlyText(data[i]['mail'])
          }
        } catch (err) {
          LoggingService.log('error', JSON.stringify(err) + '\n' + JSON.stringify(response))

        }
        localStorage.c_office_hour = JSON.stringify(data) || '{}';
        deferred.resolve(data);
      }, function(response) {
        LoggingService.log('error', JSON.stringify(response))

        deferred.reject(response);
      });
      return deferred.promise;
    },
    selectedHour: null
  };
})

.service('LessonListService', function($http, $q, LoggingService, LoginService) {
  return {
    getData: function(d) {
      var deferred = $q.defer();
      LoginService.login();
      $http({
        method: 'POST',
        url: 'https://arche.webuntis.com/WebUntis/lessonlist.do',
        headers: formEncHeader,
        data: 'selectedDateRange=' + encodeURIComponent(JSON.stringify(d))
      }).then(function(response) {
        try {
          var headers = ["typ_pic", "typ", "class_name", "group", "subject", "teacher", "lessons", "start", "end"];
          var data = parseTable(response, headers, "list");
          for (var i = 0; i < data.length; i++) {
            var a = data[i]['class_name'].split('</tooltip>')
            data[i]['class_name'] = getOnlyText(a[1])
            var b = data[i]['subject'].split('</tooltip>')
            data[i]['subject'] = getOnlyText(b[0])
            data[i]['subject_short'] = getOnlyText(b[1])
          }
        } catch (err) {
          LoggingService.log('error', JSON.stringify(err) + '\n' + JSON.stringify(response))

        }
        localStorage.c_lesson_list = JSON.stringify(data) || '{}';
        deferred.resolve(data);
      }, function(response) {
        LoggingService.log('error', JSON.stringify(response))

        deferred.reject(response);
      });
      return deferred.promise;
    },
    selectedLesson: null
  };
})

.service('LessonStudentService', function($http, $q, LoggingService, LoginService) {
  return {
    getData: function(d) {
      var deferred = $q.defer();
      LoginService.login();
      $http({
        method: 'POST',
        url: 'https://arche.webuntis.com/WebUntis/lessonstudentweeklist.do',
        headers: formEncHeader,
        data: 'selectedDateRange=' + encodeURIComponent(JSON.stringify(d))
      }).then(function(response) {
        try {
          var headers = ["class_name", "teacher", "subject", "lessons", "start", "end"];
          var data = parseTable(response, headers, "list")
          for (var i = 0; i < data.length; i++) {
            var a = data[i]['class_name'].split('</tooltip>')
            data[i]['class_name'] = getOnlyText(a[1])
            var b = data[i]['subject'].split('</tooltip>')
            data[i]['subject'] = getOnlyText(b[0])
            data[i]['subject_short'] = getOnlyText(b[1])
          }
        } catch (err) {
          LoggingService.log('error', JSON.stringify(err) + '\n' + JSON.stringify(response))

        }
        localStorage.c_lesson_student = JSON.stringify(data) || '{}';
        deferred.resolve(data);
      }, function(response) {
        LoggingService.log('error', JSON.stringify(response))

        deferred.reject(response);
      });
      return deferred.promise;
    },
    selectedLesson: null
  };
})

.service("LessonKlasseService", function($http, $q, LoggingService, LoginService) {
  return {
    getData: function() {
      var deferred = $q.defer();
      LoginService.login();
      $http({
        method: 'POST',
        url: 'https://arche.webuntis.com/WebUntis/lessonklasselist.do',
        headers: formEncHeader
      }).then(function(response) {
        try {
          var headers = ["checkbox", "typ", "start", "end", "class_name", "teacher", "subject", "room", "empty", "classbook", "text", "homework"];
          var data = parseTable(response, headers, "list", false)
          for (var i = 0; i < data.length; i++) {
            var a = data[i]['class_name'].split('</tooltip>')
            data[i]['class_name'] = getOnlyText(a[1])
            var b = data[i]['teacher'].split('</tooltip>')
            data[i]['teacher'] = getOnlyText(b[1])
            var c = data[i]['subject'].split('</tooltip>')
            data[i]['subject'] = getOnlyText(c[0])
            data[i]['subject_short'] = getOnlyText(c[1])
            var d = data[i]['text'].split('</div>')
            data[i]['text'] = getOnlyText(d[1])
            var e = data[i]['homework'].split('</div>')
            data[i]['homework'] = getOnlyText(e[1])
            data[i]['room'] = getOnlyText(data[i]['room'])
          }
        } catch (err) {
          LoggingService.log('error', JSON.stringify(err) + '\n' + JSON.stringify(response))

        }
        localStorage.c_lesson_klasse = JSON.stringify(data) || '{}';
        deferred.resolve(data);
      }, function(response) {
        LoggingService.log('error', JSON.stringify(response))

        deferred.reject(response);
      });
      return deferred.promise;
    },
    selectedLesson: null
  };
})

.service('ClassServiceService', function($http, $q, LoggingService, LoginService) {
  return {
    getData: function(d) {
      var deferred = $q.defer();
      LoginService.login();
      $http({
        method: 'POST',
        url: 'https://arche.webuntis.com/WebUntis/classserviceslist.do',
        headers: formEncHeader,
        data: 'selectedDateRange=' + encodeURIComponent(JSON.stringify(d))
      }).then(function(response) {
        try {
          var headers = ["typ", "service", "name", "class_name", "time", "text"];
          var icons = ["ion-bug", "ion-paintbrush", "ion-person", "ion-person-stalker", "ion-paintbrush", "ion-trash-a", "ion-paintbrush", "ion-ios-body-outline", "ion-trash-a", "ion-medkit"]
          var data = parseTable(response, headers, "list")
          for (var i = 0; i < data.length; i++) {
            var tmp = document.createElement('div');
            tmp.innerHTML = data[i]['typ']
            var a = tmp.firstChild.src;
            var b = a.split('id=')
            var c = parseInt(b[1])
            data[i]['icon'] = icons[c]
          }
        } catch (err) {
          LoggingService.log('error', JSON.stringify(err) + '\n' + JSON.stringify(response))

        }
        localStorage.c_class_service = JSON.stringify(data) || '{}';
        deferred.resolve(data);
      }, function(response) {
        LoggingService.log('error', JSON.stringify(response))

        deferred.reject(response);
      });
      return deferred.promise;
    },
    selectedService: null
  };
})

.service('AbsenceTimesService', function($http, $q, LoggingService, LoginService) {
  return {
    getData: function(d) {
      var deferred = $q.defer();
      LoginService.login();
      $http({
        method: 'POST',
        url: 'https://arche.webuntis.com/WebUntis/absencetimes.do',
        headers: formEncHeader,
        data: 'selectedDateRange=' + encodeURIComponent(JSON.stringify(d))
      }).then(function(response) {
        data = {}
        try {
          var headers = ["student", "class_name", "day", "date", "time", "subject", "teacher", "days", "hours", "minutes", "counts", "reason", "status", "text"];
          data = parseTable(response, headers, "list")
          for (var i = 0; i < data.length; i++) {
            var a = data[i]['subject'].split('</tooltip>')
            data[i]['subject'] = getOnlyText(a[0])
            data[i]['subject_short'] = getOnlyText(a[1])
            var tmp = document.createElement('div')
            tmp.innerHTML = data[i]['counts']
            var b = tmp.firstChild.value
            data[i]['counts'] = b
          }
        } catch (err) {
          LoggingService.log('error', JSON.stringify(err) + '\n' + JSON.stringify(response))

        }
        localStorage.c_absence_times = JSON.stringify(data) || '{}';
        deferred.resolve(data);
      }, function(response) {
        LoggingService.log('error', JSON.stringify(response))

        deferred.reject(response);
      });
      return deferred.promise;
    },
    selectedAbsence: null
  };
})

.service('AbsenceListService', function($http, $q, LoggingService, LoginService) {
  return {
    getData: function(d) {
      var deferred = $q.defer();
      LoginService.login();
      $http({
        method: 'POST',
        url: 'https://arche.webuntis.com/WebUntis/absencelist.do',
        headers: formEncHeader,
        data: 'selectedDateRange=' + encodeURIComponent(JSON.stringify(d))
      }).then(function(response) {
        data = {}
        try {
          var headers = ["checkbox", "modify", "typ", "student", "class_name", "start", "end", "start_time", "end_time", "reason", "status", "text"];
          var data = parseTable(response, headers, "list")
          for (var i = 0; i < data.length; i++) {
            var a = data[i]['typ'].split('</tooltip>')
            data[i]['typ'] = getOnlyText(a[0])
          }
        } catch (err) {
          LoggingService.log('error', JSON.stringify(err) + '\n' + JSON.stringify(response))

        }
        localStorage.c_absence_list = JSON.stringify(data) || '{}';
        deferred.resolve(data);
      }, function(response) {
        LoggingService.log('error', JSON.stringify(response))

        deferred.reject(response);
      });
      return deferred.promise;
    },
    selectedAbsence: null
  }
})

.service('LoginService', function($http, ionicToast, TimegridService) {
  return {
    login: function() {
      var u = localStorage.username;
      var p = localStorage.password;
      var s = localStorage.school;
      var d = 'buttonName=login&school=' + s + '&j_username=' + u + '&j_password=' + p;
      return $http({
        method: 'POST',
        url: 'https://arche.webuntis.com/WebUntis/j_spring_security_check',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        data: d
      }).then(function(response) {
        return response;
      });
    }
  }
})

.service('TimegridService', function($http) {
  return {
    load: function() {
      var c = localStorage.csyi;
      $http({
        method: 'POST',
        url: 'https://arche.webuntis.com/WebUntis/jsonrpc_web/jsonTimegridService',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data: '{"id":0,"method":"getTimegrid","params":[' + c + '],"jsonrpc":"2.0"}'
      }).then(function(response) {
        var u = response.data.result.units;
        var ad = response.data.result.activeDays;
        var days = response.data.result.days;
        var units = {};
        for (var i = 0; i < u.length; i++) {
          units[u[i].startTime] = u[i];
        }
        localStorage.timegrid = JSON.stringify(units);
        localStorage.activeDays = ad;
        localStorage.days = JSON.stringify(days);

        var timegridEnd = {};
        for (i in units) {
          timegridEnd[units[i].endTime] = units[i];
        }
        localStorage.timegridEnd = JSON.stringify(timegridEnd);
      });
    },
    get: function() {
      return JSON.parse(localStorage.timegrid);
    },
    getDays: function() {
      return JSON.parse(localStorage.days);
    },
    getADays: function() {
      return (localStorage.activeDays);
    }
  }
})

.service('TimetableService', function($http, $q, LoggingService, LoginService) {
  return {
    load: function(date, type) {
      LoginService.login();
      var deferred = $q.defer();

      if (type == 1) {
        var id = localStorage.class_id;
      } else {
        var id = localStorage.personId;
      }

      date = getMonday(date)
      var d = dateString(date)

      $http({
        method: 'POST',
        url: 'https://arche.webuntis.com/WebUntis/Timetable.do',
        headers: formEncHeader,
        data: 'ajaxCommand=getWeeklyTimetable&elementType=' + type + '&elementId=' + id + '&date=' + d + '&filter.klasseId=-1&filter.restypeId=-1&filter.buildingId=-1&filter.roomGroupId=-1&filter.departmentId=-1&formatId=1'
      }).then(function(response) {
        try {
          //einzelne Stunden
          var p = response.data.result.data.elementPeriods[id];
          //Elemente wie Facher, Lehrer, Raume etc.
          var e = response.data.result.data.elements;

          var timegrid = JSON.parse(localStorage.timegrid);
          var timegridEnd = JSON.parse(localStorage.timegridEnd);

          //Objekt, dass spaeter zurueckgegeben wird
          //erster Index ist der Tag als String
          //zweiter Index ist die Spalte, in der die Stunde stattfindet
          var periods = {};
          var elem = {};

          var header = ['', 'class_name', 'teacher', 'subject', 'room']
          var headerl = ['', 'class_name_long', 'teacher_long', 'subject_long', 'room_long']

          //Fuelle elem mit den Daten aus e. Der erste Index ist die ID des jeweiligen Elementes, die zweite der Typ
          // 1:Klasse | 2:Lehrer | 3:Fach | 4:Raum | 5:Schueler
          for (var i = 0; i < e.length; i++) {
            if (!elem[e[i].id]) {
              elem[e[i].id] = {};
            }
            elem[e[i].id][e[i].type] = e[i];
          }

          for (var i = 0; i < p.length; i++) {
            try {
              var start = timegrid[p[i].startTime].name;
              var end = timegridEnd[p[i].endTime].name;
              var span = parseInt(end) - parseInt(start);

              if (!periods[p[i].date]) {
                periods[p[i].date] = []
              }

              p[i].e = [];
              p[i].start = p[i].startTime.toString().slice(0, -2) + ":" + p[i].startTime.toString().slice(-2);
              p[i].end = p[i].endTime.toString().slice(0, -2) + ":" + p[i].endTime.toString().slice(-2);
              p[i].endi = parseInt(end);
              p[i].span = span;

              //Gehe alle Elemente (Klassen, Lehrer, Fach, Raum) durch
              for (var j = 0; j < p[i].elements.length; j++) {
                //Elememt, das gerade bearbeitet wird aus dem elem-Array laden
                p[i].elements[j] = elem[p[i].elements[j].id][p[i].elements[j].type];
                //Setzen der Forder- und Hintergrundfarbe
                p[i].backColor = (p[i].elements[j].backColor || p[i].backColor);
                p[i].foreColor = (p[i].elements[j].foreColor || p[i].foreColor);

                //wenn noch nicht vorhanden, setze displayname, ansonsten haenge in hinten an
                if (typeof p[i][header[p[i].elements[j].type]] === "undefined") {
                  p[i][header[p[i].elements[j].type]] = p[i].elements[j].displayname;
                } else {
                  p[i][header[p[i].elements[j].type]] += ',' + p[i].elements[j].displayname;
                }

                if (!p[i].e[p[i].elements[j].type]) {
                  p[i].e[p[i].elements[j].type] = []
                }
                p[i].e[p[i].elements[j].type].push(p[i].elements[j]);
              }

              //Ubertragen von p in periods
              //anzeigen der Studen in mehreren Reihen, wenn span groesser als 1 ist
              start = parseInt(start)
              for (var j = 0; j <= span; j++) {
                if (!periods[p[i].date][start + j]) {
                  periods[p[i].date][start + j] = [];
                }
                periods[p[i].date][start + j].push(p[i]);
              }
            } catch (err) {}
          }
          for (pa in periods) {
            for (var i = 0; i < periods[pa].length; i++) {
              //falls Stunde leer ist, mit leerem Dummy Objekt fuellen
              if (!periods[pa][i]) {
                periods[pa][i] = [{
                  empty: 'empty'
                }]
              } else {
                for (ind in periods[pa][i]) {
                  //ersetze alle anderen Stunden, wenn die Stunde 'is.event' und 'is.additional'
                  if (periods[pa][i][ind].is.event && periods[pa][i][ind].is.additional) {
                    periods[pa][i] = [periods[pa][i][ind]]
                    break;
                  }
                }
              }
            }
          }

          //Wenn Array leer ist, fuelle Array mit Ferien-Dummy Elementen
          if (p.length == 0) {
            var emp = {
              subject: '-',
              teacher: '-',
              room: '-',
              class_name: '-',
              cellState: 'HOLIDAY'
            };

            periods[dateString(date)] = {}
            for (var i = 0; i <= Object.keys(timegrid).length; i++) {
              periods[dateString(date)][i] = emp;
            }

          }
        } catch (err) {
          LoggingService.log('error', JSON.stringify(err) + '\n' + JSON.stringify(response))

        }
        localStorage['c_timetable_' + d] = JSON.stringify(periods) || '{}';
        deferred.resolve(periods);
      }, function(response) {
        LoggingService.log('error', JSON.stringify(response))

        deferred.reject(response);
      });
      return deferred.promise;
    },
    selectedLesson: null
  }
})

.service('InfoService', function($http) {
  return {
    load: function() {
      return $http({
        method: 'POST',
        url: 'https://arche.webuntis.com/WebUntis/index.do',
      }).then(function(response) {
        var d = document.createElement('div');
        d.innerHTML = response.data;
        s = d.getElementsByTagName('script')[0];
        var a = s.innerHTML.split('grupet:')[1].split(';')

        var pos = a[0].lastIndexOf('}');
        var b = a[0].substring(0, pos)
        var b = JSON.parse(b);

        localStorage.holidays = JSON.stringify(b.calendarServiceConfig.holidays);
        localStorage.lname = b.licence.name;
        localStorage.lname2 = b.licence.name2;
        localStorage.email = b.loginServiceConfig.user.email;
        localStorage.personId = b.loginServiceConfig.user.personId;
        localStorage.csyi = b.calendarServiceConfig.schoolyears.slice(-1)[0].id;

      });
    },

  }
})

.service('PageConfigService', function($http) {
  return {
    load: function() {
      $http({
        method: 'POST',
        url: 'https://arche.webuntis.com/WebUntis/Timetable.do',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: 'ajaxCommand=getPageConfig&type=1'
      }).then(function(response) {
        localStorage.class_id = response.data.selectedElementId;
      });
      $http({
        method: 'POST',
        url: 'https://arche.webuntis.com/WebUntis/Timetable.do',
        headers: formEncHeader,
        data: 'ajaxCommand=getPageConfig&type=5'
      }).then(function(response) {
        localStorage.dName = response.data.elements[0].displayname;
      });
    },

  }
})

.service('TeacherEmailService', function($http) {
  return {
    load: function() {
      $http({
        method: 'POST',
        url: 'https://arche.webuntis.com/WebUntis/jsonrpc_web/jsonTeacherService',
        headers: {
          'Content-Type': 'application/json',
        },
        data: '{"id":0,"method":"getEmailAddressesOfTeachers", "params":[[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99]] ,"jsonrpc":"2.0"}'
      }).then(function(response) {
        var r = response.data.result;

        localStorage.temails = JSON.stringify(r);

      });
    },

  }
})

.service('PeopleService', function($http) {
  return {
    load: function() {
      $http({
        method: 'POST',
        url: 'https://arche.webuntis.com/WebUntis/jsonrpc_web/jsonSmsService',
        headers: {
          'Content-Type': 'application/json',
        },
        data: '{"id":0,"method":"getFormData", "jsonrpc":"2.0"}'
      }).then(function(response) {
        var r = response.data.result.recipientsSelectData.candidates;
        localStorage.people = JSON.stringify(r);

      });
    },

  }
})

.service('LoggingService', function($timeout, $http, $q) {
  return {
    log: function(l, m) {
      if (!cordova.file) {
        return;
      }

      console.log(m)
      var pathToFile = cordova.file.externalDataDirectory + 'log.txt';

      window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function(directoryEntry) {
        directoryEntry.getFile('log.txt', {
          create: true
        }, function(fileEntry) {
          fileEntry.createWriter(function(fileWriter) {

            fileWriter.onwriteend = function(e) {};
            fileWriter.onerror = function(e) {};

            fileWriter.seek(fileWriter.length);
            fileWriter.write('[' + (l || 'error') + ']' + '\t' + m + '\n');

          }, function(e) {});
        }, function(e) {});
      }, function(e) {});
    },

    get: function() {
      var deferred = $q.defer();

      var pathToFile = cordova.file.externalDataDirectory + 'log.txt';
      deferred.resolve(pathToFile);

      return deferred.promise;
    },

    del: function() {
      var deferred = $q.defer();

      var pathToFile = cordova.file.externalDataDirectory + 'log.txt';

      window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function(directoryEntry) {
        directoryEntry.getFile('log.txt', {
          create: true
        }, function(fileEntry) {


          fileEntry.remove(function() {
            deferred.resolve('');
          }, function(e) {});

        }, function(e) {});
      }, function(e) {});

      return deferred.promise;
    },

  }
})

.service('DateChoiceService', function($ionicPopup, ionicDatePicker) {
  return {
    set: function(scope, def, till_end) {

      scope.choices = {
        'CUSTOM': 'Datumsbereich',
        'CURRENT_DATE': 'Aktueller Tag',
        'CURRENT_WEEK': 'Aktuelle Woche',
        'CURRENT_MONTH': 'Aktueller Monat',
        'CURRENT_SCHOOLYEAR': 'Aktuelles Schuljahr'
      }

      if (till_end) {
        scope.choices['TILL_END_OF_SCHOOLYEAR'] = 'Bis Schuljahresende'
      }

      scope.choice = {
        value: def
      };

      var d1 = getMonday(new Date())
      var d2 = new Date();
      d2.setDate(d1.getDate() + 6);

      scope.dates = [{
        'd': d1,
        's': dateString(d1)
      }, {
        'd': d2,
        's': dateString(d2)
      }]

      scope.openDatePicker = function(t) {

        var dpo = {
          callback: function(val) {

            var date = new Date(val);
            scope.dates[t].d = date
            scope.dates[t].s = dateString(date)

            scope.choice.value = 'CUSTOM';
            scope.reload();
          },
          closeOnSelect: true,
          inputDate: scope.dates[t].d
        }

        ionicDatePicker.openDatePicker(dpo);
      };

      scope.openSelect = function() {
        scope.popup = $ionicPopup.confirm({
          templateUrl: 'templates/modals/select.html',
          scope: scope,
          buttons: [],
        });
      }

      scope.closeSelect = function() {
        console.log(scope.dates)

        scope.popup.close();
        scope.reload();
      }

      scope.getParam = function() {
        return {
          "startDate": parseInt(scope.dates[0].s),
          "endDate": parseInt(scope.dates[1].s),
          "name": "",
          "id": -1,
          "type": scope.choice.value
        };
      }
    }

  }
})

var getOnlyText = function(elem) {
  var tmp = document.createElement('div');
  tmp.innerHTML = elem
  return (tmp.textContent || tmp.innerText || "").trim()
}


var parseTable = function(response, headers, class_name, use_title = true) {
  var d = document.createElement('div');
  d.innerHTML = response.data;
  table = d.getElementsByClassName(class_name)[0]
  var data = [];
  for (var i = 1; i < table.rows.length; i++) {
    var tr = table.rows[i];
    var rowData = {};
    for (var j = 0; j < tr.cells.length; j++) {
      if (use_title) {
        rowData[headers[j]] = (tr.cells[j].title || tr.cells[j].innerHTML).trim();
      } else {
        rowData[headers[j]] = (tr.cells[j].innerHTML).trim();
      }
    }
    rowData["id"] = i;
    data.push(rowData);
  }
  return data
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

var formEncHeader = {
  'X-Requested-With': 'XMLHttpRequest',
  'Content-Type': 'application/x-www-form-urlencoded',
  'Accept': '*/*'
}
