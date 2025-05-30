import type { IApiImageData } from "../../../backend/src/common/ApiImageData.ts";
import { ImageGrid } from "./ImageGrid.tsx";

interface AllImagesProp {
    images: IApiImageData[];
    loading: boolean;
    error: string | null;
}

export function AllImages({ images, loading, error}: AllImagesProp) {
    if (loading) return <div>Loading Images</div>
    if (error) return <div>Error loading images: {error}</div>
    return (
        <>
            <h2>All Images</h2>
            <ImageGrid images={images} />
        </>
    );
}
