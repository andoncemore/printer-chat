import React, { useEffect, useState, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Text } from "slate";
import "./App.css";
import ImageCanvas from "./ImageCanvas";
import TextEditor from "./TextEditor";
import Modal from "./Modal";
import ArenaDialog from "./ArenaDialog";

function App() {
  const [printList, setPrintList] = useState([]);
  const [fontSize, setFontSize] = useState(16);
  const [printingState, setPrintingState] = useState("");
  const recieptEl = useRef(null);
  const [openModal, setOpenModal] = useState("");
  const [online, setOnline] = useState(false);

  useEffect(() => {
    function handleResize() {
      console.log(recieptEl.current.clientWidth);
      if (fontSize !== recieptEl.current.clientWidth / 26) {
        setFontSize(recieptEl.current.clientWidth / 26);
      }
    }
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line
  }, []);
  
  useEffect(() => {
    fetch("https://receipt.adit.design/printkey/rn7yhljbhh376hs2akgf")
      .then(response => response.json())
      .then(data => {
        (data.status === "online" ? setOnline(true) : setOnline(false))
      }
      );    
  })

  const addElements = additions => {
    setPrintList([...printList, ...additions]);
  };

  const handleFileUpload = evt => {
    console.log("New Upload", evt);
    let newUploads = Array.from(evt.target.files).map(file => ({
      type: "image",
      content: URL.createObjectURL(file),
      id: (Date.now() + Math.floor(Math.random() * 100)).toString(),
      ref: null
    }));
    addElements(newUploads);
    // setPrintList([...printList, ...newUploads]);
    evt.target.value = "";
  };

  const addTextBlock = evt => {
    let newTextBlock = {
      type: "text",
      content: [
        {
          type: "paragraph",
          children: [{ text: "" }]
        }
      ],
      id: Date.now().toString()
    };
    addElements([newTextBlock]);
    // setPrintList([...printList,newTextBlock]);
  };

  const updateTextBlock = (id, updates) => {
    const items = Array.from(printList);
    items[items.findIndex(el => el.id === id)].content = updates;
    setPrintList(items);
  };

  const updateRef = (id, ref) => {
    console.log("Updating Ref", printList);
    const items = Array.from(printList);
    items[items.findIndex(el => el.id === id)].ref = ref;
    setPrintList(items);
  };

  const deleteElement = id => {
    const items = Array.from(printList);
    let removal = items.findIndex(elt => elt.id === id);
    if (removal !== -1) {
      items.splice(removal, 1);
      setPrintList(items);
    }
  };

  const serializeText = node => {
    if (Text.isText(node)) {
      let text = node.text;
      if (text === "") {
        text = `<br>`;
      }
      if (node.bold === true) {
        text = `<strong>${text}</strong>`;
      }
      if (node.italic === true) {
        text = `<em>${text}</em>`;
      }
      if (node.underline === true) {
        text = `<u>${text}</u>`;
      }
      if (node.highlight === true) {
        text = `<mark style="background:black;color:white">${text}</mark>`;
      }
      return text;
    }
    const children = node.children.map(n => serializeText(n)).join("");

    switch (node.type) {
      case "heading-one":
        return `<h1 style="font-size:3em;">${children}</h1>`;
      case "paragraph":
        return `<p>${children}</p>`;
      case "heading-two":
        return `<h2 style="font-size:2em;">${children}</h2>`;
      default:
        return children;
    }
  };

  const printReciept = async () => {
    setPrintingState("printing.");
    let totalHeight = 0;
    let html_string = "";
    
    for (let item=0; item < printList.length; item++) {
      if (printList[item].type === "image") {
        const canvasURL = printList[item].ref.current.toDataURL("image/png");
        totalHeight += printList[item].ref.current.height/printList[item].ref.current.width*500;
        console.log(`Getting Image ${item}: ${totalHeight}`)
        html_string += `<img src="${canvasURL}" style="width: 100%">`;
      } else if (printList[item].type === "text") {
        const textHTML = printList[item].content.map(n => serializeText(n)).join("");
        html_string += `<div style="max-width: 42ch; width: 100%;font-size:19px;line-height:1.4;font-family:monospace">${textHTML}</div>`;
      }
      if (totalHeight > 1500 || item === printList.length-1) {
        console.log("printing images now");
        let response = await fetch(
          "https://receipt.adit.design/printkey/rn7yhljbhh376hs2akgf",
          {
            method: "POST",
            headers: {
              "Content-Type": "text/html"
            },
            body: html_string
          }
        );
        let data = await response.json();
        if(data.status === "sent"){
          setPrintingState(printingState + ".");
        }
        else {
          setPrintingState(`error: ${data.status}`);
          break;
        }
        totalHeight = 0;
        html_string = 0;
      }
      if(item === printList.length-1){
        setPrintList([]);
        setPrintingState("");
      }
    }


//     let html_to_send = printList
//       .map(item => {
//         if (item.type === "image") {
//           const canvasURL = item.ref.current.toDataURL("image/png");
//           return `<img src="${canvasURL}" style="width: 100%">`;
//         } else if (item.type === "text") {
//           const textHTML = item.content.map(n => serializeText(n)).join("");
//           console.log(textHTML);
//           return `<div style="max-width: 42ch; width: 100%;font-size:19px;line-height:1.4;font-family:monospace">${textHTML}</div>`;
//         }
//         return "";
//       })
//       .join("");

//     fetch("https://receipt.aditd.me/printkey/o7u4mup4pu10iihtrcj1", {
//       method: "POST",
//       headers: {
//         "Content-Type": "text/html"
//       },
//       body: html_to_send
//     })
//       .then(res => res.json())
//       .then(data => {
//         if (data.status === "sent") {
//           setPrintingState("");
//           setPrintList([]);
//         } else {
//           setPrintingState(`error: ${data.status}`);
//         }
//       })
//       .catch(error => {
//         setPrintingState(`error: ${error.name}`);
//         console.log(error);
//       });
  };

  const handleOnDragEnd = result => {
    if (!result.destination) return;
    const items = Array.from(printList);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setPrintList(items);
  };

  const handleArena = () => {
    openModal === "" ? setOpenModal("are.na import") : setOpenModal("");
  };

  return (
    <React.Fragment>
      <div className="App">
        <div className="TitleBlock">
          <h1>printer chat</h1>
          {online ? <p>
            send images, text, and drawings to{" "}
            <mark>adit's receipt printer.</mark>
          </p> : <p>Printer is unfortunately offline. Contact Adit to get it back online. </p>
          }
        </div>
        { online &&
        <div className="Options">
          <label className="filebtn">
            Upload Img
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={e => handleFileUpload(e)}
            />
          </label>
            <button onClick={elt => addTextBlock()}>Aa</button>
            <button disabled={true}>Import</button>
            <button disabled={false} onClick={elt => handleArena()}>
              <svg viewBox="0 0 24 12" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M7.05458 0.100495C7.02779 -0.0334977 6.83622 -0.0334987 6.80943 0.100494L5.98522 4.22315C5.97044 4.2971 5.89402 4.34122 5.82258 4.31705L1.84016 2.96951C1.71072 2.92571 1.61494 3.09162 1.71758 3.18181L4.8758 5.95692C4.93246 6.0067 4.93246 6.09494 4.8758 6.14472L1.71758 8.91983C1.61494 9.01003 1.71072 9.17594 1.84016 9.13214L5.82258 7.7846C5.89402 7.76042 5.97044 7.80454 5.98522 7.8785L6.80943 12.0011C6.83622 12.1351 7.02779 12.1351 7.05458 12.0012L7.87879 7.8785C7.89357 7.80454 7.96999 7.76042 8.04143 7.7846L11.8166 9.062C11.8364 9.12254 11.9005 9.16838 11.976 9.14282L12.0157 9.12939L12.0239 9.13214C12.0884 9.15399 12.1447 9.12363 12.172 9.07651L15.9585 7.79528C16.0299 7.77111 16.1063 7.81523 16.1211 7.88918L16.9453 12.0118C16.9721 12.1458 17.1637 12.1458 17.1905 12.0118L18.0147 7.88918C18.0295 7.81523 18.1059 7.77111 18.1773 7.79528L22.1597 9.14282C22.2892 9.18662 22.385 9.02071 22.2823 8.93052L19.1241 6.15541C19.0674 6.10562 19.0674 6.01739 19.1241 5.96761L22.2823 3.19249C22.385 3.1023 22.2892 2.93639 22.1597 2.98019L18.1773 4.32773C18.1059 4.3519 18.0295 4.30779 18.0147 4.23383L17.1905 0.111178C17.1637 -0.022815 16.9721 -0.022816 16.9453 0.111177L16.1211 4.23383C16.1063 4.30779 16.0299 4.3519 15.9585 4.32773L12.1833 3.05033C12.1634 2.98979 12.0994 2.94395 12.0239 2.96951L11.9842 2.98294L11.976 2.98019C11.9114 2.95833 11.8552 2.9887 11.8279 3.03582L8.04143 4.31705C7.96999 4.34122 7.89357 4.2971 7.87879 4.22315L7.05458 0.100495ZM11.9939 3.31587L8.98821 5.95692C8.93156 6.0067 8.93156 6.09494 8.98821 6.14472L12.006 8.79646L15.0117 6.1554C15.0683 6.10562 15.0683 6.01739 15.0117 5.96761L11.9939 3.31587Z"
                />
              </svg>
            </button>
        </div>
        }

        <div
          className="Contents"
          style={{ fontSize: `${fontSize}px` }}
          ref={recieptEl}
        >
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="reciept">
              {provided => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {printList.map((elt, index) => (
                    <Draggable key={elt.id} draggableId={elt.id} index={index}>
                      {provided => {
                        if (elt.type === "image") {
                          return (
                            <ImageCanvas
                              innerRef={provided.innerRef}
                              draggableProps={provided.draggableProps}
                              dragHandleProps={provided.dragHandleProps}
                              imgSrc={elt.content}
                              updateRef={ref => updateRef(elt.id, ref)}
                              deleteSelf={() => deleteElement(elt.id)}
                              id={elt.id}
                            />
                          );
                        } else if (elt.type === "text") {
                          return (
                            <TextEditor
                              innerRef={provided.innerRef}
                              draggableProps={provided.draggableProps}
                              dragHandleProps={provided.dragHandleProps}
                              content={elt.content}
                              updateContent={value =>
                                updateTextBlock(elt.id, value)
                              }
                            />
                          );
                        }
                      }}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          {printList.length > 0 && (
            <div className="printOptions">
              <button onClick={() => printReciept()}>print</button>
              <button disabled>export</button>
              <span className="errorMessage">{printingState}</span>
            </div>
          )}
        </div>
      </div>
      {openModal !== "" && (
        <Modal title={openModal} closeModal={() => setOpenModal("")}>
          {openModal === "are.na import" && (
            <ArenaDialog
              closeModal={() => setOpenModal("")}
              addElements={addElements}
            />
          )}
        </Modal>
      )}
    </React.Fragment>
  );
}

export default App;
