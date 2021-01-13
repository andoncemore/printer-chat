
import './Modal.css';

const Modal = ({children, title, closeModal}) => {
    return(
        <div className="modal">
            <div className="modalContents">
                <div className="modalTitle">
                    <h2>{title}</h2>
                    <button className="iconButton" onMouseDown={() => closeModal()}>
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.9963 24C8.81382 24.0029 5.76084 22.7399 3.51048 20.4895C1.26011 18.2392 -0.00285839 15.1862 4.85777e-06 12.0037V11.7638C0.0981202 6.9559 3.05642 2.67075 7.51732 0.874786C11.9782 -0.921174 17.0804 0.118819 20.4825 3.5175C23.9164 6.94854 24.9441 12.1109 23.0861 16.5954C21.2281 21.08 16.8505 24.0028 11.9963 24ZM11.9963 13.6952L15.1034 16.8022L16.7948 15.1107L13.6878 12.0037L16.7948 8.89664L15.1034 7.20516L11.9963 10.3122L8.88927 7.20516L7.19779 8.89664L10.3048 12.0037L7.19779 15.1107L8.88927 16.8022L11.9963 13.6964V13.6952Z"/>
                        </svg>
                    </button>
                </div>
                {children}
            </div>
        </div>
    )
}

export default Modal;