import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Card, CardMedia, Typography, CardContent } from '@mui/material';

const HistoryPage = () => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/qrcodes/');
                setHistory(response.data.history);
            } catch (error) {
                console.error(error);
            }
        };

        fetchHistory();
    }, []);

    return (
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h4" gutterBottom>
                History of Generated QR Codes
            </Typography>
            {history.map((item, index) => (
                <Card key={index} sx={{ mb: 2, maxWidth: 345 }}>
                    <CardMedia
                        component="img"
                        height="140"
                        image={item.qrCodeURL}
                        alt={`QR Code ${index + 1}`}
                    />
                    <CardContent>
                        <Typography variant="body2" color="text.secondary">
                            Data: {item.data}
                        </Typography>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
};

export default HistoryPage;