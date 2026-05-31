import { NextResponse } from "next/server";
import { getFallbackQuest } from "@/lib/bishkek-quests";
import {
  getMonthlyFallbackQuest,
  getSportFallbackQuest,
} from "@/lib/quest-templates";
import type { QuestCheckpoint, QuestType } from "@/lib/types";

interface GenerateBody {
  district?: string;
  questType?: QuestType;
  sport?: string;
  skill?: string;
}

function parseCheckpoints(
  raw: unknown,
  requiresLocation = true
): QuestCheckpoint[] | null {
  if (!Array.isArray(raw)) return null;
  const checkpoints: QuestCheckpoint[] = [];
  for (let i = 0; i < raw.length; i++) {
    const item = raw[i] as Record<string, unknown>;
    if (typeof item.title !== "string" || typeof item.description !== "string") {
      return null;
    }
    checkpoints.push({
      order: i,
      title: item.title,
      description: item.description,
      hint: typeof item.hint === "string" ? item.hint : item.description,
      lat: typeof item.lat === "number" ? item.lat : 42.8746,
      lng: typeof item.lng === "number" ? item.lng : 74.6034,
      radiusMeters:
        typeof item.radiusMeters === "number" ? item.radiusMeters : 120,
      requiresLocation:
        typeof item.requiresLocation === "boolean"
          ? item.requiresLocation
          : requiresLocation,
      weekLabel: typeof item.weekLabel === "string" ? item.weekLabel : undefined,
    });
  }
  return checkpoints.length >= 3 ? checkpoints : null;
}

async function generateWithGemini(
  body: GenerateBody
): Promise<{
  title: string;
  checkpoints: QuestCheckpoint[];
  emoji?: string;
  sport?: string;
  skill?: string;
  endsAt?: string;
} | null> {
  const apiKey = process.env.GEMINI_API_KEY?.replace(/^["']|["']$/g, "");
  if (!apiKey) return null;

  const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  const questType = body.questType ?? "city";
  const district = body.district?.trim() || "Центр";

  let prompt = "";

  if (questType === "sport") {
    const sport = body.sport ?? "football";
    prompt = `Сгенерируй СПОРТИВНЫЙ квест для друзей в Бишкеке, вид спорта: "${sport}".
4 точки — реальные спортплощадки/парки Бишкека с координатами.
Задания командные: матчи, тренировки, фото команды.
JSON:
{"title":"...","emoji":"⚽","sport":"название","checkpoints":[{"title":"...","description":"...","hint":"...","lat":42.87,"lng":74.60,"radiusMeters":120}]}`;
  } else if (questType === "monthly") {
    const skill = body.skill ?? "guitar";
    prompt = `Сгенерируй МЕСЯЧНЫЙ квест обучения навыку "${skill}" на 30 дней с друзьями.
4 недели — 4 этапа (weekLabel: "Неделя 1" и т.д.).
requiresLocation: false для всех точек (учатся дома/онлайн).
Задания: практика, фото прогресса, занятие с другом, финальный результат.
JSON:
{"title":"...","emoji":"🎸","skill":"название навыка","checkpoints":[{"weekLabel":"Неделя 1","title":"...","description":"...","hint":"...","lat":42.87,"lng":74.60,"radiusMeters":500,"requiresLocation":false}]}`;
  } else {
    prompt = `Сгенерируй городской квест по реальным местам Бишкека, район "${district}".
4 точки с координатами (lat ~42.82-42.90, lng ~74.55-74.70).
JSON:
{"title":"...","emoji":"🗺️","checkpoints":[{"title":"...","description":"...","hint":"...","lat":42.87,"lng":74.60,"radiusMeters":120}]}`;
  }

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
      emoji?: string;
      sport?: string;
      skill?: string;
      checkpoints?: unknown;
    };
    const requiresLocation = questType !== "monthly";
    const checkpoints = parseCheckpoints(parsed.checkpoints, requiresLocation);
    if (!checkpoints) return null;

    const endsAt =
      questType === "monthly"
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

    return {
      title: parsed.title ?? "Новый квест",
      checkpoints,
      emoji: parsed.emoji,
      sport: parsed.sport ?? body.sport,
      skill: parsed.skill ?? body.skill,
      endsAt,
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateBody;
    const questType = body.questType ?? "city";
    const district = body.district?.trim() || "Центр";

    const aiResult = await generateWithGemini(body);
    if (aiResult) {
      return NextResponse.json({ ...aiResult, questType, source: "gemini" });
    }

    if (questType === "sport") {
      const fallback = getSportFallbackQuest(body.sport ?? "football");
      return NextResponse.json({ ...fallback, questType, source: "fallback" });
    }
    if (questType === "monthly") {
      const fallback = getMonthlyFallbackQuest(body.skill ?? "guitar");
      return NextResponse.json({ ...fallback, questType, source: "fallback" });
    }

    const fallback = getFallbackQuest(district);
    return NextResponse.json({ ...fallback, questType: "city", source: "fallback" });
  } catch {
    const fallback = getFallbackQuest("Центр");
    return NextResponse.json({ ...fallback, questType: "city", source: "fallback" });
  }
}
