// 메뉴·푸터·예약 바를 partials/ 에서 모든 페이지로 복사한다.
// 사용: node tools/sync-layout.mjs        (메뉴나 푸터를 바꾼 뒤 한 번 실행하고 결과를 커밋)
//       node tools/sync-layout.mjs --check (어긋난 페이지가 있으면 종료코드 1)
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const part = (n) => readFileSync(join(root, 'partials', n), 'utf8').trim();
const nav = part('nav.html');
const footer = part('footer.html');
const cta = part('cta.html');
const CSS = '<link href="assets/css/site-common.css" rel="stylesheet">';
const CTA_START = '<!-- LAYOUT:CTA -->';
const CTA_END = '<!-- /LAYOUT:CTA -->';
const check = process.argv.includes('--check');

const pages = readdirSync(root).filter((f) => f.endsWith('.html') && !f.startsWith('naver'));
let drift = 0;
for (const page of pages) {
  const path = join(root, page);
  const before = readFileSync(path, 'utf8');
  let html = before;

  // 현재 페이지 링크에 active 표시 (Home 은 index 에서만)
  const pageNav = nav.replace(
    new RegExp(`href="${page.replace(/[.&]/g, (c) => '\\' + c)}"`),
    (m) => m + ' aria-current="page"'
  );

  html = html.replace(/<nav id="navbar"[\s\S]*?<\/nav>(<!-- \.navbar -->)?/, pageNav);
  html = html.replace(/<footer id="footer"[\s\S]*?<\/footer>(<!-- End Footer -->)?/, footer);

  if (!html.includes(CSS)) html = html.replace('</head>', `    ${CSS}\n</head>`);

  const block = `${CTA_START}\n    ${cta}\n    ${CTA_END}`;
  if (html.includes(CTA_START)) {
    html = html.replace(new RegExp(`${CTA_START}[\\s\\S]*?${CTA_END}`), block);
  } else {
    html = html.replace(/(\s*)<\/body>/, `\n    ${block}\n$1</body>`);
  }

  if (html !== before) {
    drift++;
    if (check) console.log(`어긋남: ${page}`);
    else { writeFileSync(path, html); console.log(`갱신: ${page}`); }
  }
}
if (check && drift) process.exit(1);
console.log(check ? `검사 끝 (${pages.length}개 페이지, 어긋남 ${drift})` : `끝 (${pages.length}개 페이지, 갱신 ${drift})`);
