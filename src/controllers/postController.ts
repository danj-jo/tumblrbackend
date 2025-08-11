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
       return await Promise.all(result.map(async post => {
           const user = await users.findOne({ _id: new ObjectId(post.userId) });
            console.log(user?.username)
            console.log(result)
           return {
               id: post._id.toString(),
               userId: post.userId,
               username: user?.username || 'Unknown',
               profilePicture: post.profilePicture ,
               content: post.content,
               createdAt: post.createdAt,
               notes: post.notes,
           };
       }));
   }
   catch(e){
       return e
    }
}
export const viewFollowing = async (followingPostIds: string[]) => {
    try {
        const db = await connectToDatabase();
        const postsCollection = db.collection('posts');
        const usersCollection = db.collection('users');

        // Convert strings to ObjectIds
        const followingObjectIds = followingPostIds.map(id => new ObjectId(id));

        // Query posts by _id in followingObjectIds
        const result = await postsCollection.find({ _id: { $in: followingObjectIds } }).toArray();

        // Attach usernames just like viewFeed
        return await Promise.all(result.map(async post => {
            const user = await usersCollection.findOne({ _id: new ObjectId(post.userId) });

            return {
                id: post._id.toString(),
                userId: post.userId,
                username: user?.username || 'Unknown',
                profilePicture: post.profilePicture,
                content: post.content,
                createdAt: post.createdAt,
                notes: post.notes,
            };
        }));
    } catch (error) {
        console.error("Error in viewFollowing:", error);
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





