import { MongoClient, Collection, ObjectId } from "mongodb";

interface IImageDocument {
    _id: ObjectId;      // the Mongo ObjectId
    src:   string;      // the URL to the image
    name:  string;      // human‐readable title
    authorId: string;   // who uploaded it
}

export class ImageProvider {
    private collection: Collection<IImageDocument>

    constructor(private readonly mongoClient: MongoClient) {
        const collectionName = process.env.IMAGES_COLLECTION_NAME;
        if (!collectionName) {
            throw new Error("Missing IMAGES_COLLECTION_NAME from environment variables");
        }
        this.collection = this.mongoClient.db().collection<IImageDocument>(collectionName);
    }

    getAllImages() {
        return this.collection.find().toArray(); // Without any options, will by default get all documents in the collection as an array.
    }
}

