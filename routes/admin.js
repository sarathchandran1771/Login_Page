var express = require('express');
var {render} = require('../app');
const productHelpers = require('../helpers/product-helpers')
var router = express.Router();
const productHelpers = require('../helpers/user-helpers');

router.get('/',function(req,res,next){
    productHelpers.getAllProducts().then((products)=>{
        res.render('/',{admin:true,products})
    })
    res,render('admin/view-products',{admin:true,products})
});
router.get('/add-products',function(req,res){
    res.render('admijn/add-product')
})
router.post('/add-products',(req,res)=>{

    productHelpers.addProduct(req.body,(id)=>{
        let image=req.files.image
        
    })
})
