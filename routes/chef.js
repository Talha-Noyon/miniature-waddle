var express = require("express")
var router = express.Router()
var con = require("../dbConfig")

/* GET home page. */
router.get("/", function(req, res) {
	//console.log("came")
	res.send("okay")
})
/*
	@POST /chef/signUp
	@Params: {u_name*, u_location*, u_email*, u_password*, u_shipping_address, u_imagePath}
	@Response: {newUser: {}}
*/
router.post("/signUp", function(req, res) {
	let params = req.body
	let error = {}
	// console.log(con)

	// all required params checking
	let requiredParams = ["u_name", "u_email", "u_password", "u_location"]
	for (item of requiredParams) {
		if (!params[item]) {
			error.msg = item + " is required."
			break
		}
	}

	if (error.hasOwnProperty("msg")) res.status(400).send(error)
	else {
		let sql = "INSERT INTO users SET ? "
		console.log(sql)

		con.query(sql, params, function(err, result) {
			if (err) {
				console.log(err.sqlMessage)
				res.status(500).json({ msg: err.sqlMessage })
			} else {
				console.log("1 record inserted", result.insertId)
				con.query("UPDATE users SET ? WHERE u_id = " + result.insertId, {type: 2}, function(err, result) {
					console.log(err.sqlMessage)
					res.status(500).json({ msg: err.sqlMessage })
				})
				params.id = result.insertId
				res.status(200).json({ newUser: params })
			}
		})
	}
})

/*
    @POST /chef/signIn
    @Params: {email*, password*}
    @Response: {user: {}}
*/
router.post("/signIn", function(req, res) {
	let params = req.body
	let error = {}

	// all required params checking

	if (error.hasOwnProperty("msg")) res.status(400).send(error)
	else {
		let sql = "SELECT * FROM users WHERE u_email = ? AND u_password = ?"
		let checks = [params.email, params.password]

		console.log(checks)

		con.query(sql, checks, function(err, result) {
			if (err) {
				// console.log(err.sqlMessage)
				res.status(500).json({ msg: err.sqlMessage })
			} else {
				// console.log("@result", result)
				if (result.length) res.status(200).json({ user: result[0] })
				else res.status(400).json({ msg: "Wrong email or password" })
			}
		})
	}
})


/*
	@POST /chef/addNewFood
	@Params: {id*, name*, images*, quantity*, price}
	@Response: {newFood: {}}
*/
router.post("/addNewFood", function(req, res) {
	let params = req.body
	let error = {}
	// console.log(con)

	// all required params checking
	let requiredParams = ["name", "quantity", "price"]
	for (item of requiredParams) {
		if (!params[item]) {
			error.msg = item + " is required."
			break
		}
	}
	/*var file = req.files.images;
	var img_name=file.name;
	if(file.mimetype == "image/jpeg" ||file.mimetype == "image/png"||file.mimetype == "image/gif" ){

		file.mv('public/images/upload_images/'+file.name, function(err) {

			if (err){
				return res.status(500).send(err);
			}

		})
	}*/
	if (error.hasOwnProperty("msg")) res.status(400).send(error)
	else {
		let sql = "INSERT INTO foods SET ? "
		console.log(sql)

		con.query(sql, params, function(err, result) {
			if (err) {
				console.log(err.sqlMessage)
				res.status(500).json({ msg: err.sqlMessage })
			} else {
				console.log("1 record inserted", result.insertId)
				params.id = result.insertId
				res.status(200).json({ newFood: params })
			}
		})
	}
})

/*
    @GET /chef/getAllOrders
    @Params: {} login check
    @Response: {ordersItems: {}}
*/
router.get("/getAllOrders", function(req, res) {
	let sql = "SELECT * FROM orders"
	// console.log(checks)

	con.query(sql, function(err, result) {
		if (err) {
			// console.log(err.sqlMessage)
			res.status(500).json({ msg: err.sqlMessage })
		} else {
			console.log("@result", result)
			if (result.length) res.status(200).json({ ordersItems: result[0] })
			else res.status(404).json({ msg: "No order has found" })
		}
	})
})


/*
    @GET /chef/order/update-status/:id
    @Params: {status} login check
    @Response: {changeStatus: {}}
*/
router.put("/order/update-status/:id", function(req, res) {
	let id = req.params.id
	let params = req.body
	let error = {}
	console.log(params)

	if (error.hasOwnProperty("msg")) res.status(400).send(error)
	else {
		let sql = "UPDATE orders SET ? WHERE id = " + id
		console.log(sql)

		con.query(sql, params, function(err, result) {
			if (err) {
				console.log(err.sqlMessage)
				res.status(500).json({ msg: err.sqlMessage })
			} else {
				console.log("1 record inserted", result)

				res.status(200).json({ updateStatus: params })
			}
		})
	}
})


/*
    @GET /chef/getAllCustomOrders
    @Params: {} login check
    @Response: {ordersItems: {}}
*/
router.get("/getAllCustomOrders", function(req, res) {
	let sql = "SELECT * FROM orders WHERE type =2"
	// console.log(checks)

	con.query(sql, function(err, result) {
		if (err) {
			// console.log(err.sqlMessage)
			res.status(500).json({ msg: err.sqlMessage })
		} else {
			console.log("@result", result)
			if (result.length) res.status(200).json({ ordersItems: result })
			else res.status(404).json({ msg: "No order has found" })
		}
	})
})



/*
    @GET /chef/custom-order/update-status/:id
    @Params: {status} login check
    @Response: {changeStatus: {}}
*/
router.put("/custom-order/update-status/:id", function(req, res) {
	let id = req.params.id
	let params = req.body
	let error = {}
	console.log(params)

	if (error.hasOwnProperty("msg")) res.status(400).send(error)
	else {
		let sql = "UPDATE orders SET ? WHERE type = 2 and id = " + id
		console.log(sql)

		con.query(sql, params, function(err, result) {
			if (err) {
				console.log(err.sqlMessage)
				res.status(500).json({ msg: err.sqlMessage })
			} else {
				//console.log("1 record inserted", result)

				res.status(200).json({ updateStatus: params })
			}
		})
	}
})


/*
    @GET /chef/getPendingOrders
    @Params: {} login check
    @Response: {ordersItems: {}}
*/
router.get("/getPendingOrders", function(req, res) {
	let sql = "SELECT * FROM orders Where status =1"
	// console.log(checks)

	con.query(sql, function(err, result) {
		if (err) {
			// console.log(err.sqlMessage)
			res.status(500).json({ msg: err.sqlMessage })
		} else {
			console.log("@result", result)
			if (result.length) res.status(200).json({ ordersItems: result[0] })
			else res.status(404).json({ msg: "No order has found" })
		}
	})
})


/*
    @GET /chef/sent-delivery/:id
    @Params: {status} login check
    @Response: {changeStatus: {}}
*/
router.put("/sent-delivery/:id", function(req, res) {
	let id = req.params.id
	let params = req.body
	let error = {}
	console.log(params)

	if (error.hasOwnProperty("msg")) res.status(400).send(error)
	else {
		let sql = "UPDATE orders SET ? WHERE id = " + id
		console.log(sql)

		con.query(sql, params, function(err, result) {
			if (err) {
				console.log(err.sqlMessage)
				res.status(500).json({ msg: err.sqlMessage })
			} else {
				//console.log("1 record inserted", result)

				res.status(200).json({ updateStatus: params })
			}
		})
	}
})


/*
    @GET /chef/getNotification
    @Params: {} login check
    @Response: {notification: {}}
*/
router.get("/getNotification", function(req, res) {
	let sql = "SELECT foods.name as food_name,users.u_name as user_name FROM reviews left join foods on reviews.foods_id=foods.id left join users on reviews.users_id= users.u_id "
	// console.log(checks)

	con.query(sql, function(err, result) {
		if (err) {
			// console.log(err.sqlMessage)
			res.status(500).json({ msg: err.sqlMessage })
		} else {
			console.log("@result", result)
			if (result.length) res.status(200).json({ notification: result })
			else res.status(404).json({ msg: "No notification has found" })
		}
	})
})




module.exports = router
