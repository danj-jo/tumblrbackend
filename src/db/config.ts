import { MongoClient, ServerApiVersion, Db } from "mongodb"


const uri = "mongodb+srv://user1:guessymess@tmcluster1.lolf8lh.mongodb.net/?retryWrites=true&w=majority&appName=tmcluster1";


export const client = new MongoClient(uri,  {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    }
);

let db: Db;
export async function connectToDatabase(): Promise<Db> {
    if (db) return db;
    await client.connect();
    db = client.db('tmblrbackend');
    return db;
}

export async function run() {
    try {
        await client.connect();


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
    }

}

run().catch(console.dir);
