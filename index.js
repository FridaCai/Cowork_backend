#!/usr/bin/env node


'use strict';
var Grids = require('./data/grids.js');
var User = require('./data/user');
var Users = require('./data/users');

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'cowork-websocket-server';

var port = 8081;
var WebSocketServer = require('websocket').server;
var http = require('http');

const rowNum = 3;
const columnNum = 3;
const colors = [15073298,9421599,41193,9570179,15425792,2272312,
        34513,12451969,15964160,39236,26807,14942335,
        16566272,39787,18333,15007850,16773376,40598,
        1908872,15007823,13622016,41153,6297990,15073331];

var clients = {};
var users = new Users();
var grids = Grids.create({rowNum: rowNum, columnNum:columnNum});

var server = http.createServer(function(request, response) {
	if(request.url === '/status'){
		response.writeHead(200, {'Content-Type': 'application/json'});
		var responseObject = {
		  coworkers: users.dump(),
          clients: Object.keys(clients)
		}
		response.end(JSON.stringify(responseObject));
	}else{
		response.writeHead(404);
    	response.end();	
	}
});

server.listen(port, function() {
    console.log(`${new Date()}  Server is listening on port ${port}`);
});

var wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  return true;
}



wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      request.reject();
      return;
    }
    var connection = request.accept('echo-protocol', request.origin);
    var user;
    var clientId;

    /*if(history.length > 0){
    	var obj = {
    		type: 'history',
    		value: history
    	}
    	connection.sendUTF(JSON.stringify(obj));
    }*/
    var broadcast = function(obj){
        Object.keys(clients).map(function(key){
            clients[key].sendUTF(JSON.stringify(obj));
        })
    }


    var _logOut = function(){
        user && users.delete(user);
        user && colors.push(user.color);

        var obj = {
            type: "logoutResponse",
            value: -1
        }
        connection.sendUTF(JSON.stringify(obj));


        var obj = {
            type: 'coworkerlist',
            value: users.dump()
        };
        broadcast(obj);
    }

    connection.on('message', function(message) {
        if(message.type != 'utf8'){
        	return;
        }

        var msg = JSON.parse(message.utf8Data);
        switch(msg.type){
            case 'setId':
                clientId = msg.value;
                clients[clientId] = connection;
                break;
        	case 'login':
                user = User.create({
                    name: msg.value,
                    color: colors.shift()
                });
        		users.push(user);

        		var obj = {
        			type: "loginResponse",
        			value: user.dump()
        		}
        		connection.sendUTF(JSON.stringify(obj));

                var obj = {
                    type: 'coworkerlist',
                    value: users.dump()
                };
                broadcast(obj);
            case 'getGrid':
                var grid = grids.dump();
                var obj = {
                    type: "getGrid",
                    value: grid
                }
                connection.sendUTF(JSON.stringify(obj));
        		break;

        	case 'logout':
        		_logOut();
        		break;


        	case 'gridFocus':
            case 'gridChange':
            case 'gridBlur':
                var line = msg.value.line;
                var column = msg.value.column;
                var value = msg.value.value;

                var status, label;
                if(msg.type === 'gridFocus'){
                    status = 1;
                }else if(msg.type === 'gridChange'){
                    status = 2;
                    label = value;
                }else if(msg.type === 'gridBlur'){
                    status = 3;
                }

                var grid = grids.getGrid(line, column);
                if(status == 1 && grid.status != 3){
                    var obj = {
                        type: 'gridFocusError',
                        value: `error! grid ${line}${column} is occupied and cannot be focus.`
                    };
                    connection.sendUTF(JSON.stringify(obj));
                }else{
                    grid.update(status, label, user);
                    var obj = {
                        type: "updateGrid",
                        value: grids.dump()
                    }
                    broadcast(obj);
                }
        		break;
        }
    });
    connection.on('close', function(reasonCode, description) {
        delete clients[clientId];
		_logOut();
    });
});