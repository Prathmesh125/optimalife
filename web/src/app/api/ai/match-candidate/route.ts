import { NextResponse } from "next/server";
import { aiRateLimiter } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (aiRateLimiter.isRateLimited(ip)) {
      return NextResponse.json({ error: "Rate limit exceeded. Please wait a minute before trying again." }, { status: 429 });
    }

    const { jobTitle, jobDescription, requiredSkills, resumeText } = await req.json();

    if (!jobTitle || !resumeText) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API Key is not configured" }, { status: 500 });
    }

    const skillsList = Array.isArray(requiredSkills) && requiredSkills.length > 0
      ? requiredSkills.join(", ")
      : "Not specified";

    const systemInstruction = `You are an expert HR talent evaluator. You will compare a candidate's resume against a job description and list of required skills. 
Provide a match score from 0 to 100 and a concise one-line reason (max 15 words).
You MUST respond with ONLY a raw JSON object in this exact format, no markdown:
{"score": 85, "reason": "Strong Flutter/Firebase background, lacks required 2 years minimum experience."}`;

    const prompt = `JOB TITLE: ${jobTitle}
REQUIRED SKILLS: ${skillsList}
JOB DESCRIPTION: ${(jobDescription || "").substring(0, 1000)}

CANDIDATE RESUME TEXT:
${resumeText.substring(0, 3000)}`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 150,
        }
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Gemini error");

    let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    // Clean up any accidental markdown
    rawText = rawText.replace(/```json|```/g, "").trim();

    const parsed = JSON.parse(rawText);
    return NextResponse.json({ success: true, score: parsed.score ?? 0, reason: parsed.reason ?? "" });

  } catch (error: any) {
    console.error("Match Candidate Error:", error);
    // Return a neutral score on error so the UI doesn't break
    return NextResponse.json({ success: false, score: 0, reason: "Could not compute match score." }, { status: 200 });
  }
}
