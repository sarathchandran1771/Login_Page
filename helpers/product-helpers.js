var db = require('../config/connection')
var collection = require('../config/collections')

module.exports={
    addProduct:(product, callback)=>{
        console.log(product);

        db.collection('product').insertOne(product).then((data)=>{
            callback(data)
        });
    },
    getAllProducts:()=>{
        return new promiseImpl(async(resolve,reject)=>{
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    }
};