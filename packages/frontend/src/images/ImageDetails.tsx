import { useParams } from "react-router-dom";
import type { IApiImageData } from "../../../backend/src/common/ApiImageData";
import { ImageNameEditor } from "./ImageNameEditor";

interface IImageDetailsProps {
    images: IApiImageData[];
    loading: boolean;
    authToken: string | null;
    setImages: React.Dispatch<React.SetStateAction<IApiImageData[]>>;
    error: string | null;
}

export function ImageDetails({ images, loading, authToken, setImages, error }: IImageDetailsProps) {
    if (loading) return <div>Loading image</div>
    if (error) return <div>Failed to load image: {error}</div>

    const { imageId } = useParams<{imageId: string}>();
    if (!imageId) return (<h2>ImageId not found</h2>);

    const image = images.find(image => image.id === imageId);
    if (!image) return (<h2>Image not found</h2>);

    function handleSave(newName: string){
        setImages((prev) => prev.map((img) => img.id === imageId ? {...img, name: newName}: img));
    }

    return (
        <>
            <h2>{image.name}</h2>
            <p>By {image.author.username}</p>
            < ImageNameEditor initialValue={image.name} imageId={imageId} authToken={authToken} onSave={handleSave}/>
            <img className="ImageDetails-img" src={image.src} alt={image.name} />
        </>
    )
}
