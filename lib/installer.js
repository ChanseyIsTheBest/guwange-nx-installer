// Builds the guwange-nx.zip package from the player's own copy of Guwange (Xbox Live Arcade, title 58410A78): the game
// (its content package, read in place, or a folder it was extracted into) and Title Update #1 (its package, or its
// default.xexp and module/*.dllp in a folder).
//
// The zip holds the Switch build (guwange.nro) and its licenses, the shaders of its renderer made from the game's files
// (deko3d_glsl.bin: default.xex's stored shaders with the title update applied, and the sprite effects' of the resource
// archives) and the game's files with the title update's beside them (game_root/: the console applies default.xexp and
// the .dllp patches at start, as the Xbox 360 does). The settings file, guwange.toml, is written by the game at its first
// start, so an update never replaces the player's settings.

import { readXexImage } from './xex.js';
import { applyXexPatch, lzxDeltaStep } from './xexp.js';
import { StfsPackage, readStfsHeader } from './from_sa2/stfs_package.js';
import { imageContainers, sha256 } from './containers.js';
import { effectContainers } from './dsd.js';
import { buildDeko3dPackage } from './deko3d.js';
import { ZipWriter, zipSize } from './zip.js';
import { t } from './i18n.js';

export { sha256 };

const CHUNK = 16 * 1024 * 1024;
const ROOT = 'guwange-nx';
const TITLE_ID = 0x58410a78;
const CONTENT_GAME = 0x000d0000;
const CONTENT_UPDATE = 0x000b0000;
// files whose header is read to find the packages among the chosen files
const MAX_CANDIDATES = 256;
// the title update's files (an extracted update: these, as they are in its package)
export const UPDATE_FILES = ['default.xexp', 'module/Guwange01_x360.dllp', 'module/Guwange01_coop_x360.dllp',
  'module/Guwange_arrange_x360.dllp', 'module/Guwange_blue_x360.dllp'];
const UPDATE_LOWER = UPDATE_FILES.map((n) => n.toLowerCase());
// files a computer adds to folders
const JUNK = /(^|\/)(thumbs\.db|desktop\.ini|\.ds_store)$/i;

async function sha256Of(file) {
  // whole-file hashes are of the title update's files, up to half a MB: one read
  return sha256(await file.read(0, file.size));
}

async function* chunksOf(file) {
  for (let offset = 0; offset < file.size; offset += CHUNK) {
    yield await file.read(offset, Math.min(CHUNK, file.size - offset));
  }
}

function baseName(path) {
  return path.slice(path.lastIndexOf('/') + 1);
}

function folderOf(path) {
  return path.slice(0, path.lastIndexOf('/') + 1);
}

// The LZX step of readXexImage, done by libmspack compiled to WebAssembly.
export function lzxStep(lzx) {
  return async (compressed, bits, size) => {
    lzx.FS.writeFile('/image.lzx', compressed);
    const rc = lzx.callMain(['/image.lzx', '/image.bin', String(bits), String(size)]);
    if (rc) {
      throw new Error(`LZX decompression failed (${rc})`);
    }
    const out = lzx.FS.readFile('/image.bin');
    lzx.FS.unlink('/image.lzx');
    lzx.FS.unlink('/image.bin');
    return out;
  };
}

// Where a release file is downloaded from. Its SHA-256 is part of the address, so every version is a different
// address and a copy kept by the browser is never mistaken for a newer one.
export function releasePath(name, hash) {
  return `./release/${name}?sha256=${hash}`;
}

export function programPath(build) {
  return releasePath(build.nro, build.nro_sha256);
}

// The title update's files among `files` (paths relative to one folder), in UPDATE_FILES' order with its spelling, or
// null when one is missing.
function updateFilesOf(files) {
  const out = [];
  for (const [i, want] of UPDATE_LOWER.entries()) {
    const f = files.find((g) => g.path.toLowerCase() === want);
    if (!f) {
      return null;
    }
    out.push({ ...f, path: UPDATE_FILES[i] });
  }
  return out;
}

// Sorts out what the player chose (files [{ path, size, read }] from the "Files" button or every file under the
// "Folder"). Returns { game, update, others }:
//   game = { kind: 'package' | 'folder', name, files } (the game's files, paths relative to the game) or null;
//   update = { kind: 'package' | 'folder', name, files } (UPDATE_FILES) or null;
//   others = names of packages of other games.
export async function findGames(chosen) {
  let game = null;
  let update = null;
  const others = [];
  // An extracted game: the shallowest default.xex with res/DSD000.bin under its folder. An extracted title update: a
  // default.xexp with the four module/*.dllp under its folder (it may be the game's folder).
  const folders = [...new Set(chosen.map((f) => folderOf(f.path)))].sort((a, b) => a.split('/').length - b.split('/').length);
  for (const folder of folders) {
    const under = chosen.filter((f) => f.path.startsWith(folder)).map((f) => ({ ...f, path: f.path.slice(folder.length) }));
    const has = (name) => under.some((f) => f.path.toLowerCase() === name);
    const name = folder ? baseName(folder.slice(0, -1)) : '';
    if (!game && has('default.xex') && has('res/dsd000.bin')) {
      // the game's files: everything under its folder but the title update's (taken from the update)
      const files = under.filter((f) => !UPDATE_LOWER.includes(f.path.toLowerCase()) && !JUNK.test(f.path));
      game = { kind: 'folder', name, files };
    }
    if (!update && has('default.xexp')) {
      const files = updateFilesOf(under);
      if (files) {
        update = { kind: 'folder', name, files };
      }
    }
  }
  // Packages, by their header (Xbox 360 content packages have no extension, but a title update's file name has a dot:
  // TU_1C422JO_000000G000000.0000000000084; the game's own file types are left out).
  const inside = (f) => [game, update].some((g) => g && g.kind === 'folder' && g.files.some((h) => h.read === f.read));
  const candidates = chosen.filter((f) => f.size >= 0xa000 && !inside(f)
    && !/\.(bin|png|xml|xex|xexp|dll|dllp|zip|nro|toml|txt|db|ini)$/i.test(f.path)).slice(0, MAX_CANDIDATES);
  for (const file of candidates) {
    const header = readStfsHeader(await file.read(0, 0x600));
    if (!header) {
      continue;
    }
    const name = baseName(file.path);
    if (header.titleId !== TITLE_ID) {
      others.push(header.displayName || name);
    } else if (header.contentType === CONTENT_GAME && !game) {
      const pkg = await StfsPackage.open(file);
      game = { kind: 'package', name, files: pkg.files() };
    } else if (header.contentType === CONTENT_UPDATE && !update) {
      const pkg = await StfsPackage.open(file);
      const files = updateFilesOf(pkg.files());
      if (files) {
        update = { kind: 'package', name: header.displayName || name, files };
      }
    }
  }
  return { game, update, others };
}

function fileNamed(files, name) {
  return files.find((f) => f.path.toLowerCase() === name.toLowerCase());
}

// Identifies the build: default.xex by its SHA-256, the title update's files by theirs, the game's other files by their
// sizes. Returns { xexHash, xexpHash, build, problems }.
export async function identifyGames(chosen, manifest) {
  const { game, update } = chosen;
  if (!game) {
    const error = new Error(t('noGame'));
    error.code = 'noGame';
    throw error;
  }
  const xexFile = fileNamed(game.files, 'default.xex');
  const xexHash = await sha256(await xexFile.read(0, xexFile.size));
  const build = manifest.builds.find((b) => b.xex_sha256 === xexHash) || null;
  const problems = [];
  let xexpHash = null;
  if (build) {
    if (!update) {
      problems.push('noUpdate');
    } else {
      for (const want of build.update_files) {
        const f = fileNamed(update.files, want.path);
        const hash = f && f.size === want.size ? await sha256Of(f) : null;
        if (want.path === 'default.xexp') {
          xexpHash = hash;
        }
        if (hash !== want.sha256) {
          problems.push('updateDifferent');
          break;
        }
      }
    }
    for (const want of build.game_files) {
      const f = fileNamed(game.files, want.path);
      if (!f || f.size !== want.size) {
        problems.push('gameDifferent');
        break;
      }
    }
  }
  return { xexHash, xexpHash, build, problems };
}

// The executable the console runs: default.xex's image with the title update applied (lib/xexp.js).
export async function patchedImage(chosen, modules) {
  const xexFile = fileNamed(chosen.game.files, 'default.xex');
  const xex = await xexFile.read(0, xexFile.size);
  const xexpFile = fileNamed(chosen.update.files, 'default.xexp');
  const xexp = await xexpFile.read(0, xexpFile.size);
  const { image: base } = await readXexImage(xex, lzxStep(modules.lzx));
  const { image } = await applyXexPatch(xex, base, xexp, lzxDeltaStep(modules.lzxDelta));
  return { image, xexHash: await sha256(xex), xexpHash: await sha256(xexp) };
}

// Every distinct shader container of the game's files: the patched executable's, then the sprite effects'.
// Returns { containers: [{ stage, bytes, address, source }], xexHash, xexpHash }.
export async function gameContainers(chosen, modules) {
  const { image, xexHash, xexpHash } = await patchedImage(chosen, modules);
  const containers = [];
  const seen = new Set();
  for (const c of [...imageContainers(image), ...(await effectContainers(chosen.game.files))]) {
    const hash = await sha256(c.bytes);
    if (!seen.has(hash)) {
      seen.add(hash);
      containers.push({ ...c, sha256: hash });
    }
  }
  return { containers, xexHash, xexpHash };
}

// The shaders of the Switch build's renderer (Renut on deko3d): deko3d_glsl.bin, which the NRO reads beside itself,
// made from the game's shader containers (lib/deko3d.js) and checked against the build's manifest entry ("deko3d":
// { shaders, containers_sha256, package_sha256 }).
// modules: { lzx, lzxDelta, renutHlsl, dxc, spirvCross }; renutCommon: Renut's shader_common.h; onShader(done, total)
// after each shader.
export async function makeDeko3dPackage(chosen, build, modules, renutCommon, log = () => {}, onShader = () => {}) {
  const wanted = build.deko3d.containers_sha256;
  const containers = (await gameContainers(chosen, modules)).containers.filter((c) => wanted.includes(c.sha256));
  if (containers.length !== wanted.length) {
    throw new Error(t('deko3dContainers', { found: containers.length, wanted: wanted.length }));
  }
  log(t('deko3dShaders', { count: build.deko3d.shaders.length }));
  const { package: pkg } = await buildDeko3dPackage(containers, build.deko3d.shaders, modules, renutCommon, () => {},
    onShader);
  const hash = await sha256(pkg);
  if (hash !== build.deko3d.package_sha256) {
    throw new Error(t('deko3dMismatch', { hash }));
  }
  log(t('deko3dReady'));
  return pkg;
}

// chosen: findGames(); release: { manifest, nro, licenses, renutShaderCommon } (bytes)
// modules: { lzx, lzxDelta, renutHlsl, dxc, spirvCross } instantiated Emscripten modules
// sink: { write(Uint8Array), close() } receiving the zip file
// onSize(bytes) is called with the exact size of the zip before the first byte is written.
// update: only the program, its licenses and the shaders, for a folder already on the SD card.
export async function createPackage(chosen, release, modules, sink, log = () => {}, progress = () => {},
  onSize = () => {}, { update = false } = {}) {
  const id = await identifyGames(chosen, release.manifest);
  const { build } = id;
  if (!build) {
    throw new Error(t('notSupportedYet', { hash: id.xexHash }));
  }
  if (id.problems.length) {
    throw new Error(t(id.problems[0]));
  }
  log(t('logBuild', { version: build.version }));
  if (update) {
    log(t('logUpdate'));
  }

  // The shaders first: they are the step most likely to stop the package, and nothing is written before them.
  const stage = (from, to) => (f) => progress(from + (to - from) * Math.min(Math.max(f, 0), 1));
  const shaderStage = stage(0, update ? 0.9 : 0.4);
  const deko3d = await makeDeko3dPackage(chosen, build, modules, release.renutShaderCommon, log,
    (done, total) => shaderStage(done / total));

  // game_root/: the game's files and the title update's (the console applies them at start)
  const gameEntries = update ? [] : [...chosen.game.files, ...chosen.update.files]
    .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
    .map((f) => ({ path: `${ROOT}/game_root/${f.path}`, file: f }));
  const entries = [
    { path: `${ROOT}/guwange.nro`, size: release.nro.length },
    { path: `${ROOT}/LICENSES.txt`, size: release.licenses.length },
    { path: `${ROOT}/deko3d_glsl.bin`, size: deko3d.length },
    ...gameEntries.map((e) => ({ path: e.path, size: e.file.size })),
  ];
  onSize(zipSize(entries));
  log(t('packing'));
  const total = gameEntries.reduce((n, e) => n + e.file.size, 0) || 1;
  const write = stage(update ? 0.9 : 0.4, 1);
  let done = 0;
  const onChunk = (chunk) => {
    done += chunk.length;
    write(done / total);
  };
  const zip = new ZipWriter(sink);
  await zip.addBytes(`${ROOT}/guwange.nro`, release.nro);
  await zip.addBytes(`${ROOT}/LICENSES.txt`, release.licenses);
  await zip.addBytes(`${ROOT}/deko3d_glsl.bin`, deko3d);
  for (const e of gameEntries) {
    await zip.addFile(e.path, e.file.size, chunksOf(e.file), onChunk);
  }
  await zip.finish();
  progress(1);
  log(t('done'));
  return { version: build.version, update };
}
