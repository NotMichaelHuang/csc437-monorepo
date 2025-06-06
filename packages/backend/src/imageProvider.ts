import { MongoClient, Collection, ObjectId } from "mongodb";

interface IImageDocument {
  _id: ObjectId;   // the Mongo ObjectId
  src:   string;   // the URL to the image
  name:  string;   // human‐readable title
  authorId: string; // who uploaded it (stringified ObjectId)
}

export interface IApiImageData {
  _id: string;
  src: string;
  name: string;
  author: {
    id: string;
    username: string;
    email?: string;
  };
}

export class ImageProvider {
  private collection: Collection<IImageDocument>;

  constructor(private readonly mongoClient: MongoClient) {
    const collectionName = process.env.IMAGES_COLLECTION_NAME;
    if (!collectionName) {
      throw new Error(
        "Missing IMAGES_COLLECTION_NAME from environment variables"
      );
    }
    this.collection = this.mongoClient
      .db()
      .collection<IImageDocument>(collectionName);
  }

  getAllImages() {
    return this.collection.find().toArray();
  }
 
  async getImages(nameFilter?: string): Promise<IApiImageData[]> {
    const pipeline: any[] = [
      {
        $lookup: {
          from: "users",
          localField: "authorId", // string stored on the image doc
          foreignField: "_id", // the user’s ObjectId
          as: "authorDoc",
        },
      },
      { $unwind: "$authorDoc" },
    ];
    if (nameFilter && nameFilter.trim() !== "") {
      const re = { $regex: nameFilter, $options: "i" }; // case‐insensitive
      pipeline.push({
        $match: {
          $or: [
            { name: re },                   // match on image.name
            { "authorDoc.username": re },   // OR match on author.username
          ],
        },
      });
    }
    pipeline.push({
      $project: {
        _id: 0,
        id: { $toString: "$_id" },
        src: 1,
        name: 1,
        author: {
          id: { $toString: "$authorDoc._id" },
          username: "$authorDoc.username",
          email: "$authorDoc.email",
        },
      },
    });
    return this.collection.aggregate<IApiImageData>(pipeline).toArray();
  }
 
  async findImagesByName(nameFilter: string): Promise<IApiImageData[]> { 
    const pipeline: any[] = [
      {
        $lookup: {
          from: "users",
          localField: "authorId",
          foreignField: "_id",
          as: "authorDoc",
        },
      },
      { $unwind: "$authorDoc" },
      {
        $match: {
          name: { $regex: nameFilter, $options: "i" },
        },
      },
      {
        $project: {
          _id: 0,
          id: { $toString: "$_id" },
          src: 1,
          name: 1,
          author: {
            id: { $toString: "$authorDoc._id" },
            username: "$authorDoc.username",
            email: "$authorDoc.email",
          },
        },
      },
    ];
    return this.collection.aggregate<IApiImageData>(pipeline).toArray();
  }

  async createImage(name: string, authorId: string, externalURL: string): Promise<IImageDocument> {
    const newId = new ObjectId();
    const doc: IImageDocument = {
      _id: newId,
      src: externalURL,
      name: name,
      authorId: authorId
    }
    await this.collection.insertOne(doc);
    return doc;
  }

  async updateName(imageId: string, newName: string): Promise<number> {
    const _id = new ObjectId(imageId);
    const result = await this.collection.updateOne(
      { _id: _id },
      { $set: { name: newName } }
    );
    return result.modifiedCount;
  } 
}

