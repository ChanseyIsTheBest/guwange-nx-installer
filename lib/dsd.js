// Guwange's resource archives (res/DSD000.bin, DSD100.bin, DSD200.bin) and the shader containers of the sprite effects
// stored in them. The game builds 10 of its shaders at run time from these compiled effects (game_res/shader/*.cfx and
// pkgres/sprite_i_360.cfx), so the page decodes them as the game does.
//
// An archive (big-endian): u16 0xC009, u16 0x0117, u32 archive size, u32 data offset, u32 entry count, 16 bytes of zeros,
// then the entries (0x114 bytes each from 0x24): u16 index, u16 flags (0x0101: compressed), u32 size, u32 stored size
// (0 when not compressed), u32 offset in the archive, name (0x104 bytes, zero-terminated).
//
// A compressed entry is the game's LZSS (sub_821FDE00 of default.xex): u32 size, u32 token count, u32 offset of the
// byte stream; the flag bytes start at +12, read from the high bit down. A 0 flag copies one byte of the byte stream;
// a 1 flag reads a big-endian word from it: length (its low 5 bits) + 3 bytes from distance (its high 11 bits) back.

import { imageContainers } from './containers.js';

const ENTRY = 0x114;
const COMPRESSED = 0x0101;
// the archives that hold the sprite effects
export const EFFECT_ARCHIVES = ['res/DSD000.bin', 'res/DSD100.bin'];

function be16(data, offset) {
  return (data[offset] << 8) | data[offset + 1];
}

function be32(data, offset) {
  return ((data[offset] << 24) | (data[offset + 1] << 16) | (data[offset + 2] << 8) | data[offset + 3]) >>> 0;
}

// The entries of an archive: [{ name, compressed, size, stored, offset }]. file: { size, read(offset, length) }.
export async function archiveEntries(file) {
  const head = await file.read(0, Math.min(file.size, 0x24));
  if (head.length < 0x24 || be16(head, 0) !== 0xc009) {
    throw new Error('not a Guwange resource archive');
  }
  const count = be32(head, 12);
  if (0x24 + count * ENTRY > file.size) {
    throw new Error('the resource archive is truncated');
  }
  const table = await file.read(0x24, count * ENTRY);
  const out = [];
  for (let i = 0; i < count; i++) {
    const at = i * ENTRY;
    let name = '';
    for (let k = at + 16; k < at + ENTRY && table[k]; k++) {
      name += String.fromCharCode(table[k]);
    }
    out.push({
      name,
      compressed: be16(table, at + 2) === COMPRESSED,
      size: be32(table, at + 4),
      stored: be32(table, at + 8),
      offset: be32(table, at + 12),
    });
  }
  return out;
}

// sub_821FDE00: the decoded bytes of one compressed entry.
export function lzss(blob) {
  const size = be32(blob, 0);
  const tokens = be32(blob, 4);
  let data = be32(blob, 8);
  const out = new Uint8Array(size);
  let at = 0;
  let flagAt = 12;
  let bits = 0;
  let flags = 0;
  for (let t = 0; t < tokens; t++) {
    if (!bits) {
      flags = blob[flagAt++];
      bits = 8;
    }
    if (flags & 0x80) {
      const v = (blob[data] << 8) | blob[data + 1];
      data += 2;
      const length = (v & 0x1f) + 3;
      const from = at - (v >>> 5);
      if (from < 0 || at + length > size) {
        throw new Error('a resource archive entry does not decode');
      }
      for (let k = 0; k < length; k++) {
        out[at + k] = out[from + k];
      }
      at += length;
    } else {
      if (at >= size || data >= blob.length) {
        throw new Error('a resource archive entry does not decode');
      }
      out[at++] = blob[data++];
    }
    flags = (flags << 1) & 0xff;
    bits--;
  }
  if (at !== size) {
    throw new Error('a resource archive entry does not decode');
  }
  return out;
}

// The bytes of one entry, decoded when it is compressed.
export async function entryBytes(file, entry) {
  if (!entry.compressed) {
    return file.read(entry.offset, entry.size);
  }
  return lzss(await file.read(entry.offset, entry.stored));
}

// The shader containers of the sprite effects in the game's archives: [{ stage, bytes, address: null, source }].
// files: the game's files ([{ path, size, read }]).
export async function effectContainers(files) {
  const found = [];
  for (const path of EFFECT_ARCHIVES) {
    const file = files.find((f) => f.path.toLowerCase() === path.toLowerCase());
    if (!file) {
      throw new Error(`${path} is missing`);
    }
    for (const entry of await archiveEntries(file)) {
      if (!/\.cfx$/i.test(entry.name)) {
        continue;
      }
      for (const c of imageContainers(await entryBytes(file, entry))) {
        found.push({ ...c, address: null, source: `${path}:${entry.name}` });
      }
    }
  }
  return found;
}
