import React, {useCallback,useMemo,useState} from 'react'
import { Editable, withReact, useSlate, Slate } from 'slate-react'
import { Editor, Transforms, createEditor, Element as SlateElement } from 'slate'
import './TextEditor.css'


const TextEditor = ({ content, updateContent, innerRef, draggableProps, dragHandleProps}) => {
    const editor = useMemo(() => withReact(createEditor()),[]);
    const renderElement = useCallback(props => <TextElements {...props} />, []);
    const renderLeaf = useCallback(props => <Leaf {...props} />, []);
    const [editMode, setEditMode] = useState(false);

    const keydown = (event) => {
        if(!event.metaKey){
            return;
        }
       
        switch (event.key){
            case 'g':{
                toggleMark(editor, 'bold');
                event.preventDefault();
                break;
            }
            case 'i':{
                toggleMark(editor,'italic');
                event.preventDefault();
                break;
            }
            case 'u':{
                toggleMark(editor, 'underline');
                event.preventDefault();
                break;
            }
            case 'h':{
                toggleBlock(editor, 'highlight');
                event.preventDefault();
                break;
            }
            default: break;
        }

    }

    return (
        <div className="textEditor" style={{width: `43ch`}} ref={innerRef} {...draggableProps} >
            <Slate 
                editor={editor}
                value={content}
                onChange={newValue => updateContent(newValue)}
            >
                {editMode &&
                <div className="toolbar">
                    <BlockButton format="heading-one" />
                    <BlockButton format="heading-two" />
                    <MarkButton format="bold" />
                    <MarkButton format="italic" />
                    <MarkButton format="underline" />
                    <MarkButton format="highlight" />
                </div>
                }
                
                <Editable
                    renderElement={renderElement}
                    renderLeaf={renderLeaf}
                    placeholder="write some text"
                    onKeyDown={keydown}
                    onFocus={(evt) => setEditMode(true)}
                    onBlur={(evt) => setEditMode(false)}

                />
            </Slate>
            <div className="overlayButtons" {...dragHandleProps}>
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0)">
                        <path d="M8 21L8 3L10 3L10 21L8 21ZM14 21L14 3L16 3L16 21L14 21Z"/>
                    </g>
                    <defs>
                        <clipPath id="clip0">
                        <rect width="24" height="24" fill="white"/>
                        </clipPath>
                    </defs>
                </svg>
            </div>
        </div>
    );
}


const icons = {
    "heading-one": <React.Fragment><path d="M4.30884 18.75V5.25H6.70884V10.875C7.02134 10.3625 7.44009 9.9625 7.96509 9.675C8.50259 9.375 9.11509 9.225 9.80259 9.225C10.9526 9.225 11.8401 9.5875 12.4651 10.3125C13.1026 11.0375 13.4213 12.1 13.4213 13.5V18.75H11.0401V13.725C11.0401 12.925 10.8776 12.3125 10.5526 11.8875C10.2401 11.4625 9.74009 11.25 9.05259 11.25C8.37759 11.25 7.81509 11.4875 7.36509 11.9625C6.92759 12.4375 6.70884 13.1 6.70884 13.95V18.75H4.30884Z"/>
    <path d="M17.1976 18.75V8.3625L15.0413 8.86875V7.03125L18.2101 5.625H19.6913V18.75H17.1976Z" /></React.Fragment>,
    "heading-two": <React.Fragment><path d="M1.90869 18.75V5.25H4.30869V10.875C4.62119 10.3625 5.03994 9.9625 5.56494 9.675C6.10244 9.375 6.71494 9.225 7.40244 9.225C8.55244 9.225 9.43994 9.5875 10.0649 10.3125C10.7024 11.0375 11.0212 12.1 11.0212 13.5V18.75H8.63994V13.725C8.63994 12.925 8.47744 12.3125 8.15244 11.8875C7.83994 11.4625 7.33994 11.25 6.65244 11.25C5.97744 11.25 5.41494 11.4875 4.96494 11.9625C4.52744 12.4375 4.30869 13.1 4.30869 13.95V18.75H1.90869Z" />
    <path d="M13.0537 18.75V17.0062C13.8537 16.3437 14.6287 15.6875 15.3787 15.0375C16.1412 14.3875 16.8162 13.7438 17.4037 13.1062C18.0037 12.4687 18.4787 11.85 18.8287 11.25C19.1912 10.6375 19.3724 10.0438 19.3724 9.46875C19.3724 8.93125 19.2224 8.45625 18.9224 8.04375C18.6349 7.63125 18.1537 7.425 17.4787 7.425C16.7912 7.425 16.2724 7.65 15.9224 8.1C15.5724 8.55 15.3974 9.09375 15.3974 9.73125H13.0724C13.0974 8.76875 13.3099 7.96875 13.7099 7.33125C14.1099 6.68125 14.6412 6.2 15.3037 5.8875C15.9662 5.5625 16.7099 5.4 17.5349 5.4C18.8724 5.4 19.9099 5.76875 20.6474 6.50625C21.3974 7.23125 21.7724 8.175 21.7724 9.3375C21.7724 10.0625 21.6037 10.7688 21.2662 11.4563C20.9412 12.1438 20.5099 12.8063 19.9724 13.4438C19.4349 14.0813 18.8537 14.6813 18.2287 15.2438C17.6037 15.7938 16.9974 16.3063 16.4099 16.7813H22.0912V18.75H13.0537Z"/></React.Fragment>, 
    "bold": <React.Fragment><path d="M6.41797 19.5V4.5H12.4394C13.9965 4.5 15.1823 4.86429 15.9965 5.59286C16.8251 6.30714 17.2394 7.22857 17.2394 8.35714C17.2394 9.3 16.9823 10.0571 16.468 10.6286C15.968 11.1857 15.3537 11.5643 14.6251 11.7643C15.4823 11.9357 16.1894 12.3643 16.7465 13.05C17.3037 13.7214 17.5823 14.5071 17.5823 15.4071C17.5823 16.5929 17.1537 17.5714 16.2965 18.3429C15.4394 19.1143 14.2251 19.5 12.6537 19.5H6.41797ZM9.16083 10.8H12.0323C12.8037 10.8 13.3965 10.6214 13.8108 10.2643C14.2251 9.90714 14.4323 9.4 14.4323 8.74286C14.4323 8.11429 14.2251 7.62143 13.8108 7.26429C13.4108 6.89286 12.8037 6.70714 11.9894 6.70714H9.16083V10.8ZM9.16083 17.2714H12.2251C13.0394 17.2714 13.668 17.0857 14.1108 16.7143C14.568 16.3286 14.7965 15.7929 14.7965 15.1071C14.7965 14.4071 14.5608 13.8571 14.0894 13.4571C13.618 13.0571 12.9823 12.8571 12.1823 12.8571H9.16083V17.2714Z"/></React.Fragment>,
    "italic": <React.Fragment><path d="M6.30005 19.5L6.64291 17.4857H9.92148L11.85 6.51429H8.63576L9.00005 4.5H17.7L17.3358 6.51429H14.1215L12.1929 17.4857H15.45L15.0858 19.5H6.30005Z" /></React.Fragment>,
    "underline": <React.Fragment><path d="M11.9491 16.5407C11.081 16.5407 10.2974 16.3716 9.59843 16.0334C8.89944 15.6839 8.34137 15.1596 7.92423 14.4607C7.51836 13.7617 7.31543 12.8766 7.31543 11.8056V4.5H9.48005V11.8225C9.48005 12.747 9.6999 13.4347 10.1396 13.8857C10.5906 14.3366 11.2106 14.5621 11.9998 14.5621C12.7777 14.5621 13.3922 14.3366 13.8431 13.8857C14.2941 13.4347 14.5196 12.747 14.5196 11.8225V4.5H16.6842V11.8056C16.6842 12.8766 16.47 13.7617 16.0416 14.4607C15.6132 15.1596 15.0382 15.6839 14.3166 16.0334C13.6064 16.3716 12.8172 16.5407 11.9491 16.5407Z"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M17.7861 19.5H6.21387V17.621H17.7861V19.5Z"/></React.Fragment>,
    "highlight": <React.Fragment><rect x="2" y="7.5" width="20" height="9" /></React.Fragment>
}

const TextElements = ({attributes, children, element}) => {
    switch (element.type){
        case 'heading-one':
            return <h1 {...attributes}>{children}</h1>
        case 'heading-two':
            return <h2 {...attributes}>{children}</h2>
        default:
            return <p {...attributes}>{children}</p>
    }
}

const Leaf = ({attributes, children, leaf}) => {
    if(leaf.bold){
        children = <strong>{children}</strong>
    }
    if(leaf.italic){
        children = <em>{children}</em>
    }
    if(leaf.underline){
        children = <u>{children}</u>
    }
    if(leaf.highlight){
        children = <mark>{children}</mark>
    }
    return <span {...attributes}>{children}</span>
}

const toggleMark = (editor, format) => {
    const marks = Editor.marks(editor);
    if(format in marks){
        Editor.removeMark(editor,format);
    }
    else{
        Editor.addMark(editor,format,true);
    }
}

const toggleBlock = (editor, format) => {
    const isActive = isBlockActive(editor, format);
    Transforms.setNodes(
        editor,
        { type: isActive ? 'paragraph' : format },
        { match: n => Editor.isBlock(editor, n)}
    )
}

const isBlockActive = (editor, format) => {
    const [match] = Editor.nodes(editor, {
        match: n =>  !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format
    })
    return !!match;
}

const isMarkActive = (editor, format) => {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false
}

const MarkButton = ({format}) => {
    const editor = useSlate();
    return (
        <button
            className="iconButton"
            onMouseDown={evt => {
                evt.preventDefault();
                toggleMark(editor, format); 
            }}
        >
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" 
                style={{fill: isMarkActive(editor,format) ? 'var(--main-accent)' : 'var(--light-content)'}}>
                {icons[format]}
            </svg>
        </button>
    )
}

const BlockButton = ({ format }) => {
    const editor = useSlate();
    
    return(
        <button
            className="iconButton"
            onMouseDown={evt => {
                evt.preventDefault();
                toggleBlock(editor, format); 
            }}
        >
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" 
                style={{fill: isBlockActive(editor,format) ? 'var(--main-accent)' : 'var(--light-content)'}}>
                {icons[format]}
            </svg>
        </button>
    )
}



export default TextEditor;