const inputText = document.getElementById('inputText');
inputText.addEventListener('keyup', function() {
    translate(this.value);
});
inputText.dispatchEvent(new Event('keyup'));

function translate(inputText) {

    const mainLetter = 'b';

    let translatedText = '';
    let currentChar = '';
    let nextChar = '';
    let secondVowel = '';

    for (let i = 0; i < inputText.length; i++) {
        currentChar = inputText[i];
        nextChar = inputText[i + 1] ?? '';

        translatedText += currentChar;
        if (isVowel(currentChar.toLowerCase())) {
            if (isVowel(nextChar.toLowerCase()) && isValidDoubleVowel(currentChar.toLowerCase(), nextChar.toLowerCase())) {
                secondVowel = currentChar.toLowerCase();
            } else {
                translatedText += mainLetter + secondVowel + currentChar.toLowerCase();
                secondVowel = '';
            }
        }

    }

    let output = translatedText;

    let outputContainer = document.getElementById('output');
    outputContainer.textContent = output;
}

function isValidDoubleVowel(char1, char2) {
    return ['ei', 'ie', 'aa', 'ee', 'oo', 'au', 'eu', 'äu', 'ai'].includes(char1 + char2);
}

function isVowel(char) {
    return ['a', 'e', 'i', 'o', 'u', 'ä', 'ö', 'ü'].includes(char);
}
