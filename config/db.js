const mongoose = require('mongoose')

// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri="mongodb+srv://gulam01:Password@cluster0.oufqm3h.mongodb.net/?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });

const connectWithDb = ()=>{

    mongoose.connect(process.env.DB_URI,{
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(console.log('DB GOT CONNECTED'))
    .catch(error=>{
        console.log('DB CONNECTION ISSUES')
        console.log(error)
        process.exit(1)
    })
}


module.exports = connectWithDb