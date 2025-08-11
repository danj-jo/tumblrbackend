import type {post} from "./postModel.ts";

export  interface User {
    username: string
    email: string
    password: string
    profilePicture: string
    following: string[]
    posts: post[]
}

type publicUser = Omit<User,'password' | 'following' | 'id'>