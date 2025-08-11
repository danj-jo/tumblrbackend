import {ObjectId} from "mongodb";
import type {User} from "src/models/userModel";
import { connectToDatabase } from '../db/config.ts';
import bcrypt from "bcrypt"


export const updateProfilePicture = async (userId: string, newPicUrl: string) => {
    const db = await connectToDatabase();
    const users = db.collection('users');
    const result = await users.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { profilePicture: newPicUrl } }
    );
    return result.modifiedCount > 0;
};


export const addUserToDb = async (user: User) => {
    try {
        const db = await connectToDatabase();
        const users = db.collection('users');
        const result = await users.insertOne(user);
        console.log(`Inserted user: ${JSON.stringify(user)}`);
        return result.insertedId;  // <--- Return inserted ID here
    } catch (err) {
        console.log(`Error adding User to DB: ${err}`);
        return null;
    }
};

export const login = async(username: string, password: string) => {
    const db = await connectToDatabase();
    const users = db.collection('users');
        let id: ObjectId = new ObjectId
        try {
            const user = await users.findOne({username: username})
            if (user == null) {
                return
            }
            // @ts-ignore
            const pwd = await bcrypt.compare(password, user.password)
            if (!password) {
                return
            }

            if (password) {
                id = user ? user._id : new ObjectId()
            }
            //compare the hash of the stored version, and current version.
            // @ts-ignore
        } catch (err) {
            console.log(`Incorrect information: ${err}`)
        }
        console.log(`name: ${username} password: ${password}`)
        return id
}
export const checkForExistingUser = async (emailAddress: string): Promise<boolean> => {
    try {
        const db = await connectToDatabase();
        const users = db.collection('users');
        const emailExists = await users.findOne({ email: emailAddress });
        if (emailExists) {
            console.log('Email already exists.');
            return false;
        }
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
};

export const register = async (
    username: string,
    email: string,
    password: string,
    profilePicture: string,
    following: string[],
    posts: string[]
) => {
    try {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser: User = {
            username,
            email,
            password: hashedPassword,
            profilePicture,
            following,
            posts,
        };

        const insertedId = await addUserToDb(newUser);
        if (!insertedId) return null;
        return {
            ...newUser,
            _id: insertedId,
        };
    } catch (err) {
        console.log(`Error registering: ${err}`);
        return null;
    }
};
