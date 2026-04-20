const fs = require('fs');
const path = require('path');

// 转换单个文件
function convertFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // 替换 div 为 view
  content = content.replace(/<div/g, '<view');
  content = content.replace(/<\/div>/g, '</view>');

  // 替换 @click 为 @tap
  content = content.replace(/@click/g, '@tap');

  // 替换 img 为 image
  content = content.replace(/<img/g, '<image');

  // 替换 router.push 为 uni.navigateTo
  content = content.replace(/router\.push\(/g, 'uni.navigateTo({ url: ');

  // 替换 router.back 为 uni.navigateBack
  content = content.replace(/router\.back\(\)/g, 'uni.navigateBack()');

  // 移除 vue-router 导入
  content = content.replace(/import.*from ['"]vue-router['"]\n/g, '');
  content = content.replace(/const router = useRouter\(\)\n/g, '');

  // 移除 lucide-vue-next 导入
  content = content.replace(/import.*from ['"]lucide-vue-next['"]\n/g, '');

  // 移除 gap 属性
  content = content.replace(/gap:\s*[^;]+;/g, '');

  return content;
}

// 转换目录下所有 .vue 文件
function convertDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      convertDirectory(filePath);
    } else if (file.endsWith('.vue')) {
      console.log('Converting:', filePath);
      const converted = convertFile(filePath);
      fs.writeFileSync(filePath, converted, 'utf-8');
    }
  });
}

// 开始转换
const pagesDir = path.join(__dirname, 'src', 'pages');
convertDirectory(pagesDir);
console.log('Conversion completed!');
