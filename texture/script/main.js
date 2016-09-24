(function() {

var app = angular.module('app', [ 'angular-clipboard', 'ngSanitize', 'ui.bootstrap' ]);

app.controller('MainController', function($scope, $uibModal) {

    var lastImageType = null;
    var scriptTemplate = null;

    // Scope variables

    $scope.isCustom = { };

    $scope.images = { };
    $scope.defaults = { };

    $scope.uploadTooltip = `<div>
        Supported filenames: <ul>
        <li>tiles.png</li>
        <li>speedpad.png</li>
        <li>speedpadblue.png</li>
        <li>speedpadred.png</li>
        <li>portal.png</li>
        <li>splats.png</li>
    </ul></div>`;

    // Local methods
    
    var generatePreview = function(type, data) {
        var text = '.' + type + ' { background-image: url(' + data + '); }';
        $('#' + type + '-style').html(text);
    };

    // Scope methods
    
    $scope.reset = function() {
        for (var key in $scope.defaults) {
            $scope.images[key] = $scope.defaults[key];
            $scope.isCustom[key] = false;
            generatePreview(key, $scope.defaults[key]);
        }
    };

    $scope.generate = function() {
        var data = scriptTemplate;
        for (var key in $scope.images)
            data = data.replace(':' + key + ':', $scope.images[key]);
        $uibModal.open({
            templateUrl: 'views/modal.html',
            controller: 'ModalController',
            resolve: {
                data: function() { return data; } 
            }
        });
    };
    
    $scope.uploadImage = function(target) {
        lastImageType = target;
        $('#image-input').click();
    };

    $scope.uploadArchive = function() {
        $('#archive-input').click();
    };

    $scope.onImageUpload = function(e) {
        if (!e.target || !e.target.files) return;
        var reader = new FileReader();
        reader.onloadend = function() {
            $scope.$apply(function() {
                $scope.isCustom[lastImageType] = true;
                $scope.images[lastImageType] = reader.result;
                generatePreview(lastImageType, reader.result);
            });
        };
        reader.readAsDataURL(e.target.files[0]);
    };

    $scope.onArchiveUpload = function(e) {
        if (!e.target || !e.target.files) return;
        var reader = new FileReader();
        reader.onloadend = function() {
            JSZip.loadAsync(reader.result).then(function(zip) {
                for (var file in zip.files) {
                    var filename = zip.files[file].name.toLowerCase();
                    [ 'portal', 'speedpad', 'speedpadblue', 'speedpadred', 'splats', 'tiles' ].forEach(function(type) {
                        if (filename != type + '.png') return;
                        zip.files[file].async('base64').then(function(data) {
                            $scope.$apply(function() {
                                $scope.images[type] = 'data:image/png;base64,' + data; 
                                $scope.isCustom[type] = true;
                                generatePreview(type, $scope.images[type]);
                            });
                        });
                    });
                }
            });
        };
        reader.readAsArrayBuffer(e.target.files[0]);
    };
    
    // Init
    
    [ 'portal', 'speedpad', 'speedpadblue', 'speedpadred', 'splats', 'tiles' ].forEach(function(file) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'assets/' + file + '.png', true);
        xhr.responseType = 'blob';
        xhr.onload = function() {
            if (this.status != 200) return;
            var reader = new FileReader();
            reader.onloadend = function() {
                $scope.images[file] = reader.result;
                $scope.defaults[file] = reader.result;
                generatePreview(file, reader.result);
            };
            reader.readAsDataURL(this.response);
        };
        xhr.send();
    });

    $.ajax({
        method: 'GET',
        url: 'assets/script.template.js',
        dataType: 'text',
        success: function(data) {
            scriptTemplate = data;
        }
    });

});

app.controller('ModalController', function($scope, $uibModalInstance, data) {

    $scope.data = data;

    $scope.close = function() {
        $uibModalInstance.close();
    };

    $scope.download = function() {
        var a = document.createElement('a');
        var blob = new Blob([ data ], { type: 'application/javascript' });
        a.href = URL.createObjectURL(blob);
        a.download = 'tagpro.custom.texture.user.js';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

});

app.directive('onFileChange', function() {
    return {
        restrict: 'A',
        link: function($scope, element, attrs) {
            var handler = $scope.$eval(attrs.onFileChange);
            element.bind('change', function(e) {
                $scope.$apply(function() {
                    handler(e);
                });
            });
        }
    };
});

})();
