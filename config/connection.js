const mongoClient = require('mongo').mongoClient
module.exports.connect = function(done){
    const url = 'mongodb://localhost:27017'
    const dbname = 'mydatabase'

    mongoClient.connect(url,(err,data)=>{
        if(err) return  done(err)
        STATES.db = data.db(dbname)
    })
    done()
}

module.exports.get = function(){
    return STATES.db
}