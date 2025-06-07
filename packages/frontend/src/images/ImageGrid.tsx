import { Link } from "react-router-dom";
import type { IApiImageData } from "../../../backend/src/common/ApiImageData";
import "./Images.css";

interface IImageGridProps {
    images: IApiImageData[];
}

export function ImageGrid(props: IImageGridProps) {
    // TODO
    console.log("All images received from backend:", props.images);
    const imageElements = props.images.map((image) => {
        // TODO
        console.log("Rendering image:", image.src);
        return (
            <div key={image.id} className="ImageGrid-photo-container">
                <Link to={"/images/" + image.id}>
                    <img src={image.src} alt={image.name}/>
                </Link>
            </div>
        );
    });
    return (
        <div className="ImageGrid">
            {imageElements}
        </div>
    );
}

