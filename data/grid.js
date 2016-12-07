'use strict';
module.exports = class Grid{
	constructor(){

	}
	init(param){
		this.label = param ? param.label : "";
		this.takenBy = param ? param.takenBy : "";
	}
	dump(){
		return {
			label: this.label,
			takenBy: this.takenBy
		}
	}
	static create(param){
		var grid = new Grid();
		grid.init(param);
		return grid;
	}
}