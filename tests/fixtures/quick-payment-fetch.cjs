// Test-only provider transport. Production never imports this file.
const originalFetch = globalThis.fetch;
globalThis.fetch = async function(input, init) {
  const value = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const prefix = 'https://sandboxapi.grow.link/api/light/server/1.0/';
  if (value && value.startsWith(prefix)) {
    const request = new Request(input, init);
    const values = Object.fromEntries((await request.formData()).entries());
    return originalFetch('http://127.0.0.1:4012/__grow/' + value.slice(prefix.length), { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(values) });
  }
  return originalFetch(input, init);
};
