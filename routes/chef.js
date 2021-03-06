var express = require("express")
var router = express.Router()
var con = require("../dbConfig")
var jwt = require('jsonwebtoken')
/* GET home page. */
router.get("/", function (req, res) {
    //console.log("came")
    res.send("okay")
})
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
	@POST /chef/signUp
	@Params: {u_name*, u_location*, u_email*, u_password*, u_shipping_address, u_imagePath}
	@Response: {newChef: {}}
*/
router.post("/signUp", function (req, res) {
    let params = req.body
    let error = {}
    // console.log(con)

    // all required params checking
    let requiredParams = ["c_name", "c_email", "c_password", "c_location"]
    for (item of requiredParams) {
        if (!params[item]) {
            error.msg = item + " is required."
            break
        }
    }

    if (error.hasOwnProperty("msg")) res.status(400).send(error)
    else {
        let sql = "INSERT INTO chefs SET ? "
        console.log(sql)

        con.query(sql, params, function (err, result) {
            if (err) {
                console.log(err.sqlMessage)
                res.status(500).json({msg: err.sqlMessage})
            } else {
                console.log("1 record inserted", result.insertId)
                params.id = result.insertId
                res.status(200).json({newChef: params})
            }
        })
    }
})

/*
    @POST /chef/signIn
    @Params: {email*, password*}
    @Response: {chef: {}}
*/
router.post("/signIn", function (req, res) {
    let params = req.body
    let error = {}

    // all required params checking

    if (error.hasOwnProperty("msg")) res.status(400).send(error)
    else {
        let sql = "SELECT * FROM chefs WHERE c_email = ? AND c_password = ?"
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
                        con.query("UPDATE chefs SET ? WHERE c_id = " + result[0].c_id, {token: token}, function (err, result) {
                            //console.log(err.sqlMessage)
                            //res.status(500).json({ msg: err.sqlMessage })
                        })
                        res.json({

                            //token,
                            chef: result[0]
                        });
                    });
                } else res.status(400).json({msg: "Wrong email or password"})
            }
        })
    }
})




/*
	@POST /chef/food
	@Params: {f_name*, f_details*, f_price*, deliveryTime, imagePath}
	@Response: {newFood: []}
*/
router.post("/food", verifyToken, function (req, res) {
    let params = req.body
    let error = {}
    // console.log(con)
    try {


        // all required params checking
        let requiredParams = ["f_name", "f_details", "f_price"]
        for (item of requiredParams) {
            if (!params[item]) {
                error.msg = item + " is required."
                break
            }
        }
        jwt.verify(req.token, 'secretkey', (err, authData) => {
            //console.log(req)
            if (err) {
                res.sendStatus(403);
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
                    let sql = "INSERT INTO foods SET ? "
                    console.log(sql)
                    params.c_id = authData.result[0].c_id
                    con.query(sql, params, function (err, result) {
                        if (err) {
                            console.log(err.sqlMessage)
                            res.status(500).json({msg: err.sqlMessage})
                        } else {
                            console.log("1 record inserted", result.insertId)
                            params.id = result.insertId
                            res.status(200).json({newFood: params, authData})
                        }
                    })
                }

            }
        });


    } catch (e) {
        res.status(500).json({error: e})
    }

})

/*
    @POST /chef/orders/recent
    @Params: {} login check
    @Response: {recentOrders: {}}
*/
router.get("/orders/recent", verifyToken, function (req, res) {

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
            con.query('SELECT * FROM orders left join foods on orders.f_id=foods.f_id left join users on users.u_id=orders.u_id LIMIT 0,4', function (err, result) {
                if (err) {
                    // console.log(err.sqlMessage)
                    res.status(500).json({msg: err.sqlMessage})
                } else {
                    console.log("@result", result)
                    if (result.length) res.status(200).json({recentOrders: result})
                    else res.status(404).json({msg: "No order has found"})
                }
            })


        }
    })


})


/*
    @POST /chef/orders/custom/all
    @Params: {chefs_token} login check
    @Response: {allCustomOrders:[]}
*/
router.get("/orders/custom/all", verifyToken, function (req, res) {

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
            con.query('SELECT * FROM orders left join foods on orders.f_id=foods.f_id left join users on users.u_id=orders.u_id WHERE o_type=2', function (err, result) {
                if (err) {
                    // console.log(err.sqlMessage)
                    res.status(500).json({msg: err.sqlMessage})
                } else {
                    console.log("@result", result)
                    if (result.length) res.status(200).json({allCustomOrders: result})
                    else res.status(404).json({msg: "No order has found"})
                }
            })


        }
    })


})


/*
    @PUT /chef/order/status/:id
    @Params: {status} login check
    @Response: {changeStatus: {}}
*/
router.put("/order/status/:id", verifyToken, function (req, res) {
    let id = req.params.id
    let params = req.body
    let error = {}
    console.log(params)

    jwt.verify(req.token, 'secretkey', (err, authData) => {
        //console.log(req)
        if (err) {
            res.status(403).json({error: err, "msg": "user expired token not found"});
        } else {

            if (error.hasOwnProperty("msg")) res.status(400).send(error)
            else {
                let sql = "UPDATE orders SET ? WHERE o_id = " + id
                console.log(sql)

                con.query(sql, params, function (err, result) {
                    if (err) {
                        console.log(err.sqlMessage)
                        res.status(500).json({msg: err.sqlMessage})
                    } else {
                        console.log("1 record inserted", result)

                        res.status(200).json({updateStatus: params})
                    }
                })
            }
        }
    })


})

/*
    @GET /chef/orders/all
    @Params: {chefs_token} login check
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
            con.query('SELECT * FROM orders left join foods on orders.f_id=foods.f_id left join users on users.u_id=orders.u_id LIMIT 0,4', function (err, result) {
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
    @PUT /chef/order/custom/status/:id
    @Params: {status,chefs_token} login check
    @Response: {updatedStatus: {}}
*/
router.put("/order/custom/status/:id", verifyToken, function (req, res) {
    let id = req.params.id
    let params = req.body
    let error = {}
    console.log(params)

    jwt.verify(req.token, 'secretkey', (err, authData) => {
        //console.log(req)
        if (err) {
            res.status(403).json({error: err, "msg": "user expired token not found"});
        } else {

            if (error.hasOwnProperty("msg")) res.status(400).send(error)
            else {
                let sql = "UPDATE orders SET ? WHERE o_type=2 and o_id = " + id
                console.log(sql)

                con.query(sql, params, function (err, result) {
                    if (err) {
                        console.log(err.sqlMessage)
                        res.status(500).json({msg: err.sqlMessage})
                    } else {
                        console.log("1 record inserted", result)

                        res.status(200).json({updateStatus: params})
                    }
                })
            }

        }
    })


})


/*
    @GET /chef/getPendingOrders
    @Params: {} login check
    @Response: {ordersItems: {}}
*/
router.get("/getPendingOrders", verifyToken, function (req, res) {
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        //console.log(req)
        if (err) {
            res.status(403).json({error: err, "msg": "user expired token not found"});
        } else {

            let sql = "SELECT f_name,f_details,f_imagePath,f_delivery_time,u_name,u_email FROM orders left join foods on orders.f_id=foods.f_id left join users on users.u_id=orders.u_id Where o_chef_status =1"
            // console.log(checks)

            con.query(sql, function (err, result) {
                if (err) {
                    // console.log(err.sqlMessage)
                    res.status(500).json({msg: err.sqlMessage})
                } else {
                    console.log("@result", result)
                    if (result.length) res.status(200).json({ordersItems: result[0]})
                    else res.status(404).json({msg: "No order has found"})
                }
            })

        }
    })


})


/*
    @PUT /chef/order/makeDelivery/:id
    @Params: {status,chefs_token} login check
    @Response: {orderDetails: {}}
*/
router.put("/order/makeDelivery/:id", function (req, res) {
    let id = req.params.id
    let params = req.body
    let error = {}
    console.log(params)
    con.query("SELECT * FROM chefs WHERE token = ?", params.token, function (err, result) {
        if (err) {
            // console.log(err.sqlMessage)
            res.status(500).json({msg: err.sqlMessage})
        } else {
            //console.log("@result", result)
            if (result.length) {
                delete params.token
                //params.c_id = result[0].c_id

                if (error.hasOwnProperty("msg")) res.status(400).send(error)
                else {
                    let sql = "UPDATE orders SET ? WHERE o_id = " + id
                    console.log(sql)

                    con.query(sql, params, function (err, result) {
                        if (err) {
                            console.log(err.sqlMessage)
                            res.status(500).json({msg: err.sqlMessage})
                        } else {
                            //console.log("1 record inserted", result)
                            con.query("SELECT * from orders left join foods on orders.f_id=foods.f_id left join users on users.u_id=orders.u_id where o_id =" + id, params, function (err, result) {
                                if (err) {
                                    console.log(err.sqlMessage)
                                    res.status(500).json({msg: err.sqlMessage})
                                } else {
                                    //console.log("1 record inserted", result)

                                    res.status(200).json({orderDetails: result})
                                }
                            })
                        }
                    })
                }
            } else res.status(404).json({msg: "No user has found"})
        }
    })

})


/*
    @GET /chef/getNotification
    @Params: {} login check
    @Response: {notification: {}}
*/
router.get("/getNotification",verifyToken, function (req, res) {

    jwt.verify(req.token, 'secretkey', (err, authData) => {
        //console.log(req)
        if (err) {
            res.status(403).json({error: err, "msg": "user expired token not found"});
        }else {

            let sql = "SELECT foods.name as food_name,users.u_name as user_name FROM reviews left join foods on reviews.foods_id=foods.id left join users on reviews.users_id= users.u_id "
            // console.log(checks)

            con.query(sql, function (err, result) {
                if (err) {
                    // console.log(err.sqlMessage)
                    res.status(500).json({msg: err.sqlMessage})
                } else {
                    console.log("@result", result)
                    if (result.length) res.status(200).json({notification: result})
                    else res.status(404).json({msg: "No notification has found"})
                }
            })

        }
    })

})


module.exports = router
