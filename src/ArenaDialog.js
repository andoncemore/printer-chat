import React, {useState} from 'react'
import Arena from 'are.na'

const ArenaDialog = ({closeModal, addElements}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [loadError, setLoadError] = useState(false);

    const loadChannel = (ch) => {
        setLoadError(false);
        const arena = new Arena();
        arena.channel(ch).contents().then(res => addContent(res)).catch(err => setLoadError(true));
    }

    const addContent = (content) => {
        let addition = content.filter(elt => elt.class === "Image").map(elt => {
            console.log(elt);
            return {
                type: "image",
                content: `/api/image/${encodeURIComponent(elt.image.original.url)}`,
                arena_id: elt.id,
                id: (Date.now()+Math.floor(Math.random()*1000)).toString(),
                ref: null
            }
        })
        console.log(addition);
        addElements(addition);
        closeModal();
    }

    return(
        <React.Fragment>
            <div className="arenaChannel">
                <input placeholder="are.na channel" value={searchTerm} onChange={(evt) => setSearchTerm(evt.target.value)}/>
                <button disabled={searchTerm === ""} onClick={() => loadChannel(searchTerm)}>load</button>
            </div>
            { loadError && 
                <div>
                    <i>could not find channel</i>
                 </div>
            }
        </React.Fragment>

    )
}

export default ArenaDialog;