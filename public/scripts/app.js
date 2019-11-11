'use strict';

const app = angular.module('myApp', []);

/* Controllers */
app.controller('AppCtrl', function($scope, socket) {
    $scope.info = {};
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
    });



    $scope.submitInitForm = function () {
        console.log('Info', $scope.info);
        $scope.isInit = false;

        socket.emit('join', $scope.info, function (err) {
            if (err) {
                alert(err);
                window.location.href = '/';
            } else {
                console.log('No Error');
            }
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
