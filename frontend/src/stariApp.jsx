import { useState } from 'react';
import './App.css';

function StariApp() {
    const [cover, setCover] = useState('');
    const [message, setMessage] = useState('');
    const [encoded, setEncoded] = useState('');
    const [decoded, setDecoded] = useState('');

    const handleEncode = async () => {
        const res = await fetch('http://localhost:8000/encode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message }),
        });
        const data = await res.json();
        setEncoded(data.stego_text);
    };

    const handleDecode = async () => {
        const res = await fetch('http://localhost:8000/decode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: encoded }),
        });
        const data = await res.json();
        setDecoded(data.message);
    };

    return (
        <div className="app">
            <h2>Image Steganography</h2>

            <input
                type='image'
                placeholder="Cover text"
                value={cover}
                onChange={(e) => setCover(e.target.value)}
            />

            <input
                placeholder="Secret message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />

            <button onClick={handleEncode}>Encode</button>

            <textarea value={encoded} readOnly placeholder="Encoded Text" />

            <button onClick={handleDecode}>Decode</button>

            <p><strong>Decoded Message:</strong> {decoded}</p>
        </div>
    );
}

export default StariApp;
