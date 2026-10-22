// Interface texts in English and Japanese. Works in the page and in the worker (no DOM here).
// Static texts in index.html name their key with data-i18n (plain text) or data-i18n-html (text with markup).

export const LANGUAGES = [
  { code: 'en', name: 'English', flag: 'uk' },
  { code: 'ja', name: '日本語', flag: 'japan' },
];

const SPHAIRA = '<a href="https://github.com/NaGaa95/sphaira/releases" target="_blank" rel="noopener">Sphaira</a>';
const GAME_PACKAGE = '<code>92ED9E87CBCB7292EC7ACD321AA6704531D395A558</code>';
const GAME_PATH = '<code>Content/0000000000000000/58410A78/000D0000</code>';
const UPDATE_PACKAGE = '<code>TU_1C422JO_000000G000000.0000000000084</code>';
const UPDATE_FOLDER = '<code>default.xexp</code> + <code>module/*.dllp</code>';

const TEXTS = {
  en: {
    legal:
      'Guwange is a trademark of CAVE Interactive; the icon artwork is © CAVE. guwange-nx is an unofficial fan project and is not affiliated with, endorsed or sponsored by CAVE, Nintendo or Microsoft. Nintendo Switch is a trademark of Nintendo; Xbox 360 and Xbox Live Arcade are trademarks of Microsoft. This site does not host or distribute game data or the original game executable: your game is read only inside your browser, is never uploaded, and what is made from it is written straight into the guwange-nx.zip saved on your computer. You need your own legally obtained copy of the game.',
    sourceCode: 'Source code',
    signature: 'a ChanseyIsTheBest project',
    lead:
      'Builds the <strong>Nintendo Switch</strong> package of <strong>Guwange</strong> (Xbox Live Arcade) from your own ' +
      'copy of the game and its <strong>Title Update #1</strong>. Everything runs in <strong>this browser</strong>.',
    languageBar: 'Language',
    step1: '1. Choose your game files',
    addFiles: 'Add files',
    addFolder: 'Add a folder',
    clear: 'Clear',
    ownCopy:
      '<strong>Important:</strong> you need your own copy of the game, dumped from your own console. The installer reads it to make the package; it supplies no game files of its own. Only the Xbox Live Arcade game (title 58410A78) with Title Update #1 is supported.',
    formatHint:
      '<strong>The game:</strong> its content package ' + GAME_PACKAGE + ' (on the console in ' + GAME_PATH + '), or a folder it was extracted into (with <code>default.xex</code>, <code>module/</code> and <code>res/</code>). ' +
      '<strong>Title Update #1:</strong> its package (such as ' + UPDATE_PACKAGE + '), or its ' + UPDATE_FOLDER + ' in a folder (the game\'s folder is fine). ' +
      'You can add them one after the other, or choose a folder that holds both.',
    nothingChosen: 'Nothing chosen yet.',
    chosenGame: 'Game: {name}',
    chosenNoGame: 'Game: not found yet',
    chosenUpdate: 'Title Update #1: {name}',
    chosenNoUpdate: 'Title Update #1: not found yet (needed)',
    step2: '2. Create the package',
    step2First: 'If you are installing the game for the first time, use:',
    create: 'Create guwange-nx.zip',
    step2Update:
      'If the game is already installed and you only want to update it (<code>guwange.nro</code> and the shaders; the game and its title update are still needed to make the shaders), use:',
    createUpdate: 'Create guwange-nx-update.zip',
    step3: '3. Copy it to the Switch',
    step3Extract: 'Extract the downloaded zip into <code>sdmc:/switch/</code>.',
    step3Start:
      'Start <code>guwange.nro</code> from the Homebrew Menu in title takeover mode (<strong>launch</strong> a game installed on the Switch ' +
      `<strong>while holding R</strong>) or create a <strong>39-bit forwarder</strong> with ${SPHAIRA}. The album applet does not give the game enough memory.`,
    step3First:
      'The game writes its settings file, <code>guwange.toml</code>, at its first start (button layout and controls for each player). The first time you play, it compiles the shader variants it has not seen yet, so the first minutes can stutter a little.',
    checking: 'Checking your game…',
    supported: 'Guwange + Title Update #1 · supported',
    unsupported: 'This version of the game is not supported.',
    notGame: 'Not the game',
    noGame: 'The game was not found: choose its content package, or a folder with default.xex, module/ and res/.',
    otherTitle: '{name} is not Guwange.',
    noUpdate: 'Title Update #1 was not found: add its package, or its default.xexp and module/*.dllp',
    updateDifferent: 'the title update is not Title Update #1 (another version, modified or damaged?); nothing was written',
    gameDifferent: "the game's files are not the tested ones (missing, modified or damaged?); nothing was written",
    noStreaming: 'this browser window cannot stream downloads. Use a normal (not private) window.',
    downloadStarted: 'Download started ({size}). Keep this page open until it finishes.',
    finished: 'Finished in {seconds} s.',
    error: 'Error: {message}',
    cancelled: 'the download was cancelled',
    readingFiles: 'Reading your game',
    downloadingBuild: 'Downloading the Switch build',
    logBuild: 'Supported: Guwange for Xbox Live Arcade with Title Update #1 (build {version})',
    logUpdate: 'Update package: guwange.nro and the shaders',
    deko3dShaders: "Making the renderer's {count} shaders from the game's executable and its sprite effects (about a minute)",
    deko3dReady: 'Shaders ready: they match the tested ones',
    packing: 'Writing the package',
    done: 'Done: extract the zip into sdmc:/switch/',
    notSupportedYet: 'this version of the game is not supported. Executable fingerprint: {hash}',
    buildMismatch: 'the downloaded {name} is not the published one ({hash}); try again later',
    deko3dContainers: "the game's shaders were not all found in its files ({found} of {wanted}); nothing was written",
    deko3dMismatch: 'the shaders do not match the tested ones ({hash}); nothing was written',
    downloadFailed: 'could not download {url} ({status})',
  },
  ja: {
    legal:
      'ぐわんげは CAVE Interactive の商標です。アイコンのアートワークは © CAVE です。guwange-nx は非公式のファンプロジェクトであり、CAVE、任天堂、Microsoft とは一切関係がなく、承認や後援も受けていません。Nintendo Switch は任天堂の商標です。Xbox 360 および Xbox Live Arcade は Microsoft の商標です。このサイトはゲームデータや元のゲームの実行ファイルを配布していません。ゲームはブラウザの中だけで読み込まれ、アップロードされることはなく、そこから作られたものはお使いのコンピューターに保存される guwange-nx.zip に直接書き込まれます。正規に入手したゲームが必要です。',
    sourceCode: 'ソースコード',
    signature: 'ChanseyIsTheBest のプロジェクト',
    lead:
      'お手持ちの <strong>ぐわんげ</strong>（Xbox Live Arcade）と <strong>タイトルアップデート #1</strong> から、' +
      '<strong>Nintendo Switch</strong> 用のパッケージを作成します。すべての処理は<strong>このブラウザの中</strong>で行われます。',
    languageBar: '言語',
    step1: '1. ゲームのファイルを選ぶ',
    addFiles: 'ファイルを追加',
    addFolder: 'フォルダーを追加',
    clear: 'クリア',
    ownCopy:
      '<strong>重要：</strong>ご自身の本体から吸い出した、ご自身のゲームが必要です。インストーラーはそれを読み込んでパッケージを作成するだけで、ゲームファイルは一切提供しません。対応しているのは Xbox Live Arcade 版（タイトル 58410A78）とタイトルアップデート #1 の組み合わせのみです。',
    formatHint:
      '<strong>ゲーム：</strong>コンテンツパッケージ ' + GAME_PACKAGE + '（本体では ' + GAME_PATH + ' にあります）、またはそれを展開したフォルダー（<code>default.xex</code>、<code>module/</code>、<code>res/</code> を含むもの）。' +
      '<strong>タイトルアップデート #1：</strong>そのパッケージ（' + UPDATE_PACKAGE + ' など）、またはフォルダー内の ' + UPDATE_FOLDER + '（ゲームのフォルダーでもかまいません）。' +
      '順番に追加しても、両方を含むフォルダーを選んでもかまいません。',
    nothingChosen: 'まだ何も選ばれていません。',
    chosenGame: 'ゲーム：{name}',
    chosenNoGame: 'ゲーム：まだ見つかりません',
    chosenUpdate: 'タイトルアップデート #1：{name}',
    chosenNoUpdate: 'タイトルアップデート #1：まだ見つかりません（必要です）',
    step2: '2. パッケージを作成する',
    step2First: '初めてゲームをインストールする場合：',
    create: 'guwange-nx.zip を作成',
    step2Update:
      'インストール済みで、更新（<code>guwange.nro</code> とシェーダー）だけを行う場合（シェーダーの作成にはゲームとタイトルアップデートが引き続き必要です）：',
    createUpdate: 'guwange-nx-update.zip を作成',
    step3: '3. Switch にコピーする',
    step3Extract: 'ダウンロードした zip を <code>sdmc:/switch/</code> に展開します。',
    step3Start:
      '<strong>タイトル乗っ取りモード</strong>の Homebrew Menu から <code>guwange.nro</code> を起動するか（Switch にインストールされたゲームを <strong>R を押しながら起動</strong>）、' +
      `${SPHAIRA} で <strong>39 ビットのフォワーダー</strong>を作成します。アルバムアプレットではゲームに必要なメモリが足りません。`,
    step3First:
      'ゲームは初回起動時に設定ファイル <code>guwange.toml</code>（ボタン配置と各プレイヤーの操作）を書き込みます。初めてプレイするときは、まだ使っていないシェーダーを準備するため、最初の数分は少しカクつくことがあります。',
    checking: 'ゲームを確認しています…',
    supported: 'ぐわんげ + タイトルアップデート #1 · 対応',
    unsupported: 'このバージョンのゲームには対応していません。',
    notGame: 'ゲームではありません',
    noGame: 'ゲームが見つかりません。コンテンツパッケージ、または default.xex、module/、res/ を含むフォルダーを選んでください。',
    otherTitle: '{name} はぐわんげではありません。',
    noUpdate: 'タイトルアップデート #1 が見つかりません。そのパッケージ、または default.xexp と module/*.dllp を追加してください',
    updateDifferent: 'タイトルアップデートが #1 ではありません（別のバージョン、改変または破損？）。何も書き込まれていません',
    gameDifferent: 'ゲームのファイルがテスト済みのものと異なります（不足、改変または破損？）。何も書き込まれていません',
    noStreaming: 'このブラウザウィンドウではダウンロードをストリーミングできません。通常の（プライベートではない）ウィンドウを使ってください。',
    downloadStarted: 'ダウンロードを開始しました（{size}）。完了するまでこのページを開いたままにしてください。',
    finished: '{seconds} 秒で完了しました。',
    error: 'エラー：{message}',
    cancelled: 'ダウンロードがキャンセルされました',
    readingFiles: 'ゲームを読み込んでいます',
    downloadingBuild: 'Switch 版をダウンロードしています',
    logBuild: '対応：Xbox Live Arcade 版 ぐわんげ + タイトルアップデート #1（ビルド {version}）',
    logUpdate: '更新パッケージ：guwange.nro とシェーダー',
    deko3dShaders: 'ゲームの実行ファイルとスプライトエフェクトからレンダラーの {count} 個のシェーダーを作成しています（1 分ほどかかります）',
    deko3dReady: 'シェーダーの準備ができました（テスト済みのものと一致）',
    packing: 'パッケージを書き込んでいます',
    done: '完了：zip を sdmc:/switch/ に展開してください',
    notSupportedYet: 'このバージョンのゲームには対応していません。実行ファイルのフィンガープリント：{hash}',
    buildMismatch: 'ダウンロードした {name} が公開版と一致しません（{hash}）。しばらくしてからもう一度お試しください',
    deko3dContainers: 'ゲームのシェーダーがファイルにすべて見つかりません（{wanted} 個中 {found} 個）。何も書き込まれていません',
    deko3dMismatch: 'シェーダーがテスト済みのものと一致しません（{hash}）。何も書き込まれていません',
    downloadFailed: '{url} をダウンロードできませんでした（{status}）',
  },
};

let current = 'en';

export function getLanguage() {
  return current;
}

export function setLanguage(code) {
  current = TEXTS[code] ? code : 'en';
  return current;
}

// The visitor's choice (saved in their browser), else the browser's language when it is one of ours, else English.
export function preferredLanguage(saved, browser = []) {
  if (saved && TEXTS[saved]) {
    return saved;
  }
  for (const tag of browser) {
    const code = String(tag).toLowerCase().split('-')[0];
    if (TEXTS[code]) {
      return code;
    }
  }
  return 'en';
}

export function t(key, params = {}) {
  const text = TEXTS[current][key] ?? TEXTS.en[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (_, name) => (params[name] ?? `{${name}}`));
}

// Sizes as Windows Explorer shows them, so the page and the file's properties agree: units of 1024 bytes (which
// Windows calls KB, MB and GB) and three significant digits, truncated. 7,834,892,288 bytes is 7.29 GB, not 7.83.
const SIZE_UNITS = {};

export function formatSize(bytes) {
  const units = SIZE_UNITS[current] ?? ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1000 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  const decimals = value >= 100 ? 0 : value >= 10 ? 1 : 2;
  const scale = 10 ** decimals;
  // The small epsilon keeps values such as 7.3 from becoming 7.29 through floating point.
  const shown = Math.floor(value * scale + 1e-9) / scale;
  const number = new Intl.NumberFormat(current, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return `${number.format(shown)} ${units[unit]}`;
}
