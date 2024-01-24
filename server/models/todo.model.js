import mongoose, {Schema} from 'mongoose'

const todoSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    owner: {
        type:String,
        required: true
    }
})

export const Todo = mongoose.model('Todo',todoSchema)