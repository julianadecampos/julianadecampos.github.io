# Juliana de Campos Ribeiro · portfólio

Um portfólio que se percorre como um fluxo BPMN em 3D: cada etapa é um painel, e a câmera segue o caminho conforme a rolagem.

**No ar:** https://julianadecampos.github.io/ (inglês em `/en/`)

## Estrutura

| Arquivo | O que é |
|---|---|
| `index.html` | Página principal. O texto em português fica aqui. |
| `content.js` | Todo o conteúdo variável: textos em inglês, ferramentas, certificações e logos. |
| `app.js` | Comportamento: trilho do cabeçalho, demonstrações, agente, recibo final, idioma. |
| `scene.js` | Cena 3D da página principal (three.js). |
| `tatame.html`, `tatame-content.js`, `tatame.js`, `tatame.css` | A trilha do tatame, na mesma estrutura. |
| `styles.css` | Estilos das duas páginas. |
| `game/` | Fase final de *O Labirinto*, aberta em uma janela no site. |
| `fonts/`, `vendor/three/`, `assets/logos/` | Fontes, three.js e logos hospedados no próprio site, sem dependência de serviços externos. |
| `scripts/` | Build (`build.mjs`) e imagens de compartilhamento (`og.html`, `og.mjs`). |
| `tests/` | Testes automáticos de fumaça (desktop e celular). |

## Editar conteúdo

- **Texto em português:** direto no `index.html` ou no `tatame.html`.
- **Texto em inglês, ferramentas e certificações:** no `content.js` (ou no `tatame-content.js`). Cada texto traduzível tem uma chave `data-i18n` (ou `data-t`) no HTML e a mesma chave no dicionário `EN`.
- Para ver localmente, basta servir a pasta com qualquer servidor estático. O site funciona sem build.

## Publicação

Todo envio para `main` dispara o workflow `.github/workflows/site.yml`, que:

1. gera a versão final em `dist/` (código minificado, versões dos arquivos por conteúdo, páginas em inglês em `/en/`);
2. gera as imagens de compartilhamento e o ícone do iPhone;
3. roda os testes em desktop e celular. **Se algum falhar, o site não é publicado;**
4. mede desempenho, acessibilidade e SEO (Lighthouse) e confere os links, incluindo as verificações de certificados. Esses dois itens geram relatório, mas não bloqueiam;
5. publica no GitHub Pages.

Os relatórios ficam na aba **Actions** do repositório.

## Pendências que dependem de conta própria

**Domínio pago (opcional).** O site já usa o endereço gratuito `julianadecampos.github.io`. Para usar um domínio registrado (ex.: `julianadecampos.adv.br`, reservado a advogados):
1. Registre o domínio (Registro.br, para `.com.br`).
2. No painel do domínio, crie um registro `CNAME` de `www` para `julianadecampos.github.io` e os registros `A` do domínio raiz para os IPs do GitHub Pages (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153).
3. Em **Settings → Pages → Custom domain** do repositório, informe o domínio e marque **Enforce HTTPS**.
4. Troque o endereço `https://julianadecampos.github.io/` pelo novo em `scripts/build.mjs` (constante `SITE`), nos `<head>` das duas páginas, em `sitemap.xml` e em `robots.txt`.

**Estatísticas de visita** (sem cookies):
1. Crie uma conta gratuita no GoatCounter (https://www.goatcounter.com) com um código, por exemplo `julianadecampos`.
2. Adicione antes de `</body>` nas duas páginas:
   `<script data-goatcounter="https://SEU-CODIGO.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>`

## Licenças

three.js: MIT (`vendor/three/LICENSE`). Fontes: SIL Open Font License. Logos de ferramentas e instituições pertencem aos seus titulares e aparecem apenas para identificá-los.
