import { NextResponse } from "next/server";
import { getFallbackQuest } from "@/lib/bishkek-quests";
import type { QuestCheckpoint } from "@/lib/types";

interface GenerateBody {
  district?: string;
}

function parseCheckpoints(raw: unknown): QuestCheckpoint[] | null {
  if (!Array.isArray(raw)) return null;
  const checkpoints: QuestCheckpoint[] = [];
  for (let i = 0; i < raw.length; i++) {
    const item = raw[i] as Record<string, unknown>;
    if (
      typeof item.title !== "string" ||
      typeof item.description !== "string" ||
      typeof item.lat !== "number" ||
      typeof item.lng !== "number"
    ) {
      return null;
    }
    checkpoints.push({
      order: i,
      title: item.title,
      description: item.description,
      hint: typeof item.hint === "string" ? item.hint : item.description,
      lat: item.lat,
      lng: item.lng,
      radiusMeters:
        typeof item.radiusMeters === "number" ? item.radiusMeters : 120,
    });
  }
  return checkpoints.length >= 3 ? checkpoints : null;
}

async function generateWithGemini(
  district: string
): Promise<{ title: string; checkpoints: QuestCheckpoint[] } | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

  const prompt = `Сгенерируй городской квест по реальным местам Бишкека, район "${district}".
Верни ТОЛЬКО валидный JSON без markdown:
{
  "title": "название квеста на русском",
  "checkpoints": [
    {
      "title": "краткое название точки",
      "description": "задание для игрока",
      "hint": "подсказка где искать",
      "lat": 42.87,
      "lng": 74.60,
      "radiusMeters": 120
    }
  ]
}
Нужно 4 точки с реальными координатами внутри Бишкека (lat ~42.82-42.90, lng ~74.55-74.70).
Примеры: ЦУМ, Ош базар, площадь Ала-Тоо, парк Панфилова, Ala-Archa канал, мосты, парки.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) return null;

  try {
    const parsed = JSON.parse(content) as {
      title?: string;
      checkpoints?: unknown;
    };
    const checkpoints = parseCheckpoints(parsed.checkpoints);
    if (!checkpoints) return null;
    return {
      title: parsed.title ?? `Квест: ${district}`,
      checkpoints,
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateBody;
    const district = body.district?.trim() || "Центр";

    const aiResult = await generateWithGemini(district);
    if (aiResult) {
      return NextResponse.json({ ...aiResult, source: "gemini" });
    }

    const fallback = getFallbackQuest(district);
    return NextResponse.json({ ...fallback, source: "fallback" });
  } catch {
    const fallback = getFallbackQuest("Центр");
    return NextResponse.json({ ...fallback, source: "fallback" });
  }
}
