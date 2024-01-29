import mongoose from 'mongoose'
import {DB_NAME} from './constants.js'

const connectDB = async() =>{
    try {
        const connection = await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
        console.log(`Mongo DB connected to host: ${connection.connection.host}`)
    } catch (error) { 
        console.log("Mongo DB connection error")
        process.exit(1) 
    }   
}

export default connectDB 