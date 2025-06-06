import { useId, useState } from "react";


export function UploadPage() {
    const fileId = useId();
    const [previewURL, setPreviewURL] = useState<string | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [feedback, setFeedback] = useState<{type: "success" | "error"; 
        message: string;} | null>(null);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) {
            setPreviewURL("");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            if(typeof reader.result === "string") {
                setPreviewURL(reader.result);
            } else {
                setPreviewURL(undefined)
            } 
        };
        reader.readAsDataURL(file);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (isSubmitting) return;

        const form = e.currentTarget;
        const formData = new FormData(form);

        const file = formData.get("image") as File | null;
        const title = formData.get("name") as string | null;
        if (!file || file.size === 0) {
            setFeedback({ type: "error", message: "Please choose an image file." });
            return;
        }
        if (!title || title.trim() === "") {
            setFeedback({ type: "error", message: "Please enter a title." });
            return;
        }
        setIsSubmitting(true);
        setFeedback(null);

        try {
            const token = localStorage.getItem("authToken") ?? "";
            // TODO
            console.log("TOKEN: ", token);
            const response = await fetch("/api/images", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });
            
            if (response.ok) {
                // Example: the server returns something like { message: "...", info: { … } }
                await response.json();
                setFeedback({ type: "success", message: "Upload succeeded!" });
                form.reset();
                setPreviewURL(undefined);
            } else {
                let errMsg = `Upload failed: ${response.status} ${response.statusText}`;
                try {
                    const errJson = await response.json();
                    if (errJson.error) errMsg = `Upload failed: ${errJson.error}`;
                } catch (e) { /* ignore JSON parse error */ }
                setFeedback({ type: "error", message: errMsg });
            }
        } catch (networkErr) {
            setFeedback({
                type: "error",
                message: "Upload failed due to network error.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <div role="status" aria-live="polite">
            {feedback ? (
            <p
                style={{
                color: feedback.type === "error" ? "crimson" : "seagreen",
                }}
            >
                {feedback.message}
            </p>
            ) : null}
        </div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor={fileId}>Choose image to upload: </label>
                    <input id={fileId} name="image" type="file" onChange={handleFileChange} accept=".png,.jpg,.jpeg" required />
                </div>
                <div>
                    <label>
                        <span>Image title: </span>
                        <input name="name" required disabled={isSubmitting}/>
                    </label>
                </div>
                <div> {/* Preview img element */}
                    <img style={{width: "20em", maxWidth: "100%"}} src={previewURL} alt="preview" />
                </div>
                <button type="submit" value="Confirm upload" disabled={isSubmitting}>
                    {isSubmitting ? "Uploading…" : "Confirm upload"}
                </button>
            </form> 
        </>
    );
}
