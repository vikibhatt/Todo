import {ApiResponse} from '../utils/apiResponse.utils.js'
import {ApiError} from '../utils/apiError.utils.js'
import {asyncHandler} from '../utils/asyncHandler.utils.js'
import { addFilesToCloudnary, deleteFilesFromCloudnary } from '../utils/cloudinary.util.js'
import {Todo} from '../models/todo.model.js'
import {User} from '../models/user.model.js'


const gener
const registerUser = asyncHandler(async(req, res)=>{
    const {fullname, username, email, password} = req.body

    if(!fullname || !username || !email || !password){
        throw new ApiError(406, "All fields required")
    }

    const isUser = await User.exists({
        $and: [{username},{email}]
    })

    let coverImageLocalPath

    if(req.file && Array.isArray(req.file?.coverImage)){
        if(req.file.coverImage.length > 0){
            coverImageLocalPath = req.file.coverImage[0]?.path
        }
    }

    const coverImage = await addFilesToCloudnary(coverImageLocalPath)

    if(!isUser){
        try {
            const user = await User.create({
                fullName: fullname,
                username,
                email,
                coverImage: coverImage?.url,
                password,
            })

            console.log("new user created successfully")

            return res 
            .status(200)
            .json(
                new ApiResponse(200,user,"new user created successfully")
            ) 
        } catch (error) {
            throw new ApiError(500,"Error while creating new user")
        }
    }
    else{
        throw new ApiError(401,"Unauthorized access")
    }
})

const loginUser = asyncHandler(async(req, res)=>{
    const {username, email, password} = req.body

    if(!username && !email){
        throw new ApiError(406, "username or email is required")
    }

    try {
        const user = await User.findOne({
            $or: [{username},{email}]
        })

        const {accessToken, refreshToken} = await 

        console.log("new user created successfully")

        return res 
        .status(200)
        .json(
            new ApiResponse(200,user,"new user created successfully")
        ) 
    } catch (error) {
        throw new ApiError(500,"Error while login user")
    }
    }
)

const addTodo = asyncHandler(async(req,res)=>{
    const user = await User.findById(req.user?._id)
    const {title, description, image} = req.body 

    if(!user){
        throw new ApiError(404, "User not found")
    }

    if(!title || !description){
        throw new ApiError(401,'title or description fields required')
    }

    let imageLocalPath

    if(req.file && Array.isArray(req.file?.image)){
        if(req.file.image.length > 0){
            imageLocalPath = req.file.image[0]?.path
        }
    }

    const imagePath = await addFilesToCloudnary(imageLocalPath)

    try {  
        const newTodo = await Todo.create({
            title,
            description,
            image: imagePath?.url,
        })

        console.log(newTodo)

        return res 
        .status(200)
        .json(
            new ApiResponse(200,newTodo,"New todo created successfully")
        )
    } catch (error) {
        await deleteFilesFromCloudnary(imagePath?.url,'image')
        throw new ApiError(500,"Error while creating new Todo")
    }
    
})

export {addTodo, registerUser, loginUser}