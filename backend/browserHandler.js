import puppeteer from 'puppeteer-core';
import fs from 'fs';

//kumpulan selector
const uploadButtonSelector = `/html/body/div[1]/div/div[1]/div/div[3]/div/div/div[1]/form/div/div/div[1]/div/div[2]/div[1]/div[2]/div/div/div[1]/div/div/div/div/div/div[1]`
const nextButtonSelector = `//*[starts-with(@id, "mount")]/div/div[1]/div/div[3]/div/div/div[1]/form/div/div/div[1]/div/div[3]/div[2]/div/div/div`
const nextButtonSelector2 = `//*[starts-with(@id, "mount")]/div/div[1]/div/div[3]/div/div/div[1]/form/div/div/div[1]/div/div[3]/div[2]/div[2]/div[1]/div`
const nextButtonSelector3 = `/html/body/div[1]/div/div[1]/div/div[3]/div/div/div[1]/form/div/div/div[1]/div/div[3]/div[2]/div[2]/div[1]`
const textAreaSelector = `//*[starts-with(@id, "mount")]/div/div[1]/div/div[3]/div/div/div[1]/form/div/div/div[1]/div/div[2]/div[1]/div[2]/div/div/div/div/div[1]/div[1]/div[1]`
const publishButtonSelector = `/html/body/div[1]/div/div[1]/div/div[3]/div/div/div[1]/form/div/div/div[1]/div/div[3]/div[2]/div[2]/div[1]/div/div[1]/div`
const ended = `/html/body/div[1]/div/div[1]/div/div[5]/div/div/div[3]/div[2]/div/div/div[1]/div/div/div/div/div[2]/div[1]/div/div/div[2]/div[2]`
const s90detector = `/html/body/div[1]/div/div[1]/div/div[3]/div/div/div[1]/form/div/div/div[1]/div/div[3]/div[1]/div[1]/div/div/div/div[2]/div/div/div/div/span/span`
const cutvideoSelector = `/html/body/div[1]/div/div[1]/div/div[3]/div/div/div[1]/form/div/div/div[1]/div/div[2]/div[1]/div[2]/div/div/div/div/div/div/div[1]/div/div`
//fungsi cek sesi valid
function checkSession() {
  return new Promise(async (resolve, reject) => {
    try {
      const fullPath = path.resolve("./cookies.json");
      const cookies = JSON.parse(await fs.readFile(fullPath))
      if (cookies.length !== 0) {
        resolve(true)
      } else {
        resolve(false)
      }
    } catch (err) {
      resolve(false)
    }
  })
}


export async function ReelsUpload(videoPath, caption, cookiesJson) {
  const browser = await puppeteer.launch({
    executablePath: '/data/data/com.termux/files/usr/bin/chromium-browser',  // Sesuaikan path Chromium di Termux
    headless: true,  // Ubah ke true jika tidak ingin membuka browser
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox'
    ]
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, seperti Gecko) Chrome/115.0.0.0 Safari/537.36');
  await page.setViewport({ width: 1366, height: 768 });
  // Set cookies
  const cookies = JSON.parse(cookiesJson);
  await page.setCookie(...cookies);

  console.log('Mengakses Facebook...');
  await page.goto('https://www.facebook.com/', { waitUntil: 'networkidle2' });

  //const htmlContent = await page.evaluate(() => document.body.innerHTML);
  //console.log(htmlContent);
  //page.waitForTimeout(5000); // Tambahkan delay sebelum

  //await page.screenshot({ path: '/sdcard/check_login.png' }); // Cek apakah berhasil login

  console.log('Navigasi ke halaman upload Reels...');
  await page.goto('https://www.facebook.com/reel/create', { waitUntil: 'networkidle2' });

  // Tunggu dan unggah file video
  //const inputUploadHandle = await page.waitForSelector('input[type="file"]');
  //await inputUploadHandle.uploadFile(videoPath);
  //console.log('Video diunggah...');
  const uploadElement = await page.$x(uploadButtonSelector);
  const [filechooser] = await Promise.all([
  page.waitForFileChooser(),
  await uploadElement[0].click()
  ])
  await delay(2000)
  const cek90s = await page.$x(s90detector)
  if (cek90s.length > 0) {
    printLog("Durasi video tidak boleh lebih dari 90 detik.", "red")
    const cutthevideos = await page.$x(cutvideoSelector);
    await cutthevideos[0].click()
    await browser.close()
    return resolve({
      status: "error",
      message: "Video Gagal di publish!"
    })
  } else {
    printLog("Video lebih dari 90 detik tidak terdeteksi", "green")
  }
  const nextElement2 = await page.$x(nextButtonSelector2);
  await nextElement2[0].click()
  await delay(2000)
  const usernameElement = await page.$x(textAreaSelector);
  await usernameElement[0].click();
  await usernameElement[0].type(`${caption}`);
  printLog("Menginput Caption...")
  await delay(2000)
  let cekenablepublishButton;
  do {
    const [element] = await page.$x(nextButtonSelector3)
    if (element) {
      cekenablepublishButton = await page.evaluate(el => el.getAttribute('aria-disabled'), element);
      // console.log(cekenablepublishButton)
    }
  }
  while (cekenablepublishButton)
  if (!cekenablepublishButton) {
    const PostButton = await page.$x(nextButtonSelector3);
    await PostButton[0].click()
    printLog("Post ke Reels", 'yellow')
    await page.waitForXPath(ended, {timeout: 100000})
    await browser.close()
    printLog("Berhasil")
    return resolve({
      status: "success",
      message: "Video Berhasil di publish!"
    })
  }
}
