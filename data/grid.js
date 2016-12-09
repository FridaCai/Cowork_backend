'use strict';
module.exports = class Grid{
	constructor(){

	}
	init(param){
		this.status = param ? param.status : 3; //1:foucs, 2:change, 3:blur. 
		this.label = param ? param.label : "";
		this.user = param ? param.user : null;
	}
	dump(){
		return {
			status: this.status,
			label: this.label,
			user: this.user ? this.user.dump():{}
		}
	}
	update(status, label, user){
		this.status = status;
		if(label){
			this.label = label;	
		}
		this.user = user;
	}
	static create(param){
		var grid = new Grid();
		grid.init(param);
		return grid;
	}
}