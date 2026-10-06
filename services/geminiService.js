import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

export const suggestExpenseCategory = async (description) => {
    try {
        // console.time("Gemini API");

        const interaction = await ai.interactions.create({
            model: "gemini-3.8-flash",
            input: `
                Select exactly one category from:
                food, transport, shopping, bills,
                entertainment, health, education, other.

                Expense:
                "${description}"

                Return only the category name.
            `
        });

        // console.timeEnd("Gemini API");

        return interaction.output_text.trim().toLowerCase();

    } catch (error) {
        console.timeEnd("Gemini API");
        console.error("Gemini Error:", error);
        throw error;
    }
};

