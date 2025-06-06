import { useState, useEffect, useCallback, useRef } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { AllImages } from "./images/AllImages";
import { ImageSearchForm } from "./images/ImageSearchForm";
import { ImageDetails } from "./images/ImageDetails";
import { UploadPage } from "./UploadPage";
import { LoginPage } from "./LoginPage";
import { MainLayout } from "./MainLayout";

import { ProtectedRoute } from "./ProtectedRoute";
import { ValidRoutes } from "../../backend/src/shared/validRoute.ts";
import type { IApiImageData } from "../../backend/src/common/ApiImageData";


const TOKEN_KEY = "authToken";
function App() {
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });

  const [images, setImages] = useState<IApiImageData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchString, setSearchString] = useState<string>("");

  const requestIdRef = useRef<number>(0);
  const fetchImages = useCallback(
    async (search?: string) => {
      if (!authToken) return;

      requestIdRef.current++;
      const thisRequestId = requestIdRef.current;
      setLoading(true);
      setError(null);

      const queryParam = search ? `?search=${encodeURIComponent(search)}` : "";
      const url = `/api/images${queryParam}`;
      try {
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        if (!res.ok) {
          // If 401/403, treat it as an expired/invalid token → log out
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem(TOKEN_KEY);
            setAuthToken(null);
            return;
          }
          throw new Error(`Server responded ${res.status}`);
        }
        const data: IApiImageData[] = await res.json();

        if (thisRequestId === requestIdRef.current) {
          setImages(data);
        }
      } catch (err) {
        if (thisRequestId === requestIdRef.current) {
          console.error("Failed to fetch images:", err);
          setError((err as Error).message);
        }
      } finally {
        if (thisRequestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [authToken]
  );

  useEffect(() => {
    if (authToken) {
      fetchImages("");
    } else {
      setImages([]);
    }
  }, [authToken, fetchImages]);

  const handleImageSearch = useCallback(() => {
    fetchImages(searchString);
  }, [searchString, fetchImages]);

  return (
      <Routes>
        {/* Public: /login and /register share a single LoginPage component */}
        <Route path="/login" element={ <LoginPage isRegistering={false} onAuthSuccess={(token: string) => { 
          localStorage.setItem(TOKEN_KEY, token); 
          setAuthToken(token);
        }} />}
        />

        <Route path="/register" element={ <LoginPage isRegistering={true} onAuthSuccess={(token: string) => { 
          localStorage.setItem(TOKEN_KEY, token);
          setAuthToken(token);
        }} /> }
        />

        {/* All the protected area lives under MainLayout */}
        <Route path="/" element={ <ProtectedRoute authToken={authToken}> <MainLayout /> </ProtectedRoute> }>
          <Route index element={<Navigate to="/images" replace />} />

          <Route path={ValidRoutes.ALL_IMAGES} element={ <ProtectedRoute authToken={authToken}>
            <AllImages
              images={images}
              loading={loading}
              error={error}
              searchPanel={
                <ImageSearchForm
                searchString={searchString}
                onSearchStringChange={setSearchString}
                onSearchRequested={handleImageSearch}
                />}
                /> </ProtectedRoute>
              }
              />

          <Route path={ValidRoutes.IMAGE} element={ <ProtectedRoute authToken={authToken}> <ImageDetails 
            images={images}
            loading={loading}
            setImages={setImages}
            authToken={authToken}
            error={error}
          /> </ProtectedRoute> } />

          <Route path={ValidRoutes.UPLOAD} element={ <ProtectedRoute authToken={authToken}> <UploadPage /> </ProtectedRoute> } />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
  );
}
export default App;

