import puppeteer from 'puppeteer';

export async function ReelsUpload(videoPath, caption, cookiesJson) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Set cookies
  const cookies = JSON.parse(cookiesJson);
  await page.setCookie(...cookies);

  console.log('Mengakses Facebook...');
  await page.goto('https://www.facebook.com/', { waitUntil: 'networkidle2' });

  console.log('Navigasi ke halaman upload Reels...');
  await page.goto('https://www.facebook.com/reel/', { waitUntil: 'networkidle2' });

  // Tunggu dan unggah file video
  const inputUploadHandle = await page.waitForSelector('input[type="file"]');
  await inputUploadHandle.uploadFile(videoPath);
  console.log('Video diunggah...');

  // Tambahkan caption
  await page.waitForTimeout(2000);
  const captionField = await page.waitForSelector('textarea[aria-label="Tulis keterangan"]');
  await captionField.type(caption);
  console.log('Caption ditambahkan...');

  // Klik tombol Upload
  const uploadButton = await page.waitForSelector('button[aria-label="Bagikan"]');
  await uploadButton.click();
  console.log('Mengunggah video...');

  await page.waitForTimeout(5000);
  console.log('Video berhasil diunggah!');

  await browser.close();
}
