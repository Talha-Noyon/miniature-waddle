var express = require("express")
var router = express.Router()
var con = require("../dbConfig")

/* 
	@POST /user/singnUp
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
				params.id = result.insertId

				res.status(200).json({ newUser: params })
			}
		})
	}
})

/* 
    @POST /user/singnIn
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
    @GET /user/profile/:id  
    @Params: {} login check
    @Response: {user: {}} 
*/
router.get("/profile/:id", function(req, res) {
	let id = req.params.id

	let sql = "SELECT * FROM users WHERE u_id = ?"
	// console.log(checks)

	con.query(sql, id, function(err, result) {
		if (err) {
			// console.log(err.sqlMessage)
			res.status(500).json({ msg: err.sqlMessage })
		} else {
			console.log("@result", result)
			if (result.length) res.status(200).json({ user: result[0] })
			else res.status(404).json({ msg: "No user has found" })
		}
	})
})

/* 
@PUT /user/profile/edit/:id  
@Params: {u_name, u_location, u_shipping_address, u_imagePath, u_email, u_password} login check
@Response: {updatedUser: {}} 
*/
router.put("/profile/edit/:id", function(req, res) {
	let params = req.body
	let id = req.params.id
	let error = {}
	console.log(params)

	if (error.hasOwnProperty("msg")) res.status(400).send(error)
	else {
		let sql = "UPDATE users SET ? WHERE u_id = " + id
		console.log(sql)

		con.query(sql, params, function(err, result) {
			if (err) {
				console.log(err.sqlMessage)
				res.status(500).json({ msg: err.sqlMessage })
			} else {
				// console.log("1 record inserted", result)
				con.query("UPDATE users SET ? WHERE u_id = " + result.insertId, {type: 1}, function(err, result) {
					console.log(err.sqlMessage)
					res.status(500).json({ msg: err.sqlMessage })
				})
				res.status(200).json({ updatedUser: params })
			}
		})
	}
})

module.exports = router
