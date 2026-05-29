import fs from 'fs';
import axios from 'axios';

async function takeScreenshot() {
    try {
        const response = await axios.post('http://127.0.0.1:10086/command', {
            action: 'screenshot',
            args: { format: 'png', quality: 100 },
            session: 'elenx-final'
        });
        if (response.data && response.data.data) {
            const base64Data = response.data.data.data;
            fs.writeFileSync('screenshot.png', Buffer.from(base64Data, 'base64'));
            console.log('Screenshot saved to screenshot.png');
        } else {
            console.log('Failed to get screenshot data');
        }
    } catch (e) {
        console.error('Error taking screenshot:', e.message);
    }
}

takeScreenshot();