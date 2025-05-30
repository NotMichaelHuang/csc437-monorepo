import { AllImages } from "./images/AllImages.tsx";
import { ImageDetails } from "./images/ImageDetails.tsx";
import { UploadPage } from "./UploadPage.tsx";
import { Routes, Route } from "react-router-dom";
import { LoginPage } from "./LoginPage.tsx";
import { MainLayout } from "./MainLayout.tsx";

import { useState, useEffect } from "react";
import { ValidRoutes } from "../../backend/src/shared/validRoute.ts";
import type { IApiImageData } from "../../backend/src/common/ApiImageData.ts";


function App() { 
    const [imageData, setImageData] = useState<IApiImageData[]>([]);
    const [loading, _setLoading] = useState(true);
    const [error, _setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/images")
        .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json() as Promise<IApiImageData[]>;
        })
        .then((images) => {
            setImageData(images);
            _setLoading(false);
        })
        .catch((err: Error) => {
            console.error("Failed to load images", err);
            _setError(err.toString());
            _setLoading(false);
        })
    }, []); // empty, run once or twice in <StrictMode/>

    return (
        <Routes>
            <Route element={< MainLayout />}>
                <Route index element={< AllImages images={imageData} loading={loading} error={error}/>} />
                <Route path={ValidRoutes.IMAGE} element={ <ImageDetails images={imageData} loading={loading} setImages={setImageData} error={error}/> }/>
                <Route path={ValidRoutes.UPLOAD} element={<UploadPage />} />
                <Route path={ValidRoutes.LOGIN} element={<LoginPage />} />
            </Route>
        </Routes>
    );
}

export default App;

