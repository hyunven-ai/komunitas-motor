import { NextRequest, NextResponse } from "next/server";
import { fetchNewsArticlesList } from "@/features/cms/queries";
import {
  createNewsArticleAction,
  updateNewsArticleAction,
  updateNewsArticleStatusAction,
  deleteNewsArticleAction,
} from "@/features/cms/actions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const articles = await fetchNewsArticlesList("all");
    return NextResponse.json({
      success: true,
      data: articles,
    });
  } catch (err: unknown) {
    console.error("GET /api/admin/news error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Gagal memuat artikel berita.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await createNewsArticleAction(body);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (err: unknown) {
    console.error("POST /api/admin/news error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Gagal menyimpan artikel.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, articleId, id, status, ...articleData } = body;
    const targetId = articleId || id;

    if (!targetId) {
      return NextResponse.json(
        { success: false, message: "ID artikel wajib disertakan." },
        { status: 400 }
      );
    }

    if (action === "toggle_status") {
      const result = await updateNewsArticleStatusAction(targetId, status);
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    const updatePayload = {
      ...articleData,
      status: status || body.status || "published",
    };

    const result = await updateNewsArticleAction(targetId, updatePayload);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (err: unknown) {
    console.error("PUT /api/admin/news error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Gagal memperbarui artikel.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { articleId, id } = body;
    const target = id || articleId;

    if (!target) {
      return NextResponse.json(
        { success: false, message: "ID artikel wajib disertakan." },
        { status: 400 }
      );
    }

    const result = await deleteNewsArticleAction(target);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (err: unknown) {
    console.error("DELETE /api/admin/news error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Gagal menghapus artikel.",
      },
      { status: 500 }
    );
  }
}
