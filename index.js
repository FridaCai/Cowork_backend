#!/usr/bin/env node


'use strict';
var Grids = require('./data/grids.js');

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'cowork-websocket-server';

var port = 8081;
var WebSocketServer = require('websocket').server;
var http = require('http');

const rowNum = 3;
const columnNum = 3;

var clients, userNames, grids;

var initData = function(){
	clients = []; //login users.
	userNames = [];
	grids = Grids.create({rowNum: rowNum, columnNum:columnNum});
}
initData();


var server = http.createServer(function(request, response) {
	if(request.url === '/status'){
		response.writeHead(200, {'Content-Type': 'application/json'});
		var responseObject = {
		
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
    var index = clients.push(connection) - 1;
    var userName;

    /*if(history.length > 0){
    	var obj = {
    		type: 'history',
    		value: history
    	}
    	connection.sendUTF(JSON.stringify(obj));
    }*/

    connection.on('message', function(message) {
        if(message.type != 'utf8'){
        	return;
        }

        var msg = JSON.parse(message.utf8Data);
        switch(msg.type){
        	case 'login':
        		userName = msg.value;
        		userNames.push(userName);


        		var obj = {
        			type: "loginResponse",
        			value: userName
        		}
        		connection.sendUTF(JSON.stringify(obj));


        		var obj = {
        			type: 'coworkerlist',
        			value: userNames
        		};
        		for(var i=0; i<clients.length; i++){
        			clients[i].sendUTF(JSON.stringify(obj));
        		}
        		break;

        	case 'logout':
        		userName = msg.value;
        		var index = userNames.indexOf(userName);
        		userNames.splice(index, 1);



        		var obj = {
        			type: "logoutResponse",
        			value: -1
        		}
        		connection.sendUTF(JSON.stringify(obj));





        		var obj = {
        			type: 'coworkerlist',
        			value: userNames
        		};

        		for(var i=0; i<clients.length; i++){
        			clients[i].sendUTF(JSON.stringify(obj));
        		}
        		break;


        	/*case 'gridfocus':
        		var gridId = msg.gridId;
        		if(occupiedGrid.indexOf(gridId) != -1){
        			var obj = {
        				type: 'response',
        				value: {
        					errCode: 0,
        					errMsg: `grid occupied: ${gridId}`
        				}
        			}
        			connection.sendUTF(JSON.stringify(obj));
        		}else{
        			occupiedGrid.push(gridId);
        			var obj = {
        				type: 'gridfocus',
        				value: gridId
        			}
	        		for(var i=0; i<clients.length; i++){
	        			clients[i].sendUTF(JSON.stringify(obj));
	        		}	
        		}
        		break;

        	case 'gridchange':
        		var obj = {

        		}
        		break;

        	case 'gridblur':*/
        }
    });
    connection.on('close', function(reasonCode, description) {
		clients.splice(index, 1); 

		var userNameIndex = userNames.indexOf(userName);
		if(userNameIndex !=-1){
			userNames.splice(userNameIndex, 1);	
		}
		
    });
});