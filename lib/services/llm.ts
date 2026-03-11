import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateSummary = async (data: any[]): Promise<string> => {
    try {
        const prompt = `
      You are an expert Sales Analyst. Your job is to concisely summarize the following sales data into a professional narrative for executive leadership.
      Highlight key metrics, top performing products, regional insights, and any noticeable trends or anomalies.
      Please format your response in clear HTML with headers, lists, and bold text for readability in an email, also give proper html only nothing else not no quotes unquotes '' or any kind of \`\` stuff.

      Data Sample (first 100 rows):
      ${JSON.stringify(data.slice(0, 100))}
    `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
        });

        return response.text || "No summary generated.";
    } catch (error) {
        console.error("LLM Error:", error);
        throw new Error("Failed to generate summary via Gemini API");
    }
};

export const generateAnalysisTags = async (data: any[]): Promise<string[]> => {
    try {
        const prompt = `
      Analyze this sales data and return ONLY a JSON array of 3-5 short, highly descriptive tags (max 15 characters each) that highlight anomalies or significant trends.
      Examples: "Revenue Spike", "Low Inventory", "Regional Dip", "Peak Performance", "Trend Shift".
      Return ONLY the JSON array, no formatting.

      Data: ${JSON.stringify(data.slice(0, 50))}
    `;

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
        });

        const text = response.text || "[]";
        try {
            return JSON.parse(text.replace(/```json|```/g, "").trim());
        } catch {
            return ["Data Insights", "Anomaly Check"];
        }
    } catch (error) {
        console.error("Tag Generation Error:", error);
        return ["Analysis Generated"];
    }
};

export const answerDataQuestion = async (data: any[], question: string, history: { role: string, content: string }[]): Promise<string> => {
    try {
        const chatHistory = history.map(h => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.content }]
        }));

        const chat = ai.chats.create({
            model: 'gemini-1.5-flash',
            history: chatHistory as any,
            config: {
                maxOutputTokens: 500,
            }
        });

        const systemContext = `You are "RabbitAI", a specialized sales data assistant. 
        You have access to the following sales data context to answer the user's question accurately.
        Be concise, professional, and data-driven. 
        Context Data Sample: ${JSON.stringify(data.slice(0, 100))}`;

        const result = await chat.sendMessage({ message: `${systemContext}\n\nUser Question: ${question}` });
        return result.text || "I'm sorry, I couldn't generate a response.";
    } catch (error) {
        console.error("Chat Error:", error);
        return "I'm sorry, I'm having trouble analyzing the data for your question right now.";
    }
};
