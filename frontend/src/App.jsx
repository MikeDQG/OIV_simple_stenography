import { useState } from 'react';
import './App.css';

const UploadIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M19 13a1 1 0 0 0-1 1v.38l-1.48-1.48a2.79 2.79 0 0 0-3.93 0l-.7.7-2.48-2.48a2.85 2.85 0 0 0-3.93 0L4 12.6V7a1 1 0 0 1 1-1h7a1 1 0 0 0 0-2H5a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-5a1 1 0 0 0-1-1zM5 20a1 1 0 0 1-1-1v-3.57l2.9-2.9a.79.79 0 0 1 1.09 0l3.17 3.17 4.3 4.3zm13-1a.89.89 0 0 1-.18.53L13.31 15l.7-.7a.77.77 0 0 1 1.1 0L18 17.22zm4.71-14.71l-3-3a1 1 0 0 0-.33-.21 1 1 0 0 0-.76 0 1 1 0 0 0-.33.21l-3 3a1 1 0 0 0 1.42 1.42L18 4.41V10a1 1 0 0 0 2 0V4.41l1.29 1.3a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42z"/>
  </svg>
);

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M21 14a1 1 0 0 0-1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4a1 1 0 0 0-2 0v4a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-4a1 1 0 0 0-1-1zm-9.71 1.71a1 1 0 0 0 .33.21.94.94 0 0 0 .76 0 1 1 0 0 0 .33-.21l4-4a1 1 0 0 0-1.42-1.42L13 12.59V3a1 1 0 0 0-2 0v9.59l-2.29-2.3a1 1 0 1 0-1.42 1.42z"/>
  </svg>
);

function App() {
    const [coverImage, setCoverImage] = useState(null);
    const [coverPreview, setCoverPreview] = useState('');
    const [message, setMessage] = useState('');
    const [stegoImage, setStegoImage] = useState(null);
    const [downloadUrl, setDownloadUrl] = useState('');
    const [decodedMessage, setDecodedMessage] = useState('');
    const [isEncoding, setIsEncoding] = useState(false);
    const [isDecoding, setIsDecoding] = useState(false);

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverImage(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleStegoChange = (e) => {
        const file = e.target.files[0];
        setStegoImage(file);
    };

    const handleEncode = async () => {
        if (!coverImage || !message) return;
        
        setIsEncoding(true);
        try {
            const formData = new FormData();
            formData.append('image', coverImage);
            formData.append('message', message);

            const res = await fetch('http://localhost:8000/encode', {
                method: 'POST',
                body: formData,
            });

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);
        } catch (error) {
            console.error('Encoding error:', error);
        } finally {
            setIsEncoding(false);
        }
    };

    const handleDecode = async () => {
        if (!stegoImage) return;
        
        setIsDecoding(true);
        try {
            const formData = new FormData();
            formData.append('image', stegoImage);

            const res = await fetch('http://localhost:8000/decode', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            setDecodedMessage(data.message || "No message found");
        } catch (error) {
            console.error('Decoding error:', error);
            setDecodedMessage("Error decoding message");
        } finally {
            setIsDecoding(false);
        }
    };

    return (
        <div className="app">
            <h1>Image Steganography Tool</h1>

            <div className="section">
                <h2>Encode Secret Message</h2>
                <div className="file-upload-wrapper">
                    <label className="file-upload-label">
                        <UploadIcon />
                        {coverImage ? coverImage.name : "Choose Cover Image"}
                        <input type="file" accept="image/*" onChange={handleCoverChange} />
                    </label>
                </div>
                
                {coverPreview && (
                    <img src={coverPreview} className="image-preview" alt="Cover Preview" />
                )}

                <textarea
                    placeholder="Enter your secret message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />

                <button 
                    className={`button ${isEncoding ? 'button--accent' : ''}`}
                    onClick={handleEncode}
                    disabled={isEncoding || !coverImage || !message}
                >
                    {isEncoding ? 'Encoding...' : 'Encode Message'}
                </button>

                {downloadUrl && (
                    <div className="result-container">
                        <h3>Encoded Image Ready</h3>
                        <a href={downloadUrl} className="download-link" download="secret_image.png">
                            <DownloadIcon />
                            Download Secret Image
                        </a>
                    </div>
                )}
            </div>

            <div className="divider">or</div>

            <div className="section">
                <h2>Decode Hidden Message</h2>
                <div className="file-upload-wrapper">
                    <label className="file-upload-label">
                        <UploadIcon />
                        {stegoImage ? stegoImage.name : "Choose Stego Image"}
                        <input type="file" accept="image/*" onChange={handleStegoChange} />
                    </label>
                </div>

                <button 
                    className={`button ${isDecoding ? 'button--accent' : ''}`}
                    onClick={handleDecode}
                    disabled={isDecoding || !stegoImage}
                >
                    {isDecoding ? 'Decoding...' : 'Decode Message'}
                </button>

                {decodedMessage && (
                    <div className="result-container">
                        <h3>Hidden Message Found</h3>
                        <div className="hidden-message">
                            {decodedMessage}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;