import app from './app.js'
import dotenv from 'dotenv'
import connectDB from './db.js'

dotenv.config(
    { path: './.env' }
)

const port = process.env.PORT
 
connectDB()
.then(()=>{
    app.listen(port,()=>{
        console.log(`server is running at port ${port}`)
    })
})
.catch((err)=>{
    console.log("server connection error: ",err)
})