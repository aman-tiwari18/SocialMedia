const mongoose = require("mongoose");
mongoose.set('strictQuery', false);


exports.connectDatabase = () =>{
    console.log(process.env.MONGO_URI)
    mongoose
    .connect(process.env.MONGO_URI ,{
        
        useNewUrlParser: true,
        useUnifiedTopology: true
      })
    .then((con) =>console.log(`MongoDB Database connected with HOST: ${con.connection.host}`))
    .catch((error)=>console.log(error))
    
}
