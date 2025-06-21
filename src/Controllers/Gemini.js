const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const handleGeminiRequest = async (req, res) => {
  const { message } = req.body;

  if (typeof message !== "string" || message.trim() === "") {
    return res
      .status(400)
      .json({ error: "Message must be a non-empty string." });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-001",
      contents: [
        {
          role: "user",
          parts: [{ text: message + " (trả lời bằng tiếng Việt)" }],
        },
      ],
    });

    // Lấy kết quả từ phần nội dung đầu tiên của candidate
    const text = response.candidates[0]?.content?.parts?.[0]?.text;

    console.log(text);

    if (!text) {
      return res
        .status(500)
        .json({ error: "No response content from Gemini." });
    }

    return res.status(200).json({ response: text });
  } catch (err) {
    console.error("Lỗi từ Gemini API:", err);
    return res.status(500).json({ error: "Lỗi xử lý từ AI." });
  }
};

module.exports = { handleGeminiRequest };
