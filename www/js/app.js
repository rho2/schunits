angular.module('app', ['ionic', 'app.controllers', 'app.routes', 'app.directives', 'app.services', 'ionic-datepicker'])

.config(function($ionicConfigProvider, $httpProvider) {
  $httpProvider.defaults.withCredentials = true;
  $ionicConfigProvider.scrolling.jsScrolling(false);
  $ionicConfigProvider.form.checkbox("circle");
})

.config(function(ionicDatePickerProvider) {
  var datePickerObj = {
    inputDate: new Date(),
    titleLabel: 'Datum ausw&auml;hlen',
    setLabel: 'Set',
    todayLabel: 'Heute',
    closeLabel: 'Schliessen',
    mondayFirst: true,
    weeksList: ["So.", "Mo.", "Di.", "Mi.", "Do.", "Fr.", "Sa."],
    monthsList: ["Jan.", "Feb.", "Mrz.", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sept.", "Okt.", "Nov.", "Dez."],
    templateType: 'popup',
    from: new Date(2012, 8, 1),
    to: new Date(2018, 8, 1),
    showTodayButton: true,
    dateFormat: 'dd MM yyyy',
    closeOnSelect: true,
    disableWeekdays: []
  };
  ionicDatePickerProvider.configDatePicker(datePickerObj);
})

.run(function($ionicPlatform, $rootScope) {

  var element = angular.element(document.getElementById('navbar'));
  var element1 = angular.element(document.getElementById('menu-button'));
  var settings = JSON.parse(localStorage.settings || '{}');

  if (settings.darkmode) {
    element.addClass('bar-black');
    element1.addClass('button-dark');
  } else {
    element.addClass('bar-stable');

  }

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)

    codePush.sync(null, {
      updateDialog: true,
      installMode: InstallMode.IMMEDIATE
    });

    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    window.plugins.nativepagetransitions.globalOptions.duration = 500;
    window.plugins.nativepagetransitions.globalOptions.iosdelay = 50;
    window.plugins.nativepagetransitions.globalOptions.androiddelay = 50;
    window.plugins.nativepagetransitions.globalOptions.winphonedelay = 5;
    window.plugins.nativepagetransitions.globalOptions.slowdownfactor = 4;
    // these are used for slide left/right only currently
    window.plugins.nativepagetransitions.globalOptions.fixedPixelsTop = 0;
    window.plugins.nativepagetransitions.globalOptions.fixedPixelsBottom = 0;

  });
})
