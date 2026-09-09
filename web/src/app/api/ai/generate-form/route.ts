import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { title, description } = await req.json();

    if (!title || !description) {
      return NextResponse.json({ error: "Job title and description are required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API Key is not configured" }, { status: 500 });
    }

    const systemInstruction = `You are an expert HR application form designer. 
Given a job title and description, design a custom application form tailored exactly to the needs of that specific job.
Always include standard fields (First Name, Last Name, Email, Phone, Resume) but also generate 3 to 6 highly specific custom questions or fields based on the job responsibilities and requirements (e.g., specific portfolio links, technical skill assessments, specific certifications).

You MUST output ONLY a raw, valid JSON array of field objects (no markdown, no quotes around the array). 
Each object must have:
- "id": a unique string (e.g. "portfolio_url")
- "label": a human-readable label (e.g. "Portfolio URL")
- "type": must be one of ["text", "textarea", "email", "number", "tel", "date", "select", "checkbox", "education", "experience"]
- "required": boolean true/false
- "options": (optional) string, comma-separated if type is "select" (e.g. "Yes, No, Maybe")

Ensure the output is strictly parseable by JSON.parse().`;

    const prompt = `Job Title: ${title}\nJob Description: ${description}`;

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
          temperature: 0.7, // Some creativity for questions
        }
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Gemini API Error:", data);
      throw new Error(data.error?.message || "Failed to generate form");
    }

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error("No text generated");
    }

    let cleanJson = generatedText.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/```json/g, '').replace(/```/g, '').trim();
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/```/g, '').trim();
    }

    const parsedData = JSON.parse(cleanJson);
    return NextResponse.json({ success: true, fields: parsedData });
    
  } catch (error: any) {
    console.error("AI Generate Form Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
