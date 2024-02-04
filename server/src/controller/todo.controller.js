import {ApiResponse} from '../utils/apiResponse.utils.js'
import {ApiError} from '../utils/apiError.utils.js'
import {asyncHandler} from '../utils/asyncHandler.utils.js'
import { addFilesToCloudnary, deleteFilesFromCloudnary } from '../utils/cloudinary.util.js'
import {Todo} from '../models/todo.model.js'
import {User} from '../models/user.model.js' 

const generateAccessTokenAndRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessTokens()
        const refreshToken = user.generateRefreshTokens()
    
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {refreshToken, accessToken}
    } catch (error) {
        throw new ApiError(500,"Error while generating refresh and access tokens")
    }
}

const registerUser = asyncHandler(async(req, res)=>{
    const {fullname, username, email, password} = req.body

    if([username,email,fullname,password].some((field)=>
        field?.trim() === "")
    ){
        throw new ApiError(403, "All fields required")
    }

    const existingUserName = await User.findOne({username})
    const existingUser = await User.findOne({email})
 
    if(existingUser){
       throw new ApiError(401, "User already exist")
    }
    
    if(existingUserName){
       throw new ApiError(401, "Username already taken")
    }

    let coverImageLocalPath = req.files.coverImage[0]?.path
    let coverImage 
    console.log(coverImageLocalPath);

    if(coverImageLocalPath){
        coverImage = await addFilesToCloudnary(coverImageLocalPath)
        console.log(coverImage?.url);
    } 

    try {
        const user = await User.create({
            fullName: fullname,
            username: username.toLowerCase(),
            email,
            coverImage: coverImage?.url || "", 
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

})

const loginUser = asyncHandler(async(req, res)=>{
    const {username, email, password} = req.body

    if([(username || email), password].some((field)=>
        field?.trim() === "")
       ){
        throw new ApiError(400,"All fields required")
    }

    if(!username && !email){
        throw new ApiError(406, "username or email is required")
    }

    try {
        const user = await User.findOne({
            $or: [{username},{email}]
        })

        if(!user){
            throw new ApiError(404, "User not found")
        }

        const isCorrect = await user.isPasswordCorrect(password)

        if(!isCorrect){
            throw new ApiError(401, "Password is incorrect")
        }

        const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id)

        const loggedinUser = await User.findById(user._id).select('-password -refreshToken')

        console.log("user loggedin successfully")

        const options = {
            httpOnly: true,
            secure: true
         }
        return res 
        .status(200)
        .cookie('accessToken',accessToken, options)
        .cookie('refreshToken',refreshToken, options)
        .json(
            new ApiResponse(200,
                {user: loggedinUser,
                    accessToken,
                    refreshToken}
                ,"user loggedin successfully")
        ) 
    } catch (error) {
        throw new ApiError(500,"Error while login user")
    }
    }
)

const logout = asyncHandler(async(req, res)=>{
        await User.findByIdAndUpdate(req.user?._id,
            {
                $unset: {
                    refreshToken:1
                }
            },
            {
                new: true
            }
        )

        console.log("user logout successfully");

        return res
        .status(200)
        .clearCookie('accessToken')
        .clearCookie('refreshToken')
        .json(
            new ApiResponse(200,{},"user logout successfully")
        )

})

const deleteUser = asyncHandler(async(req, res)=>{
    const {password} = req.body
    const user = await User.findById(req.user?._id)

    if(!user){
        throw new ApiError(404, "User not found")
    }

    const isCorrect = await user.isPasswordCorrect(password) 

    if(!isCorrect){
        throw new ApiError(401,"Password is incorrect")
    }

    try {
        const coverImage = user.coverImage

        await user.deleteOne()
        if(coverImage){
            await deleteFilesFromCloudnary(coverImage, 'image')
        }

        console.log("Profile deleted successfully");

        return res 
        .status(200)
        .json(
            new ApiResponse(200,{},"Profile deleted successfully")
        )
    } catch (error) {
        throw new ApiError(500,error?.message || "Error while deleted the profile")
    }

})

const addTodo = asyncHandler(async(req,res)=>{
    const user = await User.findById(req.user?._id)
    const {title, description} = req.body 

    if(!user){
        throw new ApiError(404, "User not found")
    }

    if(!title || !description){
        throw new ApiError(401,'title or description fields required')
    }

    let imageLocalPath = req.files?.todoImage[0]?.path;
    let imagePath

    if(imageLocalPath) {
        imagePath = await addFilesToCloudnary(imageLocalPath)
    }

    try {  
        const newTodo = await Todo.create({
            title,
            description,
            image: imagePath?.url,
            owner: req.user._id
        })

        console.log(newTodo,"new task created successfully")

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

const submitTodo = asyncHandler(async(req, res)=>{
    const {todoId} = req.query 
    const user = await User.findById(req.user?._id)

    if(!user){
        throw new ApiError(404, "User not found")
    }

    const todo = await Todo.findById(todoId)

    if(!todo){
        throw new ApiError(404, "Todo not found")
    }

    let pdfPath

    if(req.files && Array.isArray(req.files?.pdf)){
        if(req.files?.pdf.length > 0){
            pdfPath = req.files.pdf[0].path
        }
    }

    const pdfUrl = await addFilesToCloudnary(pdfPath)                    

    todo.dataSubmitted = pdfUrl?.url
    todo.isCompleted = true
    todo.submittedBy = user._id
    await todo.save()

    console.log("task completed successfully");

    return res 
    .status(200)
    .json(
        new ApiResponse(200,
            todo,
            "task completed successfully ") 
    )
})

export {addTodo, registerUser, loginUser, logout, deleteUser,submitTodo}

