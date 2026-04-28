import { NextRequest, NextResponse } from 'next/server';
import { PexelsVideo } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get('keyword');
    const page = searchParams.get('page') || '1';

    if (!keyword) {
      return NextResponse.json({ error: '请提供搜索关键词' }, { status: 400 });
    }

    const response = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(keyword)}&per_page=6&page=${page}&orientation=landscape`,
      {
        headers: {
          Authorization: process.env.PEXELS_API_KEY!,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API 错误: ${response.statusText}`);
    }

    const data = await response.json();
    const videos: PexelsVideo[] = data.videos || [];

    return NextResponse.json({ videos, total_results: data.total_results });
  } catch (error: any) {
    console.error('Search Error:', error);
    return NextResponse.json({ error: error.message || '搜索失败' }, { status: 500 });
  }
}
