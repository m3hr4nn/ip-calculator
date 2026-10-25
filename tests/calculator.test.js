const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];

assert.ok(script, 'index.html must contain an inline application script');

const calculator = { document: { addEventListener() {} } };
vm.createContext(calculator);
vm.runInContext(script, calculator);

test('the page is a standalone local file', () => {
  assert.doesNotMatch(html, /<(?:script|link)\b[^>]*(?:src|href)=/i);
  assert.doesNotMatch(html, /\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(/);
});

test('calculates a typical /24', () => {
  const parsed = calculator.parseInput('192.168.1.100', '24');
  const result = calculator.calculateSubnet(parsed.ip, parsed.octets, parsed.cidr);
  assert.equal(result.address, '192.168.1.100/24');
  assert.equal(result.mask, '255.255.255.0');
  assert.equal(result.wildcard, '0.0.0.255');
  assert.equal(result.network, '192.168.1.0');
  assert.equal(result.broadcast, '192.168.1.255');
  assert.equal(result.totalAddresses, 256);
  assert.equal(result.usableHosts, 254);
  assert.equal(result.hostRange, '192.168.1.1 – 192.168.1.254');
});

test('calculates prefixes that cross octet boundaries', () => {
  const parsed = calculator.parseInput('10.0.255.1/15', '');
  const result = calculator.calculateSubnet(parsed.ip, parsed.octets, parsed.cidr);
  assert.equal(result.network, '10.0.0.0');
  assert.equal(result.broadcast, '10.1.255.255');
  assert.equal(result.hostRange, '10.0.0.1 – 10.1.255.254');
});

test('handles /0, /31, and /32 explicitly', () => {
  const zero = calculator.calculateSubnet('203.0.113.9', [203, 0, 113, 9], 0);
  assert.equal(zero.network, '0.0.0.0');
  assert.equal(zero.broadcast, '255.255.255.255');
  assert.equal(zero.totalAddresses, 4294967296);

  const thirtyOne = calculator.calculateSubnet('192.0.2.0', [192, 0, 2, 0], 31);
  assert.equal(thirtyOne.broadcast, 'Not applicable');
  assert.equal(thirtyOne.usableHosts, 2);
  assert.equal(thirtyOne.hostRange, '192.0.2.0 – 192.0.2.1');

  const thirtyTwo = calculator.calculateSubnet('192.0.2.9', [192, 0, 2, 9], 32);
  assert.equal(thirtyTwo.broadcast, 'Not applicable');
  assert.equal(thirtyTwo.usableHosts, 1);
  assert.equal(thirtyTwo.hostRange, '192.0.2.9');
});

test('accepts numeric prefixes and contiguous masks', () => {
  assert.equal(calculator.parseCidr('0'), 0);
  assert.equal(calculator.parseCidr('32'), 32);
  assert.equal(calculator.parseCidr('254.0.0.0'), 7);
  assert.equal(calculator.parseCidr('255.255.254.0'), 23);
  assert.equal(calculator.parseCidr('0.0.0.0'), 0);
  assert.equal(calculator.parseCidr('255.255.255.255'), 32);
});

test('rejects malformed IPv4 input', () => {
  for (const input of [
    '', '192.168..1', '192.168.1.', '.168.1.1', '192.168.1',
    '192.168.1.1.5', '256.1.1.1', '192.168.001.1', '-1.2.3.4',
    '192.168.1.1/24/7'
  ]) {
    assert.ok(calculator.parseInput(input, '24').error, `${input} should be rejected`);
  }
});

test('rejects malformed prefixes and non-contiguous masks', () => {
  for (const prefix of [
    '', '-1', '33', '24suffix', '024', '255.0.255.0',
    '255.255.255.1', '255.255.255.256'
  ]) {
    assert.ok(calculator.parseInput('192.168.1.1', prefix).error, `${prefix} should be rejected`);
  }
});

test('matches an independent oracle across 5,000 deterministic vectors', () => {
  let state = 0x1a2b3c4d;
  const next = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state;
  };
  const toIp = value => [24n, 16n, 8n, 0n]
    .map(shift => Number((value >> shift) & 255n))
    .join('.');

  for (let index = 0; index < 5000; index++) {
    const value = BigInt(next());
    const cidr = next() % 33;
    const allBits = (1n << 32n) - 1n;
    const mask = cidr === 0 ? 0n : (allBits << (32n - BigInt(cidr))) & allBits;
    const expectedNetwork = value & mask;
    const expectedBroadcast = expectedNetwork | (allBits ^ mask);
    const ip = toIp(value);
    const octets = ip.split('.').map(Number);
    const result = calculator.calculateSubnet(ip, octets, cidr);

    assert.equal(result.network, toIp(expectedNetwork), `${ip}/${cidr} network`);
    if (cidr < 31) assert.equal(result.broadcast, toIp(expectedBroadcast), `${ip}/${cidr} broadcast`);
  }
});
