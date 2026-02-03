const { readFileSync, writeFileSync, existsSync, rmSync, mkdirSync, cpSync } = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const serverDir = path.resolve(__dirname, '..');
const buildJsonPath = path.resolve(__dirname, 'build.json');
const distDir = path.resolve(serverDir, 'dist');
const envProductionPath = path.resolve(serverDir, '.env.production');
const tempDir = path.resolve(__dirname, '.temp');

// 读取 build.json（不存在则自动创建）
if (!existsSync(buildJsonPath)) {
  console.log('build.json 不存在，正在创建...');
  writeFileSync(buildJsonPath, JSON.stringify({ version: '0.0.0', history: [] }, null, 2) + '\n');
}

// 检查 dist 目录
if (!existsSync(distDir)) {
  console.error('dist 目录不存在，请先运行 npm run build');
  process.exit(1);
}

const buildInfo = JSON.parse(readFileSync(buildJsonPath, 'utf-8'));

// 版本号 +1
const versionParts = buildInfo.version.split('.').map(Number);
versionParts[2] += 1;
const newVersion = versionParts.join('.');

const zipName = `server-v${newVersion}.zip`;
const zipPath = path.resolve(__dirname, zipName);

console.log(`开始构建 v${newVersion}...`);

// 清理临时目录
if (existsSync(tempDir)) {
  rmSync(tempDir, { recursive: true, force: true });
}
mkdirSync(tempDir, { recursive: true });

// 复制必要文件
console.log('复制文件...');
cpSync(distDir, path.resolve(tempDir, 'dist'), { recursive: true });
cpSync(path.resolve(serverDir, 'package.json'), path.resolve(tempDir, 'package.json'));
if (existsSync(path.resolve(serverDir, 'package-lock.json'))) {
  cpSync(path.resolve(serverDir, 'package-lock.json'), path.resolve(tempDir, 'package-lock.json'));
}

// 复制 .env.production 文件
if (existsSync(envProductionPath)) {
  cpSync(envProductionPath, path.resolve(tempDir, '.env.production'));
  console.log('已复制 .env.production 文件');
}

// 创建空的 uploads 目录
mkdirSync(path.resolve(tempDir, 'uploads'), { recursive: true });
console.log('已创建空的 uploads 目录');

// 安装生产依赖
console.log('安装生产依赖（这可能需要一些时间）...');
execSync('npm ci --omit=dev', {
  cwd: tempDir,
  stdio: 'inherit'
});

// 打包
console.log(`正在打包 -> builds/${zipName}`);
execSync(`cd "${tempDir}" && zip -rq "${zipPath}" .`, {
  maxBuffer: 1024 * 1024 * 100 // 100MB
});

// 清理临时目录
console.log('清理临时文件...');
rmSync(tempDir, { recursive: true, force: true });

// 更新 build.json
buildInfo.version = newVersion;
buildInfo.history.push({
  version: newVersion,
  file: zipName,
  date: new Date().toISOString()
});

writeFileSync(buildJsonPath, JSON.stringify(buildInfo, null, 2) + '\n');

console.log(`\n构建完成: builds/${zipName} (v${newVersion})`);
console.log('部署方式: 解压后运行 npm run start:prod');
