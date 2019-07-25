var express = require("express")
var path = require("path")
var favicon = require("static-favicon")
var logger = require("morgan")
var cookieParser = require("cookie-parser")
var bodyParser = require("body-parser")
var fileUpload = require('express-fileupload')
var indexRoute = require("./routes/index")
var userRoute = require("./routes/user")
var chefRoute = require("./routes/chef")
var app = express()
var mysql = require("mysql")

// view engine setup
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "jade")

app.use(favicon())
app.use(logger("dev"))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(fileUpload())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))

app.use("/", indexRoute)
app.use("/user", userRoute)
app.use("/chef", chefRoute)

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
	var err = new Error("Not Found")
	err.status = 404
	next(err)
})

/// error handlers

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500)
		res.send({
			message: err.message,
			error: err
		})
	})
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500)
	res.send({
		message: err.message,
		error: {}
	})
})

// //db connection
// var con = mysql.createConnection({
// 	host: 'localhost',
// 	user: 'phpmyadmin',
// 	password: 'root',
// 	database: 'cheffy'
// })

// con.connect(function(err) {
// 	if (err) throw err
// 	console.log('Connected to cheffy!')
// })

module.exports = app
// module.exports = con
