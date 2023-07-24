var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const { Result } = require('express-validator')

module.exports = {
    doSignup:(userData)=>{
        return new promise (async(resolve,reject)=>{
            userData.Password = bcrypt.hash(userData.Password,10)
            db.get().collection(collection.USER_COLLECTION).insert(userData).then((data)=>{
                resolve(data.ops[0])
            })
        })
    },
    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email})
            if(user){
                bcrypt.compare(userData.Password,user.Password).then((status)=>{
                    if(user){
                        console.log("login success")
                        response.user = user
                        response.status = true
                        resolve(response)
                    }else{
                        console.log("login failed");
                        resolve({status:false})
                    }
                })
            }else{
                console.log("loggin failed");
            }
        })
    }
}