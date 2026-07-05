#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { URL } = require('url');

const POPUP_HTML = path.join(__dirname, '..', 'popup.html');
const TIMEOUT_MS = 10000;
const MAX_REDIRECTS = 5;
const CONCURRENCY = 8;

// Identify honestly as a script. Counterintuitively, spoofing a Chrome UA
// causes *more* 403s here - some WAFs specifically flag a browser-claiming
// UA whose TLS fingerprint doesn't match a real browser, which a plain
// script UA doesn't trigger. Verified manually against validator.w3.org.
const USER_AGENT = 'Mozilla/5.0 (compatible; ClarkWebDevLinkChecker/1.0)';

// Domains behind bot-management (Cloudflare, etc.) that block automated
// requests outright regardless of headers. Verified manually; these are
// not actually broken, just unreachable by this script. Skip them instead
// of failing CI on a false positive.
const KNOWN_BOT_PROTECTED = new Set([
  'chatgpt.com',
  'claude.ai',
  'www.perplexity.ai',
  'unsplash.com',
  'unblast.com',
]);

function extractLinks(html) {
  const anchorRegex = /<a\s[^>]*href="([^"]+)"/gi;
  const links = new Set();
  let match;
  while ((match = anchorRegex.exec(html)) !== null) {
    const href = match[1];
    if (href.startsWith('http://') || href.startsWith('https://')) {
      links.add(href);
    }
  }
  return [...links];
}

function request(url, method, redirectsLeft) {
  return new Promise((resolve) => {
    let target;
    try {
      target = new URL(url);
    } catch (err) {
      resolve({ url, ok: false, reason: 'Invalid URL' });
      return;
    }

    const client = target.protocol === 'http:' ? http : https;
    const req = client.request(
      target,
      { method, timeout: TIMEOUT_MS, headers: { 'User-Agent': USER_AGENT } },
      (res) => {
        const { statusCode } = res;
        res.resume();

        const isRedirect = [301, 302, 303, 307, 308].includes(statusCode);
        if (isRedirect && res.headers.location && redirectsLeft > 0) {
          const nextUrl = new URL(res.headers.location, target).toString();
          resolve(request(nextUrl, method, redirectsLeft - 1));
          return;
        }

        if ((statusCode === 403 || statusCode === 405) && method === 'HEAD') {
          // Some servers reject HEAD requests; retry with GET before giving up.
          resolve(request(url, 'GET', redirectsLeft));
          return;
        }

        resolve({ url, ok: statusCode < 400, status: statusCode });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      resolve({ url, ok: false, reason: 'Timeout' });
    });

    req.on('error', (err) => {
      resolve({ url, ok: false, reason: err.message });
    });

    req.end();
  });
}

function checkLink(url) {
  return request(url, 'HEAD', MAX_REDIRECTS);
}

async function runWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let index = 0;

  async function next() {
    while (index < items.length) {
      const current = index++;
      results[current] = await worker(items[current]);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, next);
  await Promise.all(workers);
  return results;
}

async function main() {
  const html = fs.readFileSync(POPUP_HTML, 'utf8');
  const allLinks = extractLinks(html);

  const skipped = allLinks.filter((url) => KNOWN_BOT_PROTECTED.has(new URL(url).hostname));
  const links = allLinks.filter((url) => !KNOWN_BOT_PROTECTED.has(new URL(url).hostname));

  console.log(`Checking ${links.length} links from popup.html (${skipped.length} skipped)...\n`);

  const results = await runWithConcurrency(links, CONCURRENCY, checkLink);
  const broken = results.filter((r) => !r.ok);

  results
    .filter((r) => r.ok)
    .forEach((r) => console.log(`OK    ${r.status}  ${r.url}`));

  if (skipped.length > 0) {
    console.log('\nSkipped (known bot-protected, verify manually):');
    skipped.forEach((url) => console.log(`SKIP        ${url}`));
  }

  if (broken.length > 0) {
    console.log('\nBroken links:');
    broken.forEach((r) => console.log(`FAIL  ${r.status || r.reason}  ${r.url}`));
    console.log(`\n${broken.length} of ${links.length} links failed.`);
    process.exitCode = 1;
    return;
  }

  console.log(`\nAll ${links.length} checked links OK.`);
}

main();
