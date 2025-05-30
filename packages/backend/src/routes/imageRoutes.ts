import express, { Request, Response }from "express";
import { ImageProvider } from "../imageProvider";

function pause(ms: number) {
  return new Promise<void>(r => setTimeout(r, ms));
}

export function registerImageRoutes(app: express.Application, imageProvider: ImageProvider) {
    app.get("/api/images", async (req: Request, res: Response) => {
      console.log("/api/images hit, delaying 2s…");
      await pause(2000);

      // grab ?query=foo
      const raw = req.query.query;
      const query = typeof raw === "string" ? raw.trim() : "";
      console.log("Image search query:", query);

      try{
        console.log("/api/images fetching from MongoDB");
        const docs = await imageProvider.getAllImages();

        const filtered = docs.filter(doc => doc.authorId.toLowerCase().includes(query.toLowerCase()));
        console.log(filtered.length);

        const payload = filtered.map(doc => ({
            id: doc._id.toHexString(), 
            src:  doc.src, 
            name: doc.name, 
            author: { 
                id: doc.authorId, 
                username: doc.authorId 
            }
        }));
       res.json(payload);
    }
    catch(err)
    {
      console.error("Error fetching images:", err);
      res.sendStatus(500);
    }
  });
}