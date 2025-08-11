import type { Request, Response, NextFunction } from 'express';
import express from 'express';
import {uploadPost, viewFeed, viewFollowing} from "./src/controllers/postController.ts";
import {connectToDatabase, run} from "./src/db/config.ts"
import {checkForExistingUser, login} from "./src/controllers/userController.ts";
import {register} from "./src/controllers/userController.ts";
import {followUser} from "./src/controllers/interactionController.ts";
import cors from 'cors'
import session from 'express-session'
import type {User} from "src/models/userModel.ts";
import path from "express"
import {likePost} from "./src/controllers/interactionController.ts";
declare module "express-session" {
    interface SessionData {
        isAuth: boolean
        userId?: string
        destroy: () => void
        user: User
    }
}

// @ts-ignore
const app = express()

app.use(express.json());

app.get('/', async (req: Request, res: Response) => {
    try{
        await run()
        viewFeed().then(response => {
            res.send(response)
        })
    }
   catch(e){
        // @ts-ignore
       res.send(e.toString())
   }
})

app.post('/post', async (req: Request, res: Response) => {
    try {
        const { userId, text, images } = req.body;


        const db = await connectToDatabase();
        const users = db.collection('users');


        const user = await users.findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const post = {
            userId,
            profilePicture: user.profilePicture,
            content: { text, images },
            createdAt: new Date().toISOString(),
            notes: 0,
        };

        const result = await uploadPost(post);
        res.json({ success: true });
    } catch (error) {
        // @ts-ignore
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        const result = await login(req.body.username, req.body.password);

        if (!result) {
            res.json({ success: false, message: "Invalid username or password" });
        } else { // @ts-ignore
            if (result === "no user" || result === "no password") {
                        res.json({ success: false, message: result });
                    } else {
                        res.json({ success: true, userId: result });
                    }
        }
    } catch (e) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.post('/register', async (req: Request, res: Response) => {
    try {
        const { username, email, password} = req.body;
        const profilepic = req.body.profilePicture != "" ? req.body.profilePicture : "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.istockphoto.com%2Fphotos%2Fblank-profile-picture&psig=AOvVaw0zOFFPi8r-7BUHRauvpwqc&ust=1754957389874000&source=images&cd=vfe&opi=89978449&ved=0CBMQjRxqFwoTCIj3tPC7gY8DFQAAAAAdAAAAABAK"

        const emailAvailable = await checkForExistingUser(email);
        if (!emailAvailable) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }
        const posts: string[] = [];
        const following: string[] = [];

        const newUser = await register(username, email, password, profilepic, posts, following);
        if (!newUser) {
            return res.status(500).json({ success: false, message: 'Failed to register user' });
        }


        return res.status(201).json({ success: true, user: { id: newUser._id, username: newUser.username } });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
app.post('/follow', async (req: Request, res: Response) => {
    try {
        const { myId, userId } = req.body;

        if (!myId || !userId) {
            return res.status(400).json({ error: "Both myId and userId are required" });
        }


        const result = await followUser(myId, userId);

        res.status(200).json({ success: true, message: "User followed successfully", result });
    } catch (e) {
        console.error("Error following user:", e);
        console.log("backend issue")
        res.status(500).json({ error: "Internal server error" });
    }
});

import { ObjectId } from 'mongodb';

app.post('/following', async (req, res) => {
    try {
        const userId = req.body.userId;

        if (!userId) {
            return res.status(400).json({ error: 'Missing userId' });
        }

        const db = await connectToDatabase();
        const users = db.collection('users');


        const user = await users.findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const followingPostIds = user.following || [];

        const posts = await viewFollowing(followingPostIds);

        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch following posts' });
    }
});





app.post('/like', async (req: Request, res: Response) => {
    await likePost(req.body.postId)
})








app.get('profile')

app.listen(3000,'localhost')
//https://images.unsplash.com/photo-1563691189804-87116b3142f2?q=80&w=987&auto=format&fit=crop
//https://images.unsplash.com/photo-1732492211688-b1984227af93?q=80&w=987&auto=format&fit=crop
//https://images.unsplash.com/flagged/photo-1563693703591-ef3a7e5d70d9?q=80&w=3000&auto=format&fit=crop
//curl -X POST http://localhost:3000/register \
//-H "Content-Type: application/json" \
//-d '{"username":"user1","email":"user1@example.com","password":"word2","profilePicture":"https://images.unsplash.com/photo-1754465164919-ea935adfb7db?auto=format&fit=crop&w=800&q=80",
// "posts":[],
// "following":[]}'