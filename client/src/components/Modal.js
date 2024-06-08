import React from 'react'
import '../components/modal.css'

const Modal = ({ winner, onRestart }) => {
    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>Congratulations!</h2>
                <p>Player {winner} wins the game!</p>
                <button onClick={onRestart}>Play Again</button>
            </div>
        </div>
    )
}

export default Modal
