import { NextRequest, NextResponse } from "next/server";
import { getFirestore, serverTimestamp } from "@/lib/firebaseAdmin";

type ShareRequestBody = {
  content?: string;
};

function getBaseUrl(req: NextRequest): string {
  const origin = req.headers.get("origin");
  if (origin) return origin;

  const forwardedProto = req.headers.get("x-forwarded-proto");
  const host = req.headers.get("host");

  if (forwardedProto && host) {
    return `${forwardedProto}://${host}`;
  }

  if (host) {
    return `https://${host}`;
  }

  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) return envUrl;

  return "http://localhost:3000";
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ShareRequestBody;
    const rawContent = body.content ?? "";
    const content = rawContent.trim();

    if (!content) {
      return NextResponse.json(
        { error: "Note content is required." },
        { status: 400 }
      );
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { error: "Note is too long. Maximum is 5000 characters." },
        { status: 400 }
      );
    }

    const firestore = getFirestore();
    const docRef = await firestore.collection("notes").add({
      content,
      createdAt: serverTimestamp()
    });

    const baseUrl = getBaseUrl(req);
    const noteUrl = `${baseUrl}/n/${docRef.id}`;

    return NextResponse.json(
      {
        id: docRef.id,
        url: noteUrl
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sharing note:", error);
    return NextResponse.json(
      { error: "Unable to share note. Please try again." },
      { status: 500 }
    );
  }
}

