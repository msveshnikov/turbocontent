import mongoose from 'mongoose';

const ContentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        topic: {
            type: String,
            required: true
        },
        goal: {
            type: String,
            required: true
        },
        platform: {
            type: String,
            required: true
        },
        tone: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        isPrivate: {
            type: Boolean,
            default: false
        },
        model: {
            type: String
        }
    },
    { timestamps: true }
);

const Content = mongoose.model('Content', ContentSchema);

export default Content;
