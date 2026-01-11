export async function generateGeminiContent({ apiKey, apiVersion, model, parts }) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts,
          },
        ],
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Gemini generateContent failed (${apiVersion}): ${res.status} ${res.statusText} ${text}`.trim()
    );
  }

  return await res.json();
}

export function getGeminiResponseText(responseJson) {
  return (
    responseJson?.candidates?.[0]?.content?.parts
      ?.map((p) => p?.text)
      .filter(Boolean)
      .join("\n") ||
    ""
  );
}

export function stripCodeFences(text) {
  return String(text).replace(/```(?:json)?\n?/gi, "").replace(/```/g, "").trim();
}

export function extractJsonObject(text) {
  const cleanedText = stripCodeFences(text);
  const start = cleanedText.indexOf("{");
  const end = cleanedText.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return cleanedText.slice(start, end + 1);
  }
  return cleanedText;
}
