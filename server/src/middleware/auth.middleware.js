import jwt from 'jsonwebtoken'
import { ApiError } from '../utils/apiError.utils.js'
import { User } from '../models/user.model.js'
import { asyncHandler } from '../utils/asyncHandler.utils.js'

export const verifyJWT = asyncHandler(async(req, _, next)=>{
    try {
        const token = req?.cookies?.accessToken || 
        req.header('Authorization')?.replace("Bearer ","")

        if(!token){
            throw new ApiError(404, "Token not found or doesn't exist")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if(!user){
            throw new ApiError(404, "user not found")
        }

        req.user = user
        next()
    } catch (error) {
        throw new ApiError(500,error?.message || "Error while veryfying")
    }
})
