
import {NextResponse} from "next/server";
import {readdir} from "fs/promises";
import {join} from "path";

export async function GET() {
    const publicDirectory = join(process.cwd(), 'public');
    const files = await readdir(publicDirectory);
    const imageFiles = files.filter(file => {
        const lowerCaseFile = file.toLowerCase();
        return lowerCaseFile.endsWith('.png') ||
               lowerCaseFile.endsWith('.jpg') ||
               lowerCaseFile.endsWith('.jpeg') ||
               lowerCaseFile.endsWith('.gif') ||
               lowerCaseFile.endsWith('.svg');
    });
    const imageUrls = imageFiles.map(file => `/${file}`);
    return NextResponse.json(imageUrls);
}
