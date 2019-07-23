var mysql = require("mysql")

//db connection
var con = mysql.createConnection({

	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'cheffy',
	multipleStatements:true
})

con.connect(function(err) {
	if (err) throw err
	console.log("Connected to cheffy!")
})

module.exports = con
