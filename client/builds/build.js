import { readFileSync, writeFileSync, existsSync, rmSync } from 'fs';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const clientDir = resolve(__dirname, '..');
const buildJsonPath = resolve(__dirname, 'build.json');
const buildDir = resolve(clientDir, 'build');
const envProductionPath = resolve(clientDir, '.env.production');

// 读取 build.json（不存在则自动创建）
if (!existsSync(buildJsonPath)) {
  console.log('build.json 不存在，正在创建...');
  writeFileSync(buildJsonPath, JSON.stringify({ version: '0.0.0', history: [] }, null, 2) + '\n');
}

if (!existsSync(buildDir)) {
  console.error('build 目录不存在，请先运行 npm run build');
  process.exit(1);
}

// 创建 .env 文件到 build 目录（用于 SSR 运行时）
if (existsSync(envProductionPath)) {
  const envContent = readFileSync(envProductionPath, 'utf-8');
  // 提取 SERVER_URL 行
  const serverUrlMatch = envContent.match(/^SERVER_URL\s*=\s*(.+)$/m);
  if (serverUrlMatch) {
    const envFile = `SERVER_URL=${serverUrlMatch[1].trim()}\n`;
    writeFileSync(resolve(buildDir, '.env'), envFile);
    console.log('已创建 .env 文件');
  }
}

const buildInfo = JSON.parse(readFileSync(buildJsonPath, 'utf-8'));

// 版本号 +1（语义化版本，patch +1）
const versionParts = buildInfo.version.split('.').map(Number);
versionParts[2] += 1; // patch 版本 +1
const newVersion = versionParts.join('.');

const zipName = `client-v${newVersion}.zip`;
const zipPath = resolve(__dirname, zipName);

// 打包 build 目录为 zip
console.log(`正在打包 build 目录 -> builds/${zipName}`);
execSync(`cd "${buildDir}" && zip -r "${zipPath}" .`);

// 删除 build 目录
console.log('正在删除 build 目录...');
rmSync(buildDir, { recursive: true, force: true });

// 更新 build.json
buildInfo.version = newVersion;
buildInfo.history.push({
  version: newVersion,
  file: zipName,
  date: new Date().toISOString()
});

writeFileSync(buildJsonPath, JSON.stringify(buildInfo, null, 2) + '\n');

console.log(`构建完成: builds/${zipName} (v${newVersion})`);
