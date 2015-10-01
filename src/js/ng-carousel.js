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
    animationEndEvents: 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
    carousel: {
      baseDir: 'img/',
      slidePrefix: 'slide-',
      count: 16,
      fileType: '.png',
      slideInterval: 5000 // milliseconds
    },
    slides: [
      {
        src: 'img/slide-1.png', // Must contain path with filename and extension
        animation: 'fadeIn'
      }
    ]
  };

  angular
    .constant('CONFIG', CONFIG);

  // Carousel Service
  function CarouselService (CONFIG) {

    // TO DO:
    // Add checks for slides versus carousel config

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

    return {
      getSlides: getSlides
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
                  'data-ng-show="$index === activeIndex"',
                  'data-ng-repeat="slide in slides"',
                  'data-ng-src="{{ slide.src }}"',
                  'data-ng-carousel-animate="{{ $index }}"',
                '/>',
            '</div>',
          '</div>'
        ].join(''),
      controllerAs: 'CarouselController',
      controller: function (CONFIG, CarouselService) {

        var _this = this;

        _this.slides = CarouselService.getSlides();
        _this.activeIndex = 0;

        function randomIndex(length) {
          function rand(min,max) {
            return Math.floor(Math.random() * (max - min)) + min;
          }
          return rand(1,length);
        }

        _this.getNextIndex = function () {
          var nextIdx;

          do {
            nextIdx = randomIndex(_this.slides.length);
          }
          while(nextIdx === _this.activeIndex);

          return nextIdx;
        };

        _this.getAnimation = function () {
          var idx = randomIndex(CONFIG.animations.length);
          return CONFIG.animations[idx];
        };

      },
      link: function ($scope, $element, $attrs) {

        $scope.slides =

        // TO DO:
        // Add support for specific animations for each slide
        // Add attributes to check for random vs sequential

        var slideInterval = parseInt($attrs['slideInterval'],10) || CONFIG.carousel.slideInterval || 3000;

        // every x amt of time
        $interval(function() {

          // set active index (this hides old slide and displays new slide)
          $scope.activeIndex = $scope.getNextIndex();

          // animate the (new) active index via broadcast
          $scope.$broadcast('carouselAnimate', {
            activeIndex: $scope.activeIndex,
            animation: $scope.getAnimation()
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
