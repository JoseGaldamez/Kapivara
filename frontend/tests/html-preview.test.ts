import assert from 'node:assert/strict';
import test from 'node:test';
import { buildPreviewDocument, isHtmlResponse } from '../src/utils/html-preview.ts';

test('recognizes HTML content types without treating binary content as HTML', () => {
    assert.equal(isHtmlResponse({ headers: { 'CONTENT-TYPE': 'text/html; charset=utf-8' } }), true);
    assert.equal(isHtmlResponse({ content_type: 'application/xhtml+xml', headers: {} }), true);
    assert.equal(isHtmlResponse({ content_type: 'text/html', headers: {}, body_encoding: 'base64' }), false);
});

test('preview keeps styles and relative resources while disallowing scripts', () => {
    const html = '<html><head><link rel="stylesheet" href="./site.css"><style>body{color:red}</style></head><body>Hello<script>alert(1)</script></body></html>';
    const document = buildPreviewDocument(html, 'https://example.com/docs/page?x=1&y=2');
    assert.match(document, /<base href="https:\/\/example\.com\/docs\/page\?x=1&amp;y=2">/);
    assert.match(document, /script-src 'none'/);
    assert.match(document, /style-src 'unsafe-inline' http: https: data:/);
    assert.match(document, /<link rel="stylesheet" href="\.\/site\.css">/);
    assert.match(document, /<style>body\{color:red\}<\/style>/);
});

test('preview does not accept a local file URL as its base', () => {
    const document = buildPreviewDocument('<p>Hi</p>', 'file:///private/data/page.html');
    assert.doesNotMatch(document, /<base /);
});
