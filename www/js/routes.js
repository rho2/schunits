angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('startseite.start', {
      url: '/start',
      views: {
        'tab1': {
          templateUrl: 'templates/start.html',
          controller: 'startCtrl'
        }
      }
    })

  .state('stundenplanDetail', {
    url: '/timetable/details',
    templateUrl: 'templates/details/stundenplan.html',
    controller: 'stundenplanDetailCtrl'
  })

  .state('startseite.stundenplanHeute', {
    url: '/timetableToday',
    views: {
      'tab2': {
        templateUrl: 'templates/stundenplanHeute.html',
        controller: 'stundenplanHeuteCtrl'
      }
    }
  })

  .state('sprechstunden', {
    url: '/officehour',
    templateUrl: 'templates/sprechstunden.html',
    controller: 'sprechstundenCtrl'
  })

  .state('sprechstundenDetail', {
    url: '/officehour/details',
    templateUrl: 'templates/details/sprechstunden.html',
    controller: 'sprechstundenDetailCtrl'
  })

  .state('startseite', {
    url: '/main',
    templateUrl: 'templates/startseite.html',
    abstract: true
  })

  .state('meinUnterricht', {
    url: '/lessonlist',
    templateUrl: 'templates/meinUnterricht.html',
    controller: 'meinUnterrichtCtrl'
  })

  .state('meinUnterrichtDetail', {
    url: '/lessonlist/details',
    templateUrl: 'templates/details/meinUnterricht.html',
    controller: 'meinUnterrichtDetailCtrl'
  })

  .state('unterrichtSchuler', {
    url: '/lessonstudent',
    templateUrl: 'templates/unterrichtSchuler.html',
    controller: 'unterrichtSchulerCtrl'
  })

  .state('unterrichtSchulerDetail', {
    url: '/lessonstudent/details',
    templateUrl: 'templates/details/unterrichtSchuler.html',
    controller: 'unterrichtSchulerDetailCtrl'
  })

  .state('startseite.prufungen', {
    url: '/exams',
    views: {
      'tab3': {
        templateUrl: 'templates/prufungen.html',
        controller: 'prufungenCtrl'
      }
    }
  })

  .state('prufungenDetail', {
    url: '/prufungenDetail',
    templateUrl: 'templates/details/prufungen.html',
    controller: 'prufungenDetailCtrl'
  })

  .state('tagesunterrichtKlassen', {
    url: '/lessonklasse',
    templateUrl: 'templates/tagesunterrichtKlassen.html',
    controller: 'tagesunterrichtKlassenCtrl'
  })

  .state('tagesunterrichtKlassenDetail', {
    url: '/lessonklasse/details',
    templateUrl: 'templates/details/tagesunterrichtKlassen.html',
    controller: 'tagesunterrichtKlassenDetailCtrl'
  })

  .state('meineAbwesenheiten', {
    url: '/absencelist',
    templateUrl: 'templates/meineAbwesenheiten.html',
    controller: 'meineAbwesenheitenCtrl'
  })

  .state('meineAbwesenheitenDetail', {
    url: '/absencelist/details',
    templateUrl: 'templates/details/meineAbwesenheiten.html',
    controller: 'meineAbwesenheitenDetailCtrl'
  })

  .state('fehlzeiten', {
    url: '/absencetimes',
    templateUrl: 'templates/fehlzeiten.html',
    controller: 'fehlzeitenCtrl'
  })

  .state('fehlzeitenDetail', {
    url: '/absencetimes/details',
    templateUrl: 'templates/details/fehlzeiten.html',
    controller: 'fehlzeitenDetailCtrl'
  })

  .state('klassenbucheintrage', {
    url: '/regevent',
    templateUrl: 'templates/klassenbucheintrage.html',
    controller: 'klassenbucheintrageCtrl'
  })

  .state('startseite.hausaufgaben', {
    url: '/homework',
    views: {
      'tab5': {
        templateUrl: 'templates/hausaufgaben.html',
        controller: 'hausaufgabenCtrl'
      }
    }
  })

  .state('hausaufgabenDetail', {
    url: '/hausaufgabenDetail',
    templateUrl: 'templates/details/hausaufgaben.html',
    controller: 'hausaufgabenDetailCtrl'
  })

  .state('klassendienste', {
    url: '/classservice',
    templateUrl: 'templates/klassendienste.html',
    controller: 'klassendiensteCtrl'
  })

  .state('klassendiensteDetail', {
    url: '/classservice/details',
    templateUrl: 'templates/details/klassendienste.html',
    controller: 'klassendiensteDetailCtrl'
  })

  .state('befreiungen', {
    url: '/exemption',
    templateUrl: 'templates/befreiungen.html',
    controller: 'befreiungenCtrl'
  })

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl'
  })

  .state('einstellungen', {
    url: '/settings',
    templateUrl: 'templates/einstellungen.html',
    controller: 'einstellungenCtrl'
  })

  .state('info', {
    url: '/about',
    templateUrl: 'templates/info.html',
    controller: 'infoCtrl'
  })

  .state('timegrid', {
    url: '/timegrid',
    templateUrl: 'templates/timegrid.html',
    controller: 'timegridCtrl'
  })

  .state('stundenplan', {
    url: '/timetable',
    templateUrl: 'templates/stundenplan.html',
    controller: 'stundenplanCtrl'
  })

  .state('sonstiges', {
    url: '/sonstiges',
    templateUrl: 'templates/misc/sonstiges.html',
    controller: 'sonstigesCtrl'
  })

  .state('feiertage', {
    url: '/feiertage',
    templateUrl: 'templates/misc/feiertage.html',
    controller: 'feiertageCtrl'
  })

  .state('temail', {
    url: '/temail',
    templateUrl: 'templates/misc/temail.html',
    controller: 'temailCtrl'
  })

  .state('people', {
    url: '/people',
    templateUrl: 'templates/misc/people.html',
    controller: 'peopleCtrl'
  })

  $urlRouterProvider.otherwise('/main/timetableToday')



});
