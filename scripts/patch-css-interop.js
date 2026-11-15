const fs = require('fs');
const path = require('path');

const targetFile = path.join(
  __dirname,
  '../node_modules/react-native-css-interop/dist/runtime/native/render-component.js'
);

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');
  if (content.includes('seen.delete(value)')) {
    content = content.replace(
      /function printUpgradeWarning\(warning, originalProps\) \{[\s\S]*?function stringify\(object\) \{[\s\S]*?\n\}/,
      `function printUpgradeWarning(warning, originalProps) {
    try {
        console.warn(\`[CssInterop upgrade warning]: \${warning}\`);
    } catch {}
}
function stringify(object) {
    return "[Props]";
}`
    );
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('Successfully patched react-native-css-interop');
  }
}
