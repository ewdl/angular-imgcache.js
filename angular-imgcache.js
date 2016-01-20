angular.module('ImgCache', [])

.provider('ImgCache', function() {

    ImgCache.$init = function() {

        ImgCache.init(function() {
            ImgCache.$deferred.resolve();
        }, function() {
            ImgCache.$deferred.reject();
        });
    }

    this.manualInit = false;

    this.setOptions = function(options) {
        angular.extend(ImgCache.options, options);
    }

    this.setOption = function(name, value) {
        ImgCache.options[name] = value;
    }

    this.$get = ['$q', function ($q) {

        ImgCache.$deferred = $q.defer();
        ImgCache.$promise = ImgCache.$deferred.promise;

        if(!this.manualInit) {
            ImgCache.$init();
        }

        return ImgCache;
    }];

})

.directive('imgCache', ['ImgCache', function() {

    return {
        restrict: 'A',
        link: function(scope, el, attrs) {

            var setImg = function(type, el, src) {

                ImgCache.getCachedFileURL(src, function(src, dest) {

                    if(type === 'bg') {
                        el.css({'background-image': 'url(' + dest + ')' });
                    } else {
                        el.attr('src', dest);
                    }
                });
            }

            var loadImgSrc = function(el, src) {

                ImgCache.$promise.then(function() {
                    if (src) {
                        ImgCache.isCached(src, function(path, success) {
                            if (success) {
                                ImgCache.useCachedFileWithSource(el, path);
                            } else {
                                ImgCache.cacheFile(path, function() {
                                    ImgCache.useCachedFileWithSource(el, path);
                                });
                            }
                        });
                    }
                });
            }

            var loadImgBg = function(el, src) {

                ImgCache.$promise.then(function() {
                    if (src) {
                        ImgCache.isCached(src, function(path, success) {
                            if (success) {
                                ImgCache.useCachedBackground(el, path);
                            } else {
                                ImgCache.cacheBackground(el, function () {
                                    ImgCache.useCachedBackground(el, path);
                                });
                            }
                        });
                    }
                });
            }

            attrs.$observe('icSrc', function(src) {

                loadImgSrc(el, src);

            });

            attrs.$observe('icBg', function(src) {

                loadImgBg(el, src);

            });

        }
    };
}]);
