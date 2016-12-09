'use strict';
module.exports = class User{
	constructor(){

	}
	init(param){
		this.name = param.name;
		this.color = param.color;
	}
	dump(){
		return {
			name: this.name,
			color: this.color
		}
	}
	update(name, color){
		this.name = name;
		this.color = color;
	}
	static create(param){
		var user = new User();
		user.init(param);
		return user;
	}
}