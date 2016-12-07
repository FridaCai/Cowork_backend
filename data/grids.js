'use strict';

var Grid = require('./grid');

module.exports = class Grids extends Array{
	constructor(){
		super();
	}
	init(param){
		for(var i=0; i<param.rowNum; i++){
			var row = [];
			for(var j=0; j<param.columnNum; j++){
				row.push(Grid.create());
			}
			this.push(row);			
		}
	}
	dump(){
		return this.map(function(row){
			return row.map(function(grid){
				return grid.dump();
			})
		})
	}
	static create(param){
		var grids = new Grids();
		grids.init(param);
		return grids;
	}
}