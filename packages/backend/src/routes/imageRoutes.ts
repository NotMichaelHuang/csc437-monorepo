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
    const raw = req.query.search;
    const nameFilter = typeof raw === "string" ? raw.trim() : undefined;
    console.log("Image search query:", nameFilter || "(none)");

    try{
      // TODO
      console.log("/api/images fetching from MongoDB");
      const docs = await imageProvider.getImages(nameFilter);
      console.log("Doc Length: ", docs.length); 
      res.json(docs);
    } catch(err) {
      console.error("Error fetching images:", err);
      res.sendStatus(500);
    }
  }); 

  app.get("/api/images/raw", async (req: Request, res: Response) => {
    try {
      const docs = await imageProvider.getAllImages();
      res.json(docs);
    } catch (err) {
      console.error("Error fetching raw images:", err);
      res.sendStatus(500);
    }
  });


  app.patch("/api/images/:id", express.json(), async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
      res.status(404).send("name require");
      return;
    }
    
    try {
      const count = await imageProvider.updateName(id, name);
      if (count === 0){
        res.status(404).send("Image not found");
        return;
      }
      res.sendStatus(204);
      return;
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
      return;
    }
  });
}