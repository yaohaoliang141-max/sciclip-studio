import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { url, filename } = await req.json();

    if (!url) {
      return NextResponse.json({ error: '请提供下载链接' }, { status: 400 });
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error('视频获取失败');

    const buffer = await response.arrayBuffer();
    const headers = new Headers();
    headers.set('Content-Type', 'video/mp4');
    headers.set('Content-Disposition', `attachment; filename="${filename || 'video.mp4'}"`);
    headers.set('Content-Length', buffer.byteLength.toString());

    return new NextResponse(buffer, { headers });
  } catch (error: any) {
    console.error('Download Error:', error);
    return NextResponse.json({ error: error.message || '下载失败' }, { status: 500 });
  }
}
