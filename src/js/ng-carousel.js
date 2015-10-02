/**
 * @license ng-carousel.js v0.0.1
 * (c) 2015 Nathaniel Huff http://nathanielhuff.com/
 * License: MIT
 */
(function(window, angular, undefined) {

  'use strict';

  var appName = 'Carousel';

  angular
    .module(appName, []);

  var CONFIG = {
    animations: [
      'bounce',
      'flash',
      'pulse',
      'rubberBand',
      'shake',
      'swing',
      'tada',
      'wobble',
      'jello',
      'bounceIn',
      'bounceInDown',
      'bounceInLeft',
      'bounceInRight',
      'bounceInUp',
      'bounceOut',
      'bounceOutDown',
      'bounceOutLeft',
      'bounceOutRight',
      'bounceOutUp',
      'fadeIn',
      'fadeInDown',
      'fadeInDownBig',
      'fadeInLeft',
      'fadeInLeftBig',
      'fadeInRight',
      'fadeInRightBig',
      'fadeInUp',
      'fadeInUpBig',
      'fadeOut',
      'fadeOutDown',
      'fadeOutDownBig',
      'fadeOutLeft',
      'fadeOutLeftBig',
      'fadeOutRight',
      'fadeOutRightBig',
      'fadeOutUp',
      'fadeOutUpBig',
      'flipInX',
      'flipInY',
      'flipOutX',
      'flipOutY',
      'lightSpeedIn',
      'lightSpeedOut',
      'rotateIn',
      'rotateInDownLeft',
      'rotateInDownRight',
      'rotateInUpLeft',
      'rotateInUpRight',
      'rotateOut',
      'rotateOutDownLeft',
      'rotateOutDownRight',
      'rotateOutUpLeft',
      'rotateOutUpRight',
      'hinge',
      'rollIn',
      'rollOut',
      'zoomIn',
      'zoomInDown',
      'zoomInLeft',
      'zoomInRight',
      'zoomInUp',
      'zoomOut',
      'zoomOutDown',
      'zoomOutLeft',
      'zoomOutRight',
      'zoomOutUp',
      'slideInDown',
      'slideInLeft',
      'slideInRight',
      'slideInUp',
      'slideOutDown',
      'slideOutLeft',
      'slideOutRight',
      'slideOutUp'
    ],
    animationDefault: 'fadeIn', // Optional
    animationEndEvents: 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
    // Provide carousel object...
    carousel: {
      baseDir: 'img/',          // Required
      slidePrefix: 'slide-',    // Required
      count: 10,                // Required
      fileType: '.png',         // Required
      slideInterval: 5000       // Optional, milliseconds
    },
    // ... or define the slides yourself
    slides: [
      {
        src: 'img/slide-1.png', // Must contain path with filename and extension
        animation: 'fadeIn'     // Optional, if not provided defaults to animationDefault
      }
    ]
  };

  angular
    .constant('CONFIG', CONFIG);

  // Carousel Service
  function CarouselService (CONFIG, UtilityService) {

    // check for slides versus carousel config

    var slides = (CONFIG.slides && CONFIG.slides.length) ? angular.copy(CONFIG.slides) : [];

    function buildSlides () {
      var c = CONFIG.carousel;

      for(var i=0,ii=c.count; i<ii; i++) {
        slides.push({
          src: c.baseDir + c.slidePrefix + (i+1) + c.fileType
        });
      }

    }
    if(!slides.length) buildSlides();

    var getSlides = function () {
      return slides;
    }

    var setSlides = function (newSlides) {
      slides = angular.copy(newSlides);
    }

    return {
      getSlides: getSlides,
      setSlides: setSlides
    };
  }

  angular
    .module(appName)
    .service('CarouselService', CarouselService);


  // ngCarousel Directive
  function ngCarousel (CONFIG, CarouselService, $interval) {
    return {
      restrict: 'E',
      scope: true,
      template: [
          '<div class="ng-carousel">',
            '<div class="slide-container">',
                '<img',
                  'class="slide"',
                  'data-ng-show="$index === CarouselController.activeIndex"',
                  'data-ng-repeat="slide in CarouselController.slides"',
                  'data-ng-src="{{ slide.src }}"',
                  'data-ng-carousel-animate="{{ $index }}"',
                '/>',
            '</div>',
          '</div>'
        ].join(''),
      controllerAs: 'CarouselController',
      controller: function (CONFIG, CarouselService) {

        var _this = this;

        _this.slides;
        _this.slideOrder;
        _this.activeIndex = 0;

        function randomIndex(length) {
          function rand(min,max) {
            return Math.floor(Math.random() * (max - min)) + min;
          }
          return rand(1,length);
        }

        _this.getNextIndex = function () {
          var nextIdx;

          if(_this.slideOrder === 'sequential') {
            nextIdx = ( (_this.activeIndex + 1) === _this.slides.length ) ? 0 : nextIdx + 1;
          } else {
            do {
              nextIdx = randomIndex(_this.slides.length);
            }
            while(nextIdx === _this.activeIndex);
          }

          return nextIdx;
        };

        _this.getAnimation = function (slideIdx) {

          var anim;

          if(_this.slides[slideIdx].animation) {
            anim = _this.slides[slideIdx].animation;
          } else if(CONFIG.animationDefault) {
            anim = CONFIG.animationDefault;
          } else {
            anim = CONFIG.animations[randomIndex(CONFIG.animations.length)];
          }

          return anim;
        };

      },
      link: function ($scope, $element, $attrs) {

        // check for localized slide data set (ex : from another $scope)
        if($attrs['slides']) {
          CarouselService.setSlides( $scope.$eval($attrs['slides']) );
        }
        $scope.CarouselController.slides = CarouselService.getSlides();

        // check for random vs sequential
        $scope.CarouselController.slideOrder = ($attrs['slideOrder']) ? $attrs['slideOrder'].toLowerCase() : 'random';

        // check for slideInterval override
        var slideInterval = parseInt($attrs['slideInterval'],10) || CONFIG.carousel.slideInterval || 3000;

        // check for directive-specific animation
        var animation = $attrs['animation'] || '';

        // every x amount of time
        $interval(function() {

          // set active index (this hides old slide and displays new slide)
          $scope.CarouselController.activeIndex = $scope.CarouselController.getNextIndex();

          var activeIdx = $scope.CarouselController.activeIndex;

          // animate the (new) active index via broadcast
          $scope.$broadcast('carouselAnimate', {
            activeIndex: activeIdx,
            animation: animation || $scope.CarouselController.getAnimation(activeIdx)
          });

        }, slideInterval);

      }
    };
  }

  angular
    .module(appName)
    .directive('ngCarousel', ngCarousel);

  // ngCarouselAnimate Directive
  function ngCarouselAnimate (CONFIG) {
    return {
      scope: true,
      restrict: 'A',
      link: function ($scope, $element, $attrs) {

        var index = parseInt($attrs['ngCarouselAnimate'],10);
        var animation = '';

        $scope.$on('carouselAnimate', function (evt, data) {
          if(data.activeIndex === index) {
            animation = 'animated ' + data.animation;
            $element.addClass(animation);
          }
        });

        $element.on(CONFIG.animationEndEvents, function (evt, data) {
          $element.removeClass(animation);
          animation = '';
        });

      }
    };
  }

  angular
    .module(appName)
    .directive('ngCarouselAnimate', ngCarouselAnimate);

})(window, window.angular);
