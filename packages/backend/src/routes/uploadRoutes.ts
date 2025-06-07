import express, { Request, Response, NextFunction } from "express";
import { imageMiddlewareFactory, handleImageFileErrors } from "../uploadMiddleware";
import { verifyAuthToken } from "../authMiddleWare";
import { ImageProvider } from "../imageProvider";

export function registerUploadRoutes(app: express.Application, imageProvider: ImageProvider) {
    app.post(
        "/api/images",
        verifyAuthToken,
        imageMiddlewareFactory.single("image"),     // <- disk storage, not memory
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                // TODO
                // console.log("UPLOAD ROUTE: Handler entered.");
                // The file is now on disk: req.file.filename and req.file.path
                const file = req.file as Express.Multer.File | undefined;
                if (!file) {
                    // TODO
                    // console.error("UPLOAD ROUTE: No file uploaded!");
                    res.status(400).json({ error: "Missing file upload under field image." });
                    return;
                }

                const title = (req.body.name as string)?.trim() || "";
                if (!title) {
                    // TODO
                    // console.error("UPLOAD ROUTE: No title given!");
                    res.status(400).json({ error: "Missing title under file name." });
                    return;
                }

                // req.user injected by your auth middleware
                const authorId = (req as any).user?.id as string;
                if (!authorId) {
                    // TODO
                    console.error("UPLOAD ROUTE: No authorId (user not authenticated)!");
                    res.status(401).json({ error: "Not authenticated." });
                    return;
                }

                // The URL at which this image will be served
                const src = `/uploads/${file!.filename}`;
                // TODO
                // console.log("UPLOAD ROUTE:", { title, authorId, src });
                await imageProvider.createImage(
                    title,
                    // TODO
                    //authorId,
                    title,
                    src,
                );
                // TODO
                // console.log("UPLOAD ROUTE: Image created, sending 201.");
                res.status(201).json({message: "Image uploaded!"});
            } catch (err) {
                // TODO
                console.error("UPLOAD ROUTE: Caught error:", err);
                handleImageFileErrors(err, req, res, next);
            }
        },
    );
}

