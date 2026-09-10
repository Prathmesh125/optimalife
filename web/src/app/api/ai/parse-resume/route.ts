import { NextResponse } from "next/server";
import mammoth from "mammoth";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const resumeFile = formData.get("resume") as File;
    const formSchemaStr = formData.get("schema") as string;

    if (!resumeFile || !formSchemaStr) {
      return NextResponse.json({ error: "Missing resume or schema" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API Key is not configured" }, { status: 500 });
    }

    // Extract text from the file buffer based on type
    const buffer = Buffer.from(await resumeFile.arrayBuffer());
    let extractedText = "";
    
    const fileName = resumeFile.name.toLowerCase();
    
    if (fileName.endsWith('.pdf') || resumeFile.type === 'application/pdf') {
      const PDFParser = require("pdf2json");
      
      extractedText = await new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, 1);
        
        pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", () => {
          resolve(pdfParser.getRawTextContent());
        });
        
        pdfParser.parseBuffer(buffer);
      });
    } else if (fileName.endsWith('.docx') || resumeFile.type.includes('wordprocessingml')) {
      const docxData = await mammoth.extractRawText({ buffer });
      extractedText = docxData.value;
    } else {
      // Fallback for simple txt or other types
      extractedText = buffer.toString('utf-8');
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json({ error: "Could not extract text from the file. Please try a different format." }, { status: 400 });
    }

    const systemInstruction = `You are a highly accurate Resume Parsing AI. 
The user is providing the plain text extracted from a resume and a JSON schema describing the form fields required for a job application.
Your task is to extract information from the resume and fill out the fields described in the schema.
You MUST output ONLY a valid raw JSON object (no markdown formatting, no \`\`\`json blocks) where keys are the field IDs/names from the schema, and values are the extracted data.
If a field's information cannot be found in the resume, leave its value as an empty string ("").
For dropdowns/select fields, try to match the closest option if options are provided.`;

    const prompt = `Extract data for the following schema: ${formSchemaStr}\n\nRESUME TEXT:\n${extractedText.substring(0, 25000)}`;

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
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1, // low temperature for precise extraction
        }
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Gemini Parse Error:", data);
      throw new Error(data.error?.message || "Failed to parse resume");
    }

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error("No text generated");
    }

    // Clean up potential markdown blocks if the model ignores the instruction
    let cleanJson = generatedText.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/```json/g, '').replace(/```/g, '').trim();
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/```/g, '').trim();
    }

    const parsedData = JSON.parse(cleanJson);
    return NextResponse.json({ success: true, data: parsedData });
    
  } catch (error: any) {
    console.error("Parse Resume Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
