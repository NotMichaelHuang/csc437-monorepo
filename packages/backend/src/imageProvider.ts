import { MongoClient, Collection, ObjectId } from "mongodb";

interface IImageDocument {
    _id: ObjectId;      // the Mongo ObjectId
    src:   string;      // the URL to the image
    name:  string;      // human‐readable title
    authorId: string;   // who uploaded it
}

export interface IApiImageData {
    _id: string;
    src: string;
    name: string;
    author: {
        id: string;
        username: string;
        email?: string;
    }
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

    async getImages(nameFilter?: string): Promise<IApiImageData[]>{
        const pipeline: any[] = []; 
        pipeline.push(
            { 
            $lookup: {
                from: "users",
                localField: "authorId",   // string in images
                foreignField: "_id",        // string in users
                as: "authorDoc"
            }
            },
            { $unwind: "$authorDoc" }
        );

        // 2) If there's a filter, apply it now (on name OR username)
        if (nameFilter) {
            pipeline.push({
                $match: {
                    $or: [
                        { "authorDoc.username": { $regex: nameFilter, $options: "i" } }
                    ]
                }
            });
        }

        // 3) Finally reshape into your front-end shape
        pipeline.push({
            $project: {
                _id: 0,
                id: { $toString: "$_id" },
                src: 1,
                name: 1,
                author: {
                    id: "$authorDoc._id",
                    username: "$authorDoc.username",
                    email: "$authorDoc.email"
                }
            }
        });
        console.log("Aggregation pipeline:", JSON.stringify(pipeline, null, 2));
        return this.collection.aggregate<IApiImageData>(pipeline).toArray();
    };

    async updateName(imageId: string, newName: string): Promise<number> {
        const _id = new ObjectId(imageId);
        const result = await this.collection.updateOne({_id: _id}, {$set: {name: newName}});

        // Fetch how many times it has been modified
        return result.modifiedCount;
    }
}

