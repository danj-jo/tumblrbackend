import {connectToDatabase} from "../db/config.ts";

import {ObjectId} from "mongodb";


export const followUser = async (currentUserId: string, userToFollowId: string) => {
    const db = await connectToDatabase();
    const users = db.collection('users');

    const result = await users.updateOne(
        { _id: new ObjectId(currentUserId) },
        { $addToSet: { following: new ObjectId(userToFollowId) } } // addToSet avoids duplicates
    );

    return result.modifiedCount === 1;
};

export const likePost = async (postId: string) => {
    const db = await connectToDatabase();
    const posts = db.collection('posts');

    const result = await posts.updateOne(
        { _id: new ObjectId(postId) },
        { $inc: { notes: 1 } }
    );

    return result.modifiedCount === 1;
};
export const unlikePost = async (postId: string) => {
    const db = await connectToDatabase();
    const posts = db.collection('posts');

    const result = await posts.updateOne(
        { _id: new ObjectId(postId) },
        { $inc: { notes: -1 } }
    );

    return result.modifiedCount === 1;
};
