import express from 'express'
import cookieParser from 'cookie-parser';
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

import Router from './src/routes/todo.routes.js'

app.use('/api/v1/todo',Router)

export default app 