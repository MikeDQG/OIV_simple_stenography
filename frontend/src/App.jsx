import { useState } from 'react';
import './App.css';

// const PORTS = ['8080', '8080'];
// const HOSTS = ['localhost', '127.0.0.1', '127.19.0.2'];

function App() {
    const [coverImage, setCoverImage] = useState(null);
    const [coverPreview, setCoverPreview] = useState('');
    const [message, setMessage] = useState('');
    const [stegoImage, setStegoImage] = useState(null);
    const [downloadUrl, setDownloadUrl] = useState('');
    const [decodedMessage, setDecodedMessage] = useState('');

    const [port, setPort] = useState('8000');
    const [host, setHost] = useState('localhost');


    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        setCoverImage(file);
        setCoverPreview(URL.createObjectURL(file));
    };

    const handleStegoChange = (e) => {
        const file = e.target.files[0];
        setStegoImage(file);
    };

    const handleEncode = async () => {
        const formData = new FormData();
        formData.append('image', coverImage);
        formData.append('message', message);
        const url_send = `http://${host}:${port}/encode`;

        const res = await fetch(url_send, {
            method: 'POST',
            body: formData,
        });

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
    };

    const handleDecode = async () => {
        const formData = new FormData();
        formData.append('image', stegoImage);
        const url = `http://${host}:${port}/decode`;

        const res = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        const data = await res.json();
        setDecodedMessage(data.message);
    };

    return (
        <div className="app">
            <h2>Image Steganography</h2>

            <h3>Encode a Message</h3>
            <input type="file" accept="image/*" onChange={handleCoverChange} />
            {coverPreview && <img src={coverPreview} height={200} alt="Cover Preview" />}
            <br />
            <textarea
                placeholder="Enter secret message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                cols={40}
            />
            <br />
            <button onClick={handleEncode}>Encode and Download</button>
            {downloadUrl && (
                <div>
                    <h4>Download Stego Image:</h4>
                    <a href={downloadUrl} download="stego_image.png">Click to Download</a>
                </div>
            )}

            <hr />

            <h3>Decode a Message</h3>
            <input type="file" accept="image/*" onChange={handleStegoChange} />
            <br />
            <button onClick={handleDecode}>Decode</button>
            {decodedMessage && (
                <div>
                    <h4>Hidden Message:</h4>
                    <p>{decodedMessage}</p>
                </div>
            )}
        </div>
    );
}

export default App;
