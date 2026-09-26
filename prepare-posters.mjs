import { chromium } from '@playwright/test';
import sharp from 'sharp';

const browser = await chromium.launch({ channel: 'chromium' });
try {
  const page = await browser.newPage();
  for (const file of ['0aom6f', '7ueiyh', 'dw6o2w', 'rfxi9a']) {
    await page.goto(process.env.TEST_BASE_URL || 'http://localhost:3000');
    await page.evaluate(file => {
      const video = document.createElement('video');
      video.src = `videos/${file}.mp4`; video.preload = 'auto';
      document.body.replaceChildren(video);
    }, file);
    await page.waitForFunction(() => document.querySelector('video')?.readyState >= 2);
    const result = await page.evaluate(async () => {
      const video = document.querySelector('video');
      video.pause();
      video.currentTime = Math.min(0.1, video.duration / 2);
      await new Promise(resolve => video.addEventListener('seeked', resolve, { once: true }));
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      return { data: canvas.toDataURL('image/png').split(',')[1], width: video.videoWidth, height: video.videoHeight, duration: video.duration };
    });
    await sharp(Buffer.from(result.data, 'base64')).resize({ width: 720, withoutEnlargement: true }).webp({ quality: 82 }).toFile(`assets/${file}.webp`);
    console.log(file, result.width, result.height, result.duration);
  }
} finally { await browser.close(); }
