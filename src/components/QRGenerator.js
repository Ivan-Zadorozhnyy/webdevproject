import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, TextField, Button, CircularProgress, Alert, Card, CardMedia } from '@mui/material';

const QRGenerator = () => {
    const [inputData, setInputData] = useState('');
    const [qrCodeURL, setQrCodeURL] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [wsMessages, setWsMessages] = useState([]); // State to store WebSocket messages

    useEffect(() => {
        // Replace 'ws://localhost:8000/ws/notifications/' with your WebSocket connection URL
        const ws = new WebSocket('ws://localhost:8000/ws/notifications/');

        ws.onopen = () => {
            console.log('WebSocket Connected');
        };

        ws.onmessage = (e) => {
            const message = JSON.parse(e.data);
            console.log('Message from WebSocket:', message);
            // Here, we're updating state with received message. Adjust based on your needs.
            setWsMessages(prevMessages => [...prevMessages, message.message]);
        };

        ws.onclose = () => {
            console.log('WebSocket Disconnected');
        };

        return () => {
            ws.close();
        };
    }, []); // Empty dependency array means this effect runs once on mount.

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:8000/api/qrcodes/', { data: inputData });
            setQrCodeURL(response.data.qrCodeURL);
        } catch (error) {
            console.error('Failed to generate QR Code:', error);
            setError('Failed to generate QR Code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 360 }}>
                <TextField
                    label="Input Data"
                    variant="outlined"
                    fullWidth
                    value={inputData}
                    onChange={(e) => setInputData(e.target.value)}
                    margin="normal"
                />
                <Button type="submit" variant="contained" color="primary" disabled={loading} sx={{ mt: 2 }}>
                    Generate QR Code
                </Button>
            </form>
            {loading && <CircularProgress />}
            {error && <Alert severity="error">{error}</Alert>}
            {qrCodeURL && (
                <Card sx={{ mt: 2, maxWidth: 345 }}>
                    <CardMedia
                        component="img"
                        image={qrCodeURL}
                        alt="Generated QR Code"
                    />
                </Card>
            )}
            {/* Display WebSocket messages for demonstration. Adjust as needed. */}
            {wsMessages.map((msg, index) => (
                <Alert key={index} severity="info">{msg}</Alert>
            ))}
        </Box>
    );
};

export default QRGenerator;
