import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
dotenv.config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY || '';
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // We'll fetch models directly via standard fetch since the SDK might not expose ListModels cleanly
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.models) {
        console.log("Available Models:");
        data.models.forEach((m: any) => console.log(m.name));
    } else {
        console.log("Error listing models:", data);
    }
}

listModels();