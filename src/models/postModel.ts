type postContent = {
    text?: string;
    images?: string[];
}

export type post = {
    id?: string;
    userId: string;
    profilePicture: string;
    content: postContent;
    createdAt: string;
    notes: number,
}

