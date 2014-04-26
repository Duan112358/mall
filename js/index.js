var module = angular.module('mallApp', ['ngRoute']);

module.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/main.html',
            controller: 'MainCtrl'
        })
        .when('/other', {
            templateUrl: 'views/goods.html',
            controller: 'MainCtrl'
        })
        .when('/:item', {
            templateUrl: 'views/main.html',
            controller: 'MainCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });

    $locationProvider.html5Mode(true);
});

module.factory('paginationService', function() {
    var DEFAULTS = {
        TOTAL_RECORDS: 0,
        PAGE_SIZE: 10,
        SLIDER_SIZE: 5,
        RADIX: 10
    };
    var totalRecords, totalPages, pSize, pLength;

    function stringToInt(str) {
        if (str == null) {
            return 0;
        }
        var result = parseInt(str, DEFAULTS.RADIX);
        return isNaN(result) ? 0 : result;
    }
    return {
        setData: function(tr, ps, pl) {
            var trInt = stringToInt(tr),
                psInt = stringToInt(ps),
                plInt = stringToInt(pl);
            totalRecords = trInt < 1 ? DEFAULTS.TOTAL_RECORDS : trInt;
            pSize = psInt < 1 ? DEFAULTS.PAGE_SIZE : psInt;
            pLength = plInt < 1 ? DEFAULTS.SLIDER_SIZE : plInt;
            totalPages = Math.ceil(totalRecords / pSize);
        },
        calculateTotalPage: function(totalRecords, pageSize) {
            var tr = stringToInt(totalRecords),
                ps = stringToInt(pageSize);
            return Math.ceil(tr / ps);
        },
        slideTo: function(fromPageIndex, toPageIndex) {
            var pages = [];
            var startPage, endPage, remain = 1;
            var shift = Math.floor(pLength / 2) - 1;
            if (totalPages <= pLength) {
                startPage = 1;
                endPage = totalPages;
            } else {
                if (toPageIndex < fromPageIndex) {
                    /** Go to previous page */
                    endPage = toPageIndex + shift <= totalPages ? toPageIndex + shift : totalPages;
                    startPage = endPage - pLength + remain >= 1 ? endPage - pLength + remain : 1;
                    if (endPage - startPage + remain < pLength && endPage - startPage + remain > 0) {
                        endPage += pLength - (endPage - startPage + remain);
                    }
                } else if (toPageIndex >= fromPageIndex) {
                    /** Go to next page */
                    startPage = toPageIndex - shift > 0 ? toPageIndex - shift : 1;
                    endPage = startPage + pLength - remain < totalPages ? startPage + pLength - remain : totalPages;
                    if (endPage - startPage + remain < pLength && endPage - startPage + remain > 0) {
                        startPage -= pLength - (endPage - startPage + remain);
                    }
                }
            }
            if (startPage <= endPage) {
                for (var i = startPage; i <= endPage; i++) {
                    pages.push(i);
                }
            }
            return pages;
        }
    };
});

module.directive('pagination', [
    'paginationService',
    function(paginationService) {
        return {
            restrict: 'A',
            replace: true,
            template: '<ul ng-if="totalPages > 1" class="pagination">' + '<li ng-class="{disabled: isFirstPage()}">' + '<a ng-click="back()" href="javascript:void(0)">&laquo;</a>' + '</li>' + '<li ng-repeat="page in pages" ng-class="{active: isActive(page)}">' + '<a ng-click="goTo($index)" href="javascript:void(0)">{{page}}</a>' + '</li>' + '<li ng-class="{disabled: isLastPage()}">' + '<a ng-click="next()" href="javascript:void(0)">&raquo;</a>' + '</li>' + '</ul>',
            scope: {
                pTotal: '=',
                pSize: '=',
                pLength: '@',
                onPaginate: '&'
            },
            link: function(scope, element) {
                scope.pages = [];
                scope.currentPage = 1;
                scope.totalPages = 1;
                scope.goTo = function(pageIndex) {
                    if (pageIndex < 0 || pageIndex >= scope.pages.length) {
                        return;
                    }
                    var page = scope.pages[pageIndex];
                    if (scope.currentPage === page) {
                        return;
                    }
                    paginate(scope.pages[pageIndex]);
                };
                scope.next = function() {
                    if (scope.currentPage >= scope.totalPages) {
                        return;
                    }
                    var nextPage = scope.currentPage < scope.totalPages ? scope.currentPage + 1 : scope.totalPages;
                    paginate(nextPage);
                };
                scope.back = function() {
                    if (scope.currentPage < 2) {
                        return;
                    }
                    var previousPage = scope.currentPage > 1 ? scope.currentPage - 1 : 1;
                    paginate(previousPage);
                };
                scope.isActive = function(page) {
                    return scope.currentPage == page;
                };
                scope.isFirstPage = function() {
                    return scope.currentPage === 1;
                };
                scope.isLastPage = function() {
                    return scope.currentPage === scope.totalPages;
                };
                scope.$on('pagination:reset', function() {
                    reset();
                });
                scope.$watch('pTotal', function() {
                    refresh();
                });
                reset();

                function paginate(page) {
                    scope.pages = paginationService.slideTo(scope.currentPage, page);
                    scope.currentPage = page;
                    var remain = 1;
                    var start = (page - 1) * scope.pSize;
                    var end = page * scope.pSize - remain;
                    end = end >= scope.pTotal ? scope.pTotal - 1 : end;
                    scope.onPaginate({
                        page: page,
                        start: start,
                        end: end
                    });
                }

                function refresh() {
                    scope.currentPage = 1;
                    paginationService.setData(scope.pTotal, scope.pSize, scope.pLength);
                    scope.totalPages = paginationService.calculateTotalPage(scope.pTotal, scope.pSize);
                    scope.pages = paginationService.slideTo(0, 1);
                }

                function reset() {
                    refresh();
                    paginate(1);
                }
            }
        };
    }
]);

module.controller('MainCtrl', ['$scope', '$route', '$location',
    function($scope, $route, $location) {

        $scope.stores = [];
        $scope.goods = [];
        $scope.loading = true;

        $scope.carousel = [{
            url: 'img/banner.jpg',
            linkTo: 'javascript:void(0);'
        }, {
            url: 'img/banner.jpg',
            linkTo: 'javascript:void(0);'
        }, {
            url: 'img/banner.jpg',
            linkTo: 'javascript:void(0);'
        }, {
            url: 'img/banner.jpg',
            linkTo: 'javascript:void(0);'
        }, {
            url: 'img/test.jpg',
            linkTo: 'javascript:void(0);'
        }];

        for (var i = 5; i >= 0; i--) {
            $scope.stores.push({
                name: 'store ' + i,
                weixin: 'weixin ' + i,
                avatar: !! (i % 2) ? 'img/test.jpg' : 'img/test1.jpg'
            });
        }
        $scope.loading = false;

        for (var i = 100; i >= 0; i--) {
            $scope.goods.push({
                name: 'good 0' + i,
                prize: i,
                store: 'javascript:void(0);',
                avatar: !! (i % 2) ? 'img/test.jpg' : 'img/test1.jpg'
            })
        };

        $('.carousel').carousel();

        $scope.totalRecords = $scope.goods.length;
        $scope.currentPage = 0;
        $scope.pageSize = 18;
        $scope.dataRows = [];

        $scope.paginate = function(page, start, end) {
            $scope.currentPage = page;
            $scope.dataRows = $scope.goods.slice(start, end + 1);
        }

        $(window).unbind('scroll');
        $(window).bind('scroll', function(event) {
            var offset = $(document).scrollTop();
            $scope.$apply(function() {
                if (offset > 40) {
                    $('.navbar').addClass("fixed-top");
                } else {
                    $('.navbar').removeClass("fixed-top");
                }

            });
        });

        $scope.getClass = function(params) {
            var item = $route.current && $route.current.params.item;
            if (($location.path() == '/' && !params) || ($location.path() === '/other' && params === 'other')) {
                return "navbar-active";
            }
            return item == params ? "navbar-active" : "";
        }
    }
])
