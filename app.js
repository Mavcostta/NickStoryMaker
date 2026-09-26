const whatsapp = 'https://wa.me/5581982497649?text=' + encodeURIComponent('Olá, Nicolas! Vi seu portfólio e gostaria de conversar sobre um projeto.');
document.querySelectorAll('[data-whatsapp]').forEach(link => { link.href = whatsapp; });
document.querySelector('#year').textContent = new Date().getFullYear();

const toggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() { toggle.setAttribute('aria-expanded', 'false'); }
toggle.addEventListener('click', () => toggle.setAttribute('aria-expanded', String(toggle.getAttribute('aria-expanded') !== 'true')));
navigation.addEventListener('click', closeMenu);
document.addEventListener('keydown', event => { if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { closeMenu(); toggle.focus(); } });

if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(element => { element.classList.add('will-reveal'); observer.observe(element); });
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}
function mediaUrl(value) {
  const url = new URL(value, location.href);
  if (!['http:', 'https:'].includes(url.protocol) && !(location.protocol === 'file:' && url.protocol === 'file:')) throw new Error('Mídia deve usar um caminho local ou URL HTTP(S).');
  return url.href;
}
function photo(src, alt) {
  const img = element('img');
  img.src = mediaUrl(src); img.alt = alt; img.loading = 'lazy';
  return img;
}
const dialog = document.querySelector('#project-dialog');
function showProject(project) {
  const detail = document.querySelector('#project-detail');
  detail.replaceChildren();
  const title = element('h2', '', project.name); title.id = 'project-title';
  detail.append(element('p', 'eyebrow', `${project.type} · ${project.year}`), title, element('p', '', project.description));
  if (project.video) {
    const video = element('video', project.format === 'vertical' ? 'vertical-video' : '');
    video.src = mediaUrl(project.video); video.controls = true; video.preload = 'metadata'; video.playsInline = true;
    video.poster = mediaUrl(project.cover); detail.append(video);
  } else detail.append(photo(project.cover, project.name));
  for (const image of project.gallery ?? []) detail.append(photo(image.src, image.alt || project.name));
  dialog.showModal();
}
function playVideo(frame, src, cover, name, fallback) {
        const video = element('video');
        video.setAttribute('aria-label', name);
        video.controls = true; video.playsInline = true; video.preload = 'none';
        video.poster = mediaUrl(cover);
        video.addEventListener('error', () => { fallback.hidden = false; });
        video.src = mediaUrl(src);
        frame.replaceChildren(video);
        video.play().catch(() => { if (video.error) fallback.hidden = false; });
}
const featuredVideo = document.querySelector('#featured-video');
featuredVideo.addEventListener('error', () => { document.querySelector('#featured-fallback').hidden = false; });
document.querySelector('#featured-sound').addEventListener('click', () => {
  featuredVideo.currentTime = 0;
  featuredVideo.muted = false;
  featuredVideo.play().catch(() => { if (featuredVideo.error) document.querySelector('#featured-fallback').hidden = false; });
});
if ('IntersectionObserver' in window) {
  const featuredObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) featuredVideo.pause();
    else if (featuredVideo.muted && !featuredVideo.ended && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      featuredVideo.play().catch(() => { /* Controles nativos disponíveis se o navegador bloquear autoplay. */ });
    }
  }, { threshold: 0.35 });
  featuredObserver.observe(featuredVideo);
}
if (projects.length) {
  const grid = document.querySelector('#projects'); grid.replaceChildren();
  for (const [index, project] of projects.entries()) {
    if (project.video) {
      const article = element('article', 'reel-project');
      const frame = element('div', 'reel-frame');
      const play = element('button', 'reel-load');
      play.setAttribute('aria-label', `Reproduzir ${project.name}`);
      play.append(photo(project.cover, `Capa de ${project.name}`), element('span', 'reel-play', '▷'), element('span', 'reel-label', 'REPRODUZIR'));
      const fallback = element('p', 'video-fallback', 'Não foi possível carregar o vídeo. ');
      fallback.hidden = true; fallback.setAttribute('role', 'status');
      const link = element('a', 'reel-link', 'Abrir arquivo MP4');
      link.href = mediaUrl(project.video); link.target = '_blank'; link.rel = 'noopener noreferrer';
      fallback.append(link);
      play.addEventListener('click', () => {
        playVideo(frame, project.video, project.cover, project.name, fallback);
      });
      const caption = element('div', 'project-caption');
      caption.append(element('h3', '', project.name), element('span', '', project.type));
      frame.append(play);
      article.append(frame, caption, fallback); grid.append(article);
      continue;
    }
    const button = element('button', `project ${index % 3 === 0 ? 'project-wide' : ''}`);
    button.setAttribute('aria-label', `Ver case: ${project.name}`);
    const caption = element('div', 'project-caption');
    caption.append(element('h3', '', project.name), element('span', '', `${project.type} · ${project.year}`));
    button.append(photo(project.cover, project.name), caption);
    button.addEventListener('click', () => showProject(project)); grid.append(button);
  }
}
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
document.addEventListener('play', event => {
  if (event.target instanceof HTMLVideoElement) document.querySelectorAll('video').forEach(video => { if (video !== event.target) video.pause(); });
}, true);
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
dialog.addEventListener('close', () => dialog.querySelectorAll('video').forEach(video => video.pause()));


