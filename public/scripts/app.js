'use strict';

const app = angular.module('myApp', []);

/* Controllers */
app.controller('AppCtrl', function($scope, socket,  $window) {
    $scope.info = {};
    $scope.newInfo = {};
    $scope.isInit = true;
    $scope.messages = [];
 
    socket.on('updateUsersList', data => {
        $scope.users = data;
    });

    socket.on('newMessage', data => {
        console.log(data);
        let message = {
            from: data.from,
            text: data.text,
            createdAt: moment(data.createdAt).format('LT')
        };
        $scope.messages.push(message);
        $window.document.title = `${data.from} sends new message.`;
        var x = document.getElementById('player');
        x.play();
    });

    $scope.submitInitForm = function () {
        $scope.isInit = false;
        $scope.info.room = 'dev';
        socket.emit('join', $scope.info, function (err) {
            if (err) {
                alert(err);
                window.location.href = '/';
            }
        });
    }; 

    $scope.submitMessage = function () {
        socket.emit('createMessage', {
            text: $scope.newInfo.message
        }, function() {
            $scope.newInfo.message = '';
        });
    };
});

/* Services */
app.factory('socket', function($rootScope) {
    // eslint-disable-next-line no-undef
    const socket = io.connect();
    return {
        on: function(eventName, callback) {
            socket.on(eventName, function() {
                const args = arguments;
                $rootScope.$apply(function() {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function(eventName, data, callback) {
            socket.emit(eventName, data, function() {
                const args = arguments;
                $rootScope.$apply(function() {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        }
    };
});
