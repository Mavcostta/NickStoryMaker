import sharp from 'sharp';
import { mkdir, readdir } from 'node:fs/promises';

await mkdir('assets', { recursive: true });
const selections = [
  ['hero', '16.12.47 (2)', 1200],
  ['sobre', '16.12.45', 900],
  ['olhar', '16.12.46 (1)', 1200],
  ['processo', '16.12.46', 600],
  ['bastidores', '16.12.47 (1)', 800],
  ['azul', '16.12.46 (1)', 800],
];
const files = await readdir('IMAGENS');
for (const [name, suffix, width] of selections) {
  const file = files.find(file => file.endsWith(`${suffix}.jpeg`));
  if (!file) throw new Error(`Fotografia ausente: ${suffix}`);
  await sharp(`IMAGENS/${file}`).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 83 }).toFile(`assets/${name}.webp`);
  console.log(`Preparada: ${name}.webp`);
}
await sharp('assets/hero.webp').resize(1200, 630, { fit: 'cover', position: 'attention' }).jpeg({ quality: 85 }).toFile('assets/social.jpg');
