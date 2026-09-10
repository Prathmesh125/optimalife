import { NextResponse } from "next/server";
import { aiRateLimiter } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (aiRateLimiter.isRateLimited(ip)) {
      return NextResponse.json({ error: "Rate limit exceeded. Please wait a minute before trying again." }, { status: 429 });
    }

    const { prompt, type } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API Key is not configured" }, { status: 500 });
    }

    let systemInstruction = "";
    const variationSeed = Math.random().toString(36).substring(7);
    
    if (type === "title") {
      systemInstruction = `You are an expert SEO copywriter for Optima Life Sciences, an animal health and feed additive company. Rephrase the user's input into a catchy, highly professional, and SEO-friendly blog post title. IMPORTANT: Provide a completely unique and different variation. (Seed: ${variationSeed}). Output ONLY the title text, no quotes, no extra formatting.`;
    } else if (type === "content") {
      systemInstruction = `You are an expert content writer for Optima Life Sciences, an animal health and feed additive company. Expand the user's rough keywords, draft, or ideas into a fully fleshed-out, professional, well-written paragraph suitable for a corporate blog. Maintain a professional, educational, and engaging tone. IMPORTANT: Provide a completely unique and different variation. (Seed: ${variationSeed}). Output ONLY the paragraph text, no extra markdown formatting unless necessary for emphasis.`;
    } else if (type === "job_description") {
      systemInstruction = `You are an expert HR Manager for Optima Life Sciences. The user has provided a job title or a rough set of keywords. Expand this into a comprehensive, professional, and engaging Job Description. Include standard sections like "About the Role", "Key Responsibilities", and "Requirements". Use markdown formatting (headings, bullet points) strictly. Provide a unique variation. (Seed: ${variationSeed}). Output ONLY the markdown content.`;
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.9,
          topP: 0.95,
          maxOutputTokens: 800,
        }
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Gemini API Error:", data);
      throw new Error(data.error?.message || "Failed to generate content");
    }

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error("No text generated");
    }

    return NextResponse.json({ text: generatedText.trim() });
    
  } catch (error: any) {
    console.error("AI Route Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
