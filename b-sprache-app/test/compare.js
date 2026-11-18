// Runs translateText() from the original b-sprache.js on each line of the input file.
// Usage: node compare.js <cases.txt> [letter]
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/../../b-sprache/b-sprache.js', 'utf8');
// Only take the pure functions; the rest of the file needs a browser DOM.
const fns = ['translateText', 'isValidDoubleVowel', 'isVowel']
  .map((name) => src.match(new RegExp('function ' + name + '\\([\\s\\S]*?\\n}'))[0]).join('\n');
const translateText = new Function(fns + '; return translateText;')();
const letter = process.argv[3] || 'b';
for (const line of fs.readFileSync(process.argv[2], 'utf8').replace(/\n$/, '').split('\n')) {
  console.log(translateText(line, letter));
}
