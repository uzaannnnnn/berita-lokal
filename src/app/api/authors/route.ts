import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "../../../../utils/lib/mongoose";
import NewsModel from "../../../../utils/model/News";
import UserModel from "../../../../utils/model/User";
import { News } from "../../../../types/News";
import { formatForUrl } from "../../../../utils/format/url.format";

export const dynamic = "force-dynamic";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: NextRequest) {
  try {
    await connectToDB();
    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id");
    const title = searchParams.get("title");
    const authorNewsLimit = parseInt(
      searchParams.get("authorNewsLimit") || "5"
    );

    if (!id && !title) {
      return NextResponse.json(
        { message: "Either 'id' or 'title' is required" },
        { status: 400 }
      );
    }

    if (id) {
      const user = await UserModel.findOne(
        { _id: id },
        {
          _id: 1,
          name: 1,
          email: 1,
          image: 1,
          role: 1,
        }
      ).lean();
      if (!user) {
        return NextResponse.json(
          { message: "Users not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ user }, { status: 200 });
    }

    const normalizedTitle = decodeURIComponent(title || "").trim().toLowerCase();
    const seoCandidate = formatForUrl(normalizedTitle.replace(/-/g, " "));
    const keywordRegex = normalizedTitle
      .split("-")
      .filter(Boolean)
      .map((word) => escapeRegex(word))
      .join(".*");

    let news = (await NewsModel.findOne(
      { title_seo: normalizedTitle },
      {
        _id: 1,
        title: 1,
        content: 1,
        category: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        title_seo: 1,
        author: 1,
        image: 1,
        url: 1,
      }
    ).lean()) as News | null;

    if (!news) {
      news = (await NewsModel.findOne(
        { title_seo: seoCandidate },
        {
          _id: 1,
          title: 1,
          content: 1,
          category: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          title_seo: 1,
          author: 1,
          image: 1,
          url: 1,
        }
      ).lean()) as News | null;
    }

    if (!news && keywordRegex) {
      news = (await NewsModel.findOne(
        { title: { $regex: new RegExp(keywordRegex, "i") } },
        {
          _id: 1,
          title: 1,
          content: 1,
          category: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          title_seo: 1,
          author: 1,
          image: 1,
          url: 1,
        }
      ).lean()) as News | null;
    }

    if (!news) {
      return NextResponse.json({ message: "News not found" }, { status: 404 });
    }

    const authorDoc = await UserModel.findById(news.author, {
      _id: 1,
      name: 1,
      email: 1,
      image: 1,
      role: 1,
    }).lean();

    const author =
      authorDoc ||
      ({
        _id: news.author,
        name: "KabarLokal",
        email: "",
        image: "user.png",
        role: "provider",
      } as const);

    const moreNews = await NewsModel.find(
      { author: news.author, _id: { $ne: news._id } },
      {
        _id: 1,
        title: 1,
        category: 1,
        createdAt: 1,
        updatedAt: 1,
        image: 1,
      }
    )
      .sort({ createdAt: -1 })
      .limit(authorNewsLimit)
      .lean();

    return NextResponse.json(
      { newsDetail: news, author, moreNewsByAuthor: moreNews },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching news with author:", error);
    return NextResponse.json(
      { error: "Error fetching news with author" },
      { status: 500 }
    );
  }
}
