import dotenv from "dotenv";
dotenv.config();

import { connectMongo, mongoClient} from "./connectMongo";
import { ValidRoutes } from "./shared/validRoute";
import { fetchDataFromServer, IApiImageData} from "./common/ApiImageData";
import { ImageProvider } from "./imageProvider";
import express, { Request, Response, NextFunction} from "express";
import path from 'path';

const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";

const app = express();
app.use(express.static(STATIC_DIR));
app.use(express.json());

const DB_NAME = process.env.DB_NAME;
if (!DB_NAME) {throw new Error("Missing DB_NAME in .env");}

function pause(ms: number) {
  return new Promise<void>(r => setTimeout(r, ms));
}

async function start() {
  try {
    const db = await connectMongo();
    const imageProvider = new ImageProvider(mongoClient);

    app.get("/api/images", async (req: Request, res: Response) => {
      console.log("/api/images hit, delaying 2s…");
      await pause(2000);

      try{
        console.log("/api/images fetching from MonogoDB");
        const docs = await imageProvider.getAllImages();

       const payload: IApiImageData[] = docs.map(doc => ({
        id: doc._id.toHexString(),
        src:  doc.src, 
        name: doc.name,
        author: { 
          id: doc.authorId, 
          username: doc.authorId }
        })
      );
      res.json(payload);
    }
    catch(err)
    {
      console.error("Error fetching images:", err);
      res.sendStatus(500);
    }
  }
  );

    app.put( "/api/images/:id", (req: Request<{ id: string }, IApiImageData, { name: string }>, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const { name } = req.body;
        const images = fetchDataFromServer();
        const image = images.find((i) => i.id === id)!;
        if (!image) {
            res.status(404).json({ error: "Not found" });
            next();
        }

        console.log("Name changed...", name);
        image.name = name;
        res.json(image);
    }
    );

    app.get("/api/hello", (req: Request, res: Response) => {
        res.send("Hello, World");
    });

    app.get(Object.values(ValidRoutes), (req: Request, res: Response) => {
        res.sendFile("index.html", {root: path.join(__dirname, "../../frontend/dist/")});
    });

    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
  } 
  catch (err) 
  {
    console.error("Failed to start app:", err);
    process.exit(1);
  }
}

// Start the database connection...
start().catch(err => {
  console.error("Failed to start app:", err);
  process.exit(1);
});

