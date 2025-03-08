import puppeteer from 'puppeteer-core';
import fs from 'fs';

export async function ReelsUpload(videoPath, caption, cookiesJson) {
  const browser = await puppeteer.launch({
    executablePath: '/data/data/com.termux/files/usr/bin/chromium-browser',  // Sesuaikan path Chromium di Termux
    headless: true,  // Ubah ke true jika tidak ingin membuka browser
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox'
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-software-rasterizer',
    ]
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, seperti Gecko) Chrome/115.0.0.0 Safari/537.36'
  await page.setViewport({ width: 1366, height: 768 });
  // Set cookies
  const cookies = JSON.parse(cookiesJson);
  await page.setCookie(...cookies);

  console.log('Mengakses Facebook...');
  await page.goto('https://www.facebook.com/', { waitUntil: 'networkidle2' });

  const htmlContent = await page.evaluate(() => document.body.innerHTML);
  console.log(htmlContent);
  page.waitForTimeout(5000); // Tambahkan delay sebelum

  await page.screenshot({ path: '/sdcard/check_login.png' }); // Cek apakah berhasil login

  console.log('Navigasi ke halaman upload Reels...');
  await page.goto('https://www.facebook.com/reel/create', { waitUntil: 'networkidle2' });

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
