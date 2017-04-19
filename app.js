
module.exports = {
    query: function(params){
	console.log("Query");
	console.log(params);
	return "no result";
    },
    getProperties(params){
	console.log("Props");
	console.log(params);
	return "no props";
    }
}
