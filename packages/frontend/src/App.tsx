import { AllImages } from "./images/AllImages.tsx";
import { ImageDetails } from "./images/ImageDetails.tsx";
import { UploadPage } from "./UploadPage.tsx";
import { Routes, Route } from "react-router-dom";
import { LoginPage } from "./LoginPage.tsx";
import { MainLayout } from "./MainLayout.tsx";

import { useState } from "react";
import { fetchDataFromServer } from "./MockAppData.ts";

import { ValidRoutes } from "../../backend/shared/validRoute.ts";


function App() { 
    const [imageData, _setImageData] = useState(fetchDataFromServer);

    return (
        <Routes>
            <Route element={< MainLayout />}>
                <Route index element={< AllImages images={imageData} />} />
                <Route path={ValidRoutes.IMAGE} element={ <ImageDetails images={imageData}/> }/>
                <Route path={ValidRoutes.UPLOAD} element={<UploadPage />} />
                <Route path={ValidRoutes.LOGIN} element={<LoginPage />} />
            </Route>
        </Routes>
    );
}

export default App;

