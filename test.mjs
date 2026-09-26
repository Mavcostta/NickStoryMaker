import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { pathToFileURL } from 'node:url';

const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';

test('Portfólio: layout responsivo, navegação, mídia e projetos', async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chromium' });
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    // Abrir index.html diretamente também deve carregar os scripts e os Reels.
    await page.goto(pathToFileURL(`${process.cwd()}/index.html`).href);
    assert.equal(await page.locator('.reel-project').count(), 4);
    assert.equal(await page.locator('.project-placeholder').count(), 0);
    assert.ok((await page.locator('[data-whatsapp]').first().getAttribute('href')).startsWith('https://wa.me/'));
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    for (const width of [1440, 360, 390, 430]) {
      await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
      await page.goto(baseUrl);
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.title(), 'Story Maker em Jataúba–PE | Nicolas Guilherme');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow em ${width}px`);
      assert.equal(await page.locator('.social-card').count(), 3);
      assert.equal(await page.locator('.social-card[href*="instagram.com"]').count(), 2);
      for (const card of await page.locator('.social-card').all()) {
        assert.ok(await card.isVisible());
        await card.focus();
        assert.equal(await card.evaluate(node => node === document.activeElement), true);
        assert.equal(await card.locator('.social-card-face').evaluate(node => node.scrollWidth <= node.clientWidth), true);
      }
      await page.locator('.social-cards').screenshot({ path: `test-results/social-${width}.png` });
      assert.equal(await page.locator('.project-placeholder').count(), 0);
      assert.equal(await page.locator('.reel-project').count(), 4);
      assert.equal(await page.locator('.reel-frame iframe').count(), 0);
      assert.equal(await page.locator('#projects video').count(), 0);
      assert.equal(await page.evaluate(() => performance.getEntriesByType('resource').filter(entry => entry.name.includes('.mp4')).length), 0);
      if (width < 700) {
        await page.getByRole('button', { name: 'Menu' }).click();
        assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
        await page.locator('#navigation').getByRole('link', { name: 'Trabalhos' }).click();
        assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
        assert.ok(page.url().endsWith('#trabalhos'));
      }
      for (const link of await page.locator('[data-whatsapp]').all()) {
        const url = new URL(await link.getAttribute('href'));
        assert.equal(url.pathname, '/5581982497649');
        assert.equal(url.searchParams.get('text'), 'Olá, Nicolas! Vi seu portfólio e gostaria de conversar sobre um projeto.');
      }
      await page.evaluate(async () => {
        for (const image of document.images) { image.loading = 'eager'; await image.decode(); }
        window.scrollTo(0, 0);
      });
      await page.screenshot({ path: `test-results/portfolio-${width}.png`, fullPage: true });
      if (width === 390 || width === 1440) await page.screenshot({ path: `test-results/hero-${width}.png` });
      if (width === 1440 || width === 390) {
        for (let index = 1; index <= 4; index++) {
          await page.getByRole('button', { name: `Reproduzir Reel 0${index}` }).click();
          await page.waitForFunction(index => {
            const video = document.querySelectorAll('#projects .reel-frame video')[index - 1];
            return video && video.currentTime > 0 && video.videoWidth === 720 && !video.paused;
          }, index);
          assert.equal(await page.locator('video').evaluateAll(videos => videos.filter(video => !video.paused).length), 1);
        }
        await page.locator('#projects').screenshot({ path: `test-results/videos-${width}.png` });
      }
    }
    assert.deepEqual(errors, []);
    const range = await fetch(baseUrl + '/videos/0aom6f.mp4', { headers: { Range: 'bytes=0-99' } });
    assert.equal(range.status, 206);
    assert.equal((await range.arrayBuffer()).byteLength, 100);
    assert.equal(range.headers.get('content-type'), 'video/mp4');
    const invalid = await fetch(baseUrl + '/videos/0aom6f.mp4', { headers: { Range: 'bytes=999999999-' } });
    assert.equal(invalid.status, 416);
    // Erro de mídia deliberado: o link local permanece disponível.
    await page.route('**/videos/0aom6f.mp4', route => route.abort());
    await page.getByRole('button', { name: 'Reproduzir Reel 01' }).click();
    await page.waitForFunction(() => !document.querySelector('#projects .video-fallback').hidden);
    assert.equal(await page.getByRole('link', { name: 'Abrir arquivo MP4' }).first().isVisible(), true);
    await page.unroute('**/videos/0aom6f.mp4');
    // Dados exclusivos do teste; nenhum case fictício é publicado.
    await page.route('**/projects.js', route => route.fulfill({ contentType: 'text/javascript', body: `const projects = [{ name: 'Case de teste', type: 'Stories', year: '2026', cover: 'assets/hero.webp', description: 'Validação da galeria.', format: 'vertical', gallery: [{ src: 'assets/azul.webp', alt: 'Galeria de teste' }] }];` }));
    await page.reload();
    assert.equal(await page.locator('.project-placeholder').count(), 0);
    await page.getByRole('button', { name: 'Ver case: Case de teste' }).click();
    assert.equal(await page.locator('dialog').evaluate(dialog => dialog.open), true);
    assert.equal(await page.locator('#project-title').textContent(), 'Case de teste');
    assert.equal(await page.locator('#project-detail img').count(), 2);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('dialog').evaluate(dialog => dialog.open), false);
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
});

 test('Faixa: movimento continuo e preferencia de movimento reduzido', async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chromium' });
  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(process.cwd() + '/index.html').href);
    const track = page.locator('.ticker-track');
    for (const width of [390, 1440, 2560]) {
      await page.setViewportSize({ width, height: 900 });
      assert.ok(await page.locator('.ticker-group').first().evaluate(node => node.getBoundingClientRect().width >= innerWidth));
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }
    const before = await track.evaluate(node => getComputedStyle(node).transform);
    await page.waitForTimeout(100);
    assert.notEqual(await track.evaluate(node => getComputedStyle(node).transform), before);
    assert.equal(await track.evaluate(node => getComputedStyle(node).animationPlayState), 'running');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await track.evaluate(node => getComputedStyle(node).animationName), 'none');
  } finally { await browser.close(); }
});

test('Destaque: autoplay silencioso, som e fallback', async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chromium' });
  try {
    const page = await browser.newPage();
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(baseUrl);
      await page.locator('#featured-video').scrollIntoViewIfNeeded();
      await page.waitForFunction(() => { const v = document.querySelector('#featured-video'); return v.currentTime > 0 && !v.paused && v.muted; });
      await page.locator('#featured-sound').click();
      await page.waitForFunction(() => { const v = document.querySelector('#featured-video'); return !v.muted && !v.paused && v.currentTime < 3; });
      await page.getByRole('button', { name: 'Reproduzir Reel 01' }).click();
      await page.waitForFunction(() => document.querySelector('#featured-video').paused);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    await page.locator('#featured-video').scrollIntoViewIfNeeded();
    assert.equal(await page.locator('#featured-video').evaluate(v => v.paused), true);
    await page.route('**/videos/destaque-fade.mp4', route => route.abort());
    await page.locator('#featured-sound').click();
    await page.waitForFunction(() => !document.querySelector('#featured-fallback').hidden);
    assert.equal(await page.getByRole('link', { name: 'Abrir vídeo de destaque' }).isVisible(), true);
  } finally { await browser.close(); }
});
