var express = require("express")
var router = express.Router()
var jwt = require('jsonwebtoken')
var con = require("../dbConfig")
// FORMAT OF TOKEN
// Authorization: Bearer <access_token>

// Verify Token
function verifyToken(req, res, next) {
    // Get auth header value
    const bearerHeader = req.headers['authorization'];
    // Check if bearer is undefined
    if (typeof bearerHeader !== 'undefined') {
        // Split at the space
        const bearer = bearerHeader.split(' ');
        // Get token from array
        const bearerToken = bearer[1];
        // Set the token
        req.token = bearerToken;
        // Next middleware
        next();
    } else {
        // Forbidden
        res.sendStatus(403);
    }

}


/*
	@POST /user/singnUp
	@Params: {u_name*, u_location*, u_email*, u_password*, u_shipping_address, u_imagePath}	
	@Response: {newUser: {}} 
*/
router.post("/signUp", function (req, res) {
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

        con.query(sql, params, function (err, result) {
            if (err) {
                console.log(err.sqlMessage)
                res.status(500).json({msg: err.sqlMessage})
            } else {
                console.log("1 record inserted", result.insertId)
                params.id = result.insertId

                res.status(200).json({newUser: params})
            }
        })
    }
})

/* 
    @POST /user/singnIn
    @Params: {email*, password*}
    @Response: {user: {}} 
*/
router.post("/signIn", function (req, res) {
    let params = req.body
    let error = {}

    // all required params checking

    if (error.hasOwnProperty("msg")) res.status(400).send(error)
    else {
        let sql = "SELECT * FROM users WHERE u_email = ? AND u_password = ?"
        let checks = [params.email, params.password]

        console.log(checks)

        con.query(sql, checks, function (err, result) {
            if (err) {
                // console.log(err.sqlMessage)
                res.status(500).json({msg: err.sqlMessage})
            } else {
                console.log("@result", result[0].c_id)

                if (result.length) {
                    // res.status(200).json({chef: result[0]})
                    jwt.sign({result}, 'secretkey', {expiresIn: '1h'}, (err, token) => {
                        con.query("UPDATE users SET ? WHERE u_id = " + result[0].u_id, {token: token}, function (err, result) {
                            //console.log(err.sqlMessage)
                            //res.status(500).json({ msg: err.sqlMessage })
                        })
                        res.json({

                            //token,
                            user: result[0]
                        });
                    });
                } else res.status(400).json({msg: "Wrong email or password"})
            }
        })
    }
})

/* 
    @GET /user/profile/:id  
    @Params: {} login check
    @Response: {user: {}} 
*/

router.get("/profile/:id", verifyToken, function (req, res) {

    jwt.verify(req.token, 'secretkey', (err, authData) => {
        //console.log(req)
        if (err) {
            res.sendStatus(403);
        } else {
            let id = req.params.id

            let sql = "SELECT * FROM users WHERE u_id = ?"
            // console.log(checks)

            con.query(sql, id, function (err, result) {
                if (err) {
                    // console.log(err.sqlMessage)
                    res.status(500).json({msg: err.sqlMessage})
                } else {
                    console.log("@result", result)
                    if (result.length) res.status(200).json({user: result[0]})
                    else res.status(404).json({msg: "No user has found"})
                }
            })

        }
    })

})

/* 
@PUT /user/profile/edit/:id  
@Params: {u_name, u_location, u_shipping_address, u_imagePath, u_email, u_password} login check
@Response: {updatedUser: {}} 
*/
router.put("/profile/edit/:id", verifyToken, function (req, res) {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        //console.log(req)
        if (err) {
            res.status(403).json({error: err, "msg": "user expired token not found"});
        } else {

            let params = req.body
            let id = req.params.id

            let error = {}
            console.log(params)

            if (error.hasOwnProperty("msg")) res.status(400).send(error)
            else {
                let sql = "UPDATE users SET ? WHERE u_id = " + id
                console.log(sql)

                con.query(sql, params, function (err, result) {
                    if (err) {
                        console.log(err.sqlMessage)
                        res.status(500).json({msg: err.sqlMessage})
                    } else {
                        // console.log("1 record inserted", result)
                        /*con.query("UPDATE users SET ? WHERE u_id = " + result.insertId, {type: 1}, function(err, result) {
                            console.log(err.sqlMessage)
                            res.status(500).json({ msg: err.sqlMessage })
                        })*/
                        res.status(200).json({updatedUser: params})
                    }
                })
            }

        }
    })

})

/*

@POST /user/profile/shippingAddress/:id
@Params: {u_shipping_address*} login check
@Response: {newShippingAddress: ‘’}
*/

router.post("/profile/shippingAddress/", verifyToken, function (req, res) {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        //console.log(req)
        if (err) {
            res.status(403).json({error: err, "msg": "user expired token not found"});
        } else {

            let params = req.body
            //let id = req.params.id

            let error = {}
            console.log(params)

            if (error.hasOwnProperty("msg")) res.status(400).send(error)
            else {
                let sql = "UPDATE users SET ? WHERE u_id = " + authData.result[0].u_id
                console.log(sql)

                con.query(sql, params, function (err, result) {
                    if (err) {
                        console.log(err.sqlMessage)
                        res.status(500).json({msg: err.sqlMessage})
                    } else {
                        // console.log("1 record inserted", result)
                        /*con.query("UPDATE users SET ? WHERE u_id = " + result.insertId, {type: 1}, function(err, result) {
                            console.log(err.sqlMessage)
                            res.status(500).json({ msg: err.sqlMessage })
                        })*/
                        res.status(200).json({newShippingAddress: params})
                    }
                })
            }

        }
    })


})


/*
@POST /user/foods/search
@Params: {name, maxPrice, maxDeliveryTime}
@Response: {recommendedFoods: []}
*/

router.post('/foods/search', function (req, res) {
    let params = req.body
    let error = {}
    console.log(params)

    if (error.hasOwnProperty("msg")) res.status(400).send(error)
    else {
        let sql = 'select f_name,f_details,f_price,f_delivery_time from foods WHERE f_delivery_time <= ? and  f_price <= ? and f_name =? '
        console.log(sql)
        let checks = [params.f_delivery_time, params.f_price, params.f_name]
        con.query(sql, checks, function (err, result) {
            if (err) {
                console.log(err.sqlMessage)
                res.status(500).json({msg: err.sqlMessage})
            } else {
                res.status(200).json({result: result})
            }
        })
    }

})


/*
@GET /user/food/details/:id
@Params: {}
@Response: {foodDetails: []}
*/


router.get("/food/details/:id", function (req, res) {

    let id = req.params.id

    let sql = "select f_name,f_details,f_price,f_delivery_time from foods WHERE f_id = ?"
    // console.log(checks)

    con.query(sql, id, function (err, result) {
        if (err) {
            // console.log(err.sqlMessage)
            res.status(500).json({msg: err.sqlMessage})
        } else {
            console.log("@result", result)
            if (result.length) res.status(200).json({foodDetails: result[0]})
            else res.status(404).json({msg: "No user has found"})
        }
    })

})

/*
    @GET /user/orders/all
    @Params: {} login check
    @Response: {allOrders: {}}
*/
router.get("/orders/all", verifyToken, function (req, res) {

    let params = req.body
    // console.log(checks)
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        //console.log(req)
        if (err) {
            res.status(403).json({error: err, "msg": "user expired token not found"});
        } else {
            /*var file = req.files.images;
                    var img_name = file.name;
                    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif") {

                        file.mv('public/images/upload_images/' + file.name, function (err) {

                            if (err) {
                                return res.status(500).send(err);
                            }

                        })
                    }*/
            con.query('SELECT f_name,f_details,f_imagePath,f_price,f_delivery_time,o_user_status FROM orders left join foods on orders.f_id=foods.f_id left join users on users.u_id=orders.u_id where orders.u_id = ' + authData.result[0].u_id + '', function (err, result) {
                if (err) {
                    // console.log(err.sqlMessage)
                    res.status(500).json({msg: err.sqlMessage})
                } else {
                    console.log("@result", result)
                    if (result.length) res.status(200).json({allOrders: result})
                    else res.status(404).json({msg: "No order has found"})
                }
            })
        }
    })


})

/*
@GET /user/order/details/:id
@Params: {} login check
@Response: {orderDetails: []}

*/
router.get("/order/details/:id", verifyToken, function (req, res) {

    let params = req.body
    let error = {}
    let requiredParams = ["o_user_status"]
    for (item of requiredParams) {
        if (!params[item]) {
            error.msg = item + " is required."
            break
        }
    }

    jwt.verify(req.token, 'secretkey', (err, authData) => {
        //console.log(req)
        if (err) {
            res.status(403).json({error: err, "msg": "user expired token not found"});
        } else {
            /*var file = req.files.images;
                    var img_name = file.name;
                    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif") {

                        file.mv('public/images/upload_images/' + file.name, function (err) {

                            if (err) {
                                return res.status(500).send(err);
                            }

                        })
                    }*/
            if (error.hasOwnProperty("msg")) res.status(400).send(error)
            else {
                console.log(error)
                let sql = 'SELECT f_name,f_details,f_imagePath,f_price,f_delivery_time FROM orders left join foods on orders.f_id=foods.f_id left join users on users.u_id=orders.u_id where orders.o_id = ' + req.params.id + '';
                con.query(sql, function (err, result) {
                    if (err) {
                        //console.log(sql)
                        res.status(500).json({msg: err.sqlMessage})
                    } else {
                        console.log("@result", sql)
                        if (result.length) res.status(200).json({allOrders: result})
                        else res.status(404).json({msg: "No order has found"})
                    }
                })
            }

        }
    })


})


/*
@PUT /user/order/status/:id
@Params: {status*} login check
@Response: {updatedStatus: ‘’}
*/

router.put("/order/status/:id", verifyToken, function (req, res) {

    try {

        jwt.verify(req.token, 'secretkey', (err, authData) => {
            //console.log(req)
            if (err) {
                res.status(403).json({error: err, "msg": "user expired token not found"});
            } else {

                let params = req.body
                let id = req.params.id

                let error = {}
                console.log(params)

                if (error.hasOwnProperty("msg")) res.status(400).send(error)
                else {
                    let sql = "UPDATE orders SET ? WHERE o_id =" + id + " and u_id=" + authData.result[0].u_id + " "
                    //console.log(authData.result[0].id)

                    con.query(sql, params, function (err, result) {
                        if (err) {
                            console.log(err.sqlMessage)
                            res.status(500).json({msg: err.sqlMessage})
                        } else {
                            // console.log("1 record inserted", result)
                            /*con.query("UPDATE users SET ? WHERE u_id = " + result.insertId, {type: 1}, function(err, result) {
                                console.log(err.sqlMessage)
                                res.status(500).json({ msg: err.sqlMessage })
                            })*/
                            res.status(200).json({updatedStatus: params})
                        }
                    })
                }

            }
        })


    } catch (e) {
        res.status(500).json({error: e})
    }
})
/*
@POST /user/order/custom/:chef_id
@Params: {imagePath, o_food_type*, o_details*} login check
@Response: {orderDetails: []}
*/

router.post('/order/custom/:chef_id',verifyToken,function (req,res) {


    try {
        jwt.verify(req.token, 'secretkey', (err, authData) => {
            //console.log(req)
            if (err) {
                res.status(403).json({error: err, "msg": "user expired token not found"});
            } else {

                let chef_id = req.params.chef_id
                let params = req.body
                let error = {}
                console.log(authData)

                // all required params checking
                let requiredParams = ["o_food_type", "o_details"]
                for (item of requiredParams) {
                    if (!params[item]) {
                        error.msg = item + " is required."
                        break
                    }
                }

                if (error.hasOwnProperty("msg")) res.status(400).send(error)
                else {
                    let sql = "INSERT INTO orders SET ? "
                    console.log(sql)

                    res.status(200).json({orderDetails: req.body.f_name})
                    /*con.query(sql, params, function (err, result) {
                        if (err) {
                            console.log(err.sqlMessage)
                            res.status(500).json({msg: err.sqlMessage})
                        } else {
                            console.log("1 record inserted", result.insertId)
                            params.id = result.insertId
                            res.status(200).json({orderDetails: params})
                        }
                    })*/

                }


            }
        })

    }catch (e) {
        res.status(500).json({error: e})
    }


})


module.exports = router
