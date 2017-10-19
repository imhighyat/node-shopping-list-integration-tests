const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const should = chai.should();

chai.use(chaiHttp);

describe('Recipes List', function() {
	before(function() {
		return runServer();
	});
	after(function() {
		return closeServer();
	});
	//tests
	it('should list recipes on GET', function(){
		//returning a Promise
		return chai.request(app)
		.get('/recipes')
		.then(function(res){
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('array');
			res.body.length.should.be.at.least(1);
			const expectedKeys = ['name', 'ingredients'];
			res.body.forEach(function(item){
				item.should.be.a('object');
				item.should.include.keys(expectedKeys);
			});
		});
	});

	it('should add a recipe on POST', function() {
		const newItem = {name: "banana shake", ingredients: ['banana', 'ice', 'milk']};
		return chai.request(app)
		.post('/recipes')
		.send(newItem)
		.then(function(res){
			res.should.have.status(201);
			res.body.should.be.a('object');
			res.body.should.include.keys('name', 'ingredients');
			res.body.should.not.be.null;
			res.body.should.deep.equal(Object.assign(newItem, {id: res.body.id}));
			//additional tests
			//res.body.ingredients.should.be.a('array');
			res.body.ingredients.length.should.be.at.least(1);
		});
	});

	it('should update the recipes on PUT', function(){
		//example recipe we are updating
		const updateData = {name: "foo", ingredients: ['ingredient1', 'ingredient2', 'ingredient3']};
		return chai.request(app)
		.get('/recipes')
		.then(function(res){
			//assign the id of the first recipe that we received
			updateData.id = res.body[0].id;
			//attach the id of the recipe on the POST request
			return chai.request(app)
			.put(`/recipes/${updateData.id}`)
			//then send the updated data
			.send(updateData);
		})
		//check if the status code is 204
		.then(function(res){
			res.should.have.status(204);
		});
	});

	it('should delete items on DELETE', function(){
		return chai.request(app)
		//get the current list to see which one we can delete
		.get('/recipes')
		.then(function(res){
			return chai.request(app)
			.delete(`/recipes/${res.body[0].id}`);
		})
		.then(function(res){
			res.should.have.status(204);
		});
	});
});