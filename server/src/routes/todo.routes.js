import express from 'express'
import {addTodo, deleteUser, loginUser, logout, registerUser, submitTodo} from '../controller/todo.controller.js'
import {upload} from '../middleware/multer.middleware.js'
import { verifyJWT } from '../middleware/auth.middleware.js'

const router = express()

    router.route('/addTodo').post(verifyJWT,
        upload.fields([
            {
                name: 'todoImage',
                maxCount: 1,
            }
        ]),
        addTodo)

    router.route('/register').post(
        upload.fields([
            {
                name: 'coverImage',
                maxCount: 1,
            }
        ]),
        registerUser)
    router.route('/login').post(loginUser)
    router.route('/logout').get(verifyJWT, logout)
    router.route('/deleteUser').post(verifyJWT, deleteUser)
    router.route('/submitTodo').post(verifyJWT, 
        upload.fields([
            {
                name: 'pdf',
                maxCount: 1
            }
        ]),
        submitTodo
    )

export default router