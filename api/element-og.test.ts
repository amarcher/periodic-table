import { describe, it, expect, beforeEach } from 'vitest';
import handler from './element-og';

type FakeReq = { url?: string; query?: Record<string, string | string[]> };
type FakeRes = {
  status: (code: number) => FakeRes;
  setHeader: (key: string, value: string) => FakeRes;
  send: (body: string) => FakeRes;
  _status: number;
  _headers: Record<string, string>;
  _body: string;
};

function makeRes(): FakeRes {
  const res: FakeRes = {
    _status: 200,
    _headers: {},
    _body: '',
    status(code) {
      this._status = code;
      return this;
    },
    setHeader(k, v) {
      this._headers[k] = v;
      return this;
    },
    send(body) {
      this._body = body;
      return this;
    },
  };
  return res;
}

function call(req: FakeReq): FakeRes {
  const res = makeRes();
  handler(req as never, res as never);
  return res;
}

describe('api/element-og', () => {
  beforeEach(() => {
    process.env.VIDEO_CDN_URL = 'https://cdn.example.test';
  });

  it('returns element-specific OG tags for a valid symbol in the path', () => {
    const res = call({ url: '/element/Au' });
    expect(res._status).toBe(200);
    expect(res._headers['Content-Type']).toContain('text/html');
    expect(res._body).toContain('<title>Gold (Au) — Periodic Table</title>');
    expect(res._body).toContain('property="og:title" content="Gold (Au) — Periodic Table"');
    expect(res._body).toContain(
      'property="og:url" content="https://www.periodictable.tech/element/Au"'
    );
  });

  it('uses the R2 video poster as og:image when a video exists', () => {
    const res = call({ url: '/element/Au' });
    expect(res._body).toContain(
      'property="og:image" content="https://cdn.example.test/079-Au-veo31fast.jpg"'
    );
    expect(res._body).toContain(
      'property="og:video" content="https://cdn.example.test/079-Au-veo31fast.mp4"'
    );
  });

  it('falls back to og-image.png when no video exists for the element', () => {
    // Livermorium (Lv, 116) has no video in VIDEO_DATA.
    const res = call({ url: '/element/Lv' });
    expect(res._status).toBe(200);
    expect(res._body).toContain(
      'property="og:image" content="https://www.periodictable.tech/og-image.png"'
    );
    expect(res._body).not.toContain('og:video"');
  });

  it('accepts a symbol query param as a fallback (vercel dev path)', () => {
    const res = call({ url: '/api/element-og?symbol=Fe', query: { symbol: 'Fe' } });
    expect(res._status).toBe(200);
    expect(res._body).toContain('Iron (Fe)');
  });

  it('is case-insensitive on symbol', () => {
    const res = call({ url: '/element/au' });
    expect(res._status).toBe(200);
    expect(res._body).toContain('Gold (Au)');
  });

  it('strips query params from the URL parse', () => {
    const res = call({ url: '/element/Au?cb=1234' });
    expect(res._status).toBe(200);
    expect(res._body).toContain('Gold (Au)');
  });

  it('returns 404 HTML for unknown symbols', () => {
    const res = call({ url: '/element/Xx' });
    expect(res._status).toBe(404);
    expect(res._body).toContain('Element not found');
  });

  it('HTML-escapes interpolated content', () => {
    const res = call({ url: '/element/Au' });
    // Nothing in the Gold data contains < or >, but confirm the template
    // does not emit raw quotes from the description (it uses &quot;).
    expect(res._body).not.toMatch(/content=""[^/]/);
  });

  it('emits apple-touch-icon and favicon links for iMessage/Apple crawlers', () => {
    const res = call({ url: '/element/H' });
    expect(res._body).toContain('rel="apple-touch-icon"');
    expect(res._body).toContain('rel="icon"');
  });
});
