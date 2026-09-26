# Nicolas Guilherme — Story Maker

Site estático em HTML, CSS e JavaScript, com as seis fotografias originais preservadas em `IMAGENS/` e cópias otimizadas em `assets/`.

## Abrir localmente

Com Node.js instalado, execute `npm start` e abra http://localhost:3000.

## Adicionar trabalhos reais

Os quatro Reels estão em `projects.js`, com `name`, `type`, `video`, `cover` e `format`. Mapeamento: Reel 01 → `0aom6f.mp4`; Reel 02 → `7ueiyh.mp4`; Reel 03 → `dw6o2w.mp4`; Reel 04 → `rfxi9a.mp4`. Os arquivos ficam em `videos/`. Os nomes são neutros porque os títulos dos trabalhos não foram fornecidos; a ordem dos arquivos não implica correspondência com os links antigos do Instagram.

Somente as capas são carregadas inicialmente. O clique cria um vídeo local com controles, `playsinline` e `preload="none"` e inicia a reprodução. Um vídeo pausa os demais. Em caso de erro, aparece um aviso com link para abrir o MP4. Não há embeds nem dependência do Instagram. O servidor suporta streaming e requisições Range para avançar e retroceder.

Edite a lista `projects` em `projects.js`. Use caminhos locais para os vídeos e capas. Os Reels são exibidos em 9:16; projetos fotográficos sem `video` continuam abrindo a galeria existente.

Nenhum projeto demonstrativo é publicado. As imagens de estúdio não são apresentadas como cases.

## Atualizar as imagens

Execute `npm install` e `npm run images`. O script gera cópias WebP sem modificar as fotos de origem. O site publicado não precisa de dependências ou Node.js.

Para regenerar as capas dos vídeos, execute `node prepare-posters.mjs` com o servidor local em execução. O script extrai um frame de 0,1 segundo de cada MP4, sem criar conteúdo novo.

## Publicação

V1 para validação: https://nicolas-guilherme-v1-7f3a.surge.sh

Publicada a partir de `deploy-v1/`, contendo apenas os arquivos públicos. Para atualizar, copie os arquivos alterados para essa pasta e execute `npx --yes surge ./deploy-v1 nicolas-guilherme-v1-7f3a.surge.sh`.

Publique `index.html`, `style.css`, `app.js`, `projects.js`, `favicon.svg`, `assets/` e `videos/` em uma hospedagem estática HTTPS com suporte a Range e MIME `video/mp4`. Ao definir o domínio final, troque `og:image` por sua URL absoluta (terminando em `/assets/social.jpg`) e adicione `og:url` e um link canônico para esse domínio.

O WhatsApp está configurado em `app.js`, com número e mensagem do briefing. O ano do rodapé é atualizado automaticamente. Manrope é hospedada localmente; a licença acompanha a fonte em `assets/`.

## Verificação

Com `npm start` em execução, rode `npm test` em outro terminal. Na primeira vez, instale o navegador de teste com `npx playwright install chromium`. O teste confere desktop, larguras de 360/390/430 px, menu, imagens, WhatsApp e abertura da galeria. As capturas ficam em `test-results/`.

## SEO regional

O título, a descrição, o texto de apresentação e o bloco de atendimento destacam Story Maker em Jataúba–PE, cobertura de eventos em Santa Cruz do Capibaribe e conteúdo para redes sociais em Pernambuco e Paraíba. Os deslocamentos são apresentados sob consulta. O JSON-LD descreve o serviço e seu prestador, sem inventar endereço comercial ou avaliações.

Ao definir o domínio definitivo, configurar canonical, og:url, imagem social absoluta e sitemap.xml com a URL pública. Após publicar, verificar a propriedade no Google Search Console e solicitar a indexação. Não usar automaticamente o endereço de validação como domínio definitivo. As mudanças locais não atualizam a versão publicada em deploy-v1.

## Vídeo de destaque

A seção após a faixa animada usa videos/destaque-fade.mp4 (H.264/AAC, 720 × 1280, 30 fps, faststart), derivado de videos/destaque.MOV. O original foi preservado. A capa assets/destaque.webp foi extraída aos 15 segundos. O vídeo começa automaticamente sem som ao entrar na tela e pausa ao sair. O botão “Ouvir desde o início” reinicia com áudio. O MP4 tem fade-in de 2 segundos e fade-out nos 2 segundos finais, aplicados à faixa de áudio. Controles nativos, pausa dos outros vídeos e link de erro continuam disponíveis. Com preferência por movimento reduzido, a reprodução é manual. A versão anterior videos/destaque.mp4 e o MOV original foram preservados. Para publicar, incluir também o novo MP4 e a capa.
