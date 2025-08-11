import type {User} from "../models/userModel.ts";
import type {post} from "../models/postModel";
//
import { connectToDatabase } from '../db/config.ts';
import {ObjectId} from "mongodb";


export const uploadPost = async (post: post) => {
    try {
        const db = await connectToDatabase();
        const posts = db.collection('posts');
        const result = await posts.insertOne(post);
        return result
    }
    catch(e){
        return {

        }
    }

}

export const viewFeed = async () => {
   try {
       const db = await connectToDatabase();
       const posts = db.collection('posts');
       const users = db.collection('users')
       const result = await posts.find().toArray()
       // @ts-ignore
       return await Promise.all(result.map(async post => ({
           id: post._id.toString(),
           profilePicture: post.profilePicture,
           content: post.content,
           createdAt: post.createdAt,
           notes: post.notes
       }
       )))

   }
   catch(e){
       return e
    }
}
export const viewFollowing = async (followingPostIds: string[]) => {
    try {
        const db = await connectToDatabase();
        const posts = db.collection('posts');

        // Convert strings to ObjectIds
        const followingObjectIds = followingPostIds.map(id => new ObjectId(id));

        // Query posts by _id in followingObjectIds
        const result = await posts.find({ _id: { $in: followingObjectIds } }).toArray();

        return result.map(post => ({
            id: post._id.toString(),
            userId: post.userId,
            profilePicture: post.profilePicture,
            content: post.content,
            createdAt: post.createdAt,
            notes: post.notes,
        }));
    } catch (error) {
        console.error("Error in viewFollowingPosts:", error);
        throw error;
    }
};


export const editPost = async (id: string, content: {}) => {
    const db = await connectToDatabase();
    const posts = db.collection('posts');
    const result = await posts.updateOne(
        {id: id},
        { $set: { content: content } }
)
}

export const deletePost = async (id: string ) => {
    const db = await connectToDatabase();
    const posts = db.collection('posts');

    const result = await posts.deleteOne({ id });
    return result;
}





