'use strict';

var User = require('./user');

module.exports = class Users extends Array{
	constructor(){
		super();
	}
	init(param){
		param && param.map((function(userParam){
			var user = User.create(userParam);
			this.push(user);
		}).bind(this))
	}
	dump(){
		return this.map(function(user){
			return user.dump();
		})
	}
	delete(user){
		var index = this.find(function(_user, index){
			if(_user.name === user.name)
				return index;
		})
		this.splice(index, 1);
	}
	static create(param){
		var users = new Users();
		users.init(param);
		return users;
	}
}