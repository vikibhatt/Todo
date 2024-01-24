import express from 'express'
import {addTodo} from '../controller/todo.controller.js'
import {upload} from '../middleware/multer.middleware.js'

const router = express()

router.route('/addTodo').post(
    upload.single(
        {
            name: 'image',
            maxCount: 1,
        }
    ),
    addTodo)

export default router