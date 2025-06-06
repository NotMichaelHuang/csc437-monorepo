// src/images/AllImages.tsx
import React from "react";
import type { IApiImageData } from "../../../backend/src/common/ApiImageData";
import { ImageGrid } from "./ImageGrid";

interface AllImagesProps {
  images: IApiImageData[];
  loading: boolean;
  error: string | null;
  searchPanel?: React.ReactNode;
}

export function AllImages({
  images,
  loading,
  error,
  searchPanel,
}: AllImagesProps) {
  if (loading) {
    return <div>Loading Images…</div>;
  }
  if (error) {
    return <div>Error loading images: {error}</div>;
  }

  return (
    <main>
      <h2>All Images</h2>
      {searchPanel && <div className="search-panel">{searchPanel}</div>}
      <ImageGrid images={images} />
    </main>
  );
}
