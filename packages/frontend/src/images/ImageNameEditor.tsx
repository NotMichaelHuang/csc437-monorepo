import { useState } from "react";


interface INameEditorProps {
    initialValue: string;
    imageId: string;
    onSave: (newName: string) => void;
}

export function ImageNameEditor(props: INameEditorProps) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [input, setInput] = useState(props.initialValue);
 
    async function handleSubmitPressed() { 
        const res = await fetch(
            `/api/images/${props.imageId}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({ name: input}),
            }
        )
        if (!res.ok)
        {
            console.error("Update failed: ", await res.text());
            return;
        }

        props.onSave(input);
        setIsEditingName(false);
    }

    if (isEditingName) {
        return (
            <div style={{ margin: "1em 0" }}>
                <label>
                    New Name <input value={input} onChange={e => setInput(e.target.value)}/>
                </label>
                <button disabled={input.length === 0} onClick={handleSubmitPressed}>Submit</button>
                <button onClick={() => setIsEditingName(false)}>Cancel</button>
            </div>
        );
    } else {
        return (
            <div style={{ margin: "1em 0" }}>
                <button onClick={() => setIsEditingName(true)}>Edit name</button>
            </div>
        );
    }
}