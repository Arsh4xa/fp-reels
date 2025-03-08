import { ReelsUpload } from './browserHandler.js';
import fs from 'fs';

const args = process.argv.slice(2);
if (args.length < 3) {
  console.log('Usage: node upload.js <cookieFile> <videoPath> <caption>');
  process.exit(1);
}

const [cookieFile, videoPath, caption] = args;

if (!fs.existsSync(cookieFile) || !fs.existsSync(videoPath)) {
  console.log('Cookie file atau video tidak ditemukan.');
  process.exit(1);
}

(async () => {
  try {
    const cookies = fs.readFileSync(cookieFile, 'utf8');
    await ReelsUpload(videoPath, caption, cookies);
    console.log(`Video berhasil diunggah: ${videoPath}`);
  } catch (error) {
    console.error(`Gagal mengunggah video: ${error.message}`);
  }
})();
