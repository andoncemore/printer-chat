import React, {useRef, useEffect, useState} from 'react'

/* <img src={imgSrc} alt="uploaded" /> */
function ImageCanvas({imgSrc, updateRef, id, innerRef, draggableProps, dragHandleProps, deleteSelf}) {
    const canvasRef = useRef(null);
    const imDataRef = useRef(null);
    const didMount = useRef(false);
    const [threshold, setThreshold]  = useState(175);
    const [dither, setDither] = useState(0);
    const [openOption, setOpenOption] = useState(false);

    useEffect(() =>{
        if(!didMount.current){
            var img = new Image();
            img.crossOrigin = "anonymous";
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
             img.onload = function(){
                canvas.height = 500/this.width*this.height;
                ctx.drawImage(img,0,0,canvas.width,canvas.height);
                imDataRef.current = ctx.getImageData(0,0,canvas.width,canvas.height);
                processImage();
            }
            updateRef(canvasRef);
            img.src = imgSrc;
            didMount.current = true;
        }
        else{
            processImage();
        }
        // eslint-disable-next-line
    },[imgSrc,dither,threshold]);

    const processImage = () => {
        const imdata = new ImageData(
            new Uint8ClampedArray(imDataRef.current.data),
            imDataRef.current.width,
            imDataRef.current.height
        );
        const ctx = canvasRef.current.getContext('2d');

        const getIndex = (x,y) => {
            return (x+y*imdata.width)*4;
        }

        const bw = (x,y) => {
            let index = getIndex(x,y)
            let luma = Math.floor(imdata.data[index]*0.3 +
                imdata.data[index+1]* 0.59 +
                imdata.data[index+2] * 0.11);
            imdata.data[index] = imdata.data[index+1] = imdata.data[index+2] = luma > threshold ? 255 : 0; 
            return luma;
        }

        for(let y=0; y<imdata.height-1; y++){
            for(let x=0; x < imdata.width-1; x++){
                let luma = bw(x,y);
            // console.log(luma)
                if(dither !== 0){
                    let err = (luma - imdata.data[getIndex(x,y)])*dither;
                    imdata.data[getIndex(x+1,y)] = imdata.data[getIndex(x+1,y)+1] = imdata.data[getIndex(x+1,y)+2] = imdata.data[getIndex(x+1,y)] + err * 7 / 16;
                    imdata.data[getIndex(x-1,y+1)] = imdata.data[getIndex(x-1,y+1)] = imdata.data[getIndex(x-1,y+1)] = imdata.data[getIndex(x-1,y+1)] + err * 3 / 16;
                    imdata.data[getIndex(x,y+1)] = imdata.data[getIndex(x,y+1)] = imdata.data[getIndex(x,y+1)] = imdata.data[getIndex(x,y+1)] + err * 5 / 16;
                    imdata.data[getIndex(x+1,y+1)] = imdata.data[getIndex(x+1,y+1)] = imdata.data[getIndex(x+1,y+1)] = imdata.data[getIndex(x+1,y+1)] + err * 1 / 16;
                }
            }
        }
        for(let y2=0; y2 < imdata.height; y2++){
            bw(imdata.width-1,y2)
        }
        for(let x2=0; x2 < imdata.width; x2++){
            bw(x2,imdata.height-1);
        }

        ctx.putImageData(imdata,0,0);
    }

    return(
        <React.Fragment>
            
            <div className="upload" ref={innerRef} {...draggableProps} {...dragHandleProps}>
                {openOption &&
                <div className="imageoptions">
                    <div className="slider">
                        <label>threshold</label>
                        <input type="range" step="5" min="1" max="254" value={threshold} onChange={(evt) => setThreshold(evt.target.value)} />
                    </div>
                    <div className="slider">
                        <label>dither</label>
                        <input type="range" step="0.1" min="0.0" max="1.0" value={dither} onChange={(evt) => setDither(evt.target.value)} />
                    </div>
                </div> }
                <div className="canvas" >
                    <div className="overlayButtons">
                        <label className="toggleButton" style={{opacity: openOption ? 1 : null, transform: openOption ? "scale(1)" : null}}>
                            <input type="checkbox" onChange={(evt) => setOpenOption(evt.target.checked)} />
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 20C6.17526 20.0009 4.58119 18.7668 4.125 17H2V15H4.126C4.64564 12.9875 6.62012 11.7083 8.66928 12.0566C10.7184 12.4049 12.1594 14.2646 11.9849 16.3358C11.8103 18.4071 10.0786 19.9995 8 20ZM8 14C6.9074 14.0011 6.01789 14.8789 6.00223 15.9713C5.98658 17.0638 6.85057 17.9667 7.94269 17.9991C9.03481 18.0315 9.95083 17.1815 10 16.09V16.49V16C10 14.8954 9.10457 14 8 14ZM22 17H13V15H22V17ZM13 12C11.1756 12.0005 9.58209 10.7664 9.126 9H2V7H9.126C9.64564 4.98745 11.6201 3.70825 13.6693 4.05657C15.7184 4.40488 17.1594 6.26462 16.9849 8.33584C16.8103 10.4071 15.0786 11.9995 13 12ZM13 6C11.9074 6.00111 11.0179 6.87885 11.0022 7.97134C10.9866 9.06384 11.8506 9.96671 12.9427 9.99912C14.0348 10.0315 14.9508 9.1815 15 8.09V8.49001V8C15 6.89544 14.1046 6 13 6ZM22 9H18V7H22V9Z"/>
                            </svg>
                        </label>
                        <button className="iconButton" onClick={() => deleteSelf()}>
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17 22H7C5.89543 22 5 21.1046 5 20V7H3V5H7V4C7 2.89543 7.89543 2 9 2H15C16.1046 2 17 2.89543 17 4V5H21V7H19V20C19 21.1046 18.1046 22 17 22ZM7 7V20H17V7H7ZM9 4V5H15V4H9ZM15 18H13V9H15V18ZM11 18H9V9H11V18Z"/>
                            </svg>
                        </button>
                    </div>
                    <canvas ref={canvasRef} width={500} style={{width:"100%", display:"block"}} />
                </div>
                
            </div>
            
        </React.Fragment>
        
    )
}

export default ImageCanvas;