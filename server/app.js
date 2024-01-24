import express from 'express'
import {limitSize} from './constants.js'
import cors from 'cors'
const app = express();

app.use(cors({
    origin: process.env.CROSS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit:limitSize})) 
app.use(express.urlencoded({extended: true,limit: limitSize}))
app.use(express.static('public'))
app.use(cookieParser())

import Router from './routes/todo.routes.js'
import cookieParser from 'cookie-parser';

app.use('/api/v1/todo',Router)

export default app 