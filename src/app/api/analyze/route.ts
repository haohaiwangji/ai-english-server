import {NextResponse} from 'next/server';
import {analyzeImage} from '@/utils/dashscope';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const image = formData.get('image') as File;

        // 将图片转换为base64
        const buffer = await image.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');

        // 调用通义千问API
        const result = await analyzeImage(base64);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error processing image:', error);
        return NextResponse.json(
            {error: '图片处理失败'},
            {status: 500}
        );
    }
}
