const inputText = document.getElementById('inputText');
const charCount = document.getElementById('charCount');
const mainLetterInput = document.getElementById('mainLetter');
const letterPicker = document.getElementById('letterPicker');
const mainLetterButton = document.getElementById('mainLetterButton');
const letterOptions = document.querySelectorAll('.letter-option');
const languageSubtitle = document.getElementById('languageSubtitle');
const outputLabel = document.getElementById('outputLabel');

inputText.addEventListener('input', function() {
    translate(this.value);
    charCount.textContent = this.value.length;
    document.getElementById('output').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

mainLetterButton.addEventListener('click', function() {
    const isOpen = letterPicker.classList.toggle('is-open');
    mainLetterButton.setAttribute('aria-expanded', String(isOpen));
});

letterOptions.forEach((option) => {
    option.addEventListener('click', function() {
        const selectedLetter = this.dataset.letter;
        setMainLetter(selectedLetter);
        letterPicker.classList.remove('is-open');
        mainLetterButton.setAttribute('aria-expanded', 'false');
    });
});

document.addEventListener('click', function(event) {
    if (!letterPicker.contains(event.target)) {
        letterPicker.classList.remove('is-open');
        mainLetterButton.setAttribute('aria-expanded', 'false');
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        letterPicker.classList.remove('is-open');
        mainLetterButton.setAttribute('aria-expanded', 'false');
    }
});

inputText.addEventListener('focus', function() {
    this.select();
});

// Init
charCount.textContent = inputText.value.length;
setMainLetter(mainLetterInput.value);

function translate(inputText) {

    const mainLetter = mainLetterInput.value.toLowerCase();
    const output = translateText(inputText, mainLetter);

    const outputContainer = document.getElementById('output');
    outputContainer.textContent = output;
}

function translateText(text, mainLetter) {

    let translatedText = '';
    let currentChar = '';
    let nextChar = '';
    let secondVowel = '';

    for (let i = 0; i < text.length; i++) {
        currentChar = text[i];
        nextChar = text[i + 1] ?? '';

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

    return translatedText;
}

function updateLanguageTexts(mainLetter) {
    const normalizedLetter = mainLetter.toLowerCase();
    const upperLetter = normalizedLetter.toUpperCase();
    const languageName = `${upperLetter}-Sprache`;
    const translatedTranslatorWord = translateText('Übersetzer', normalizedLetter);

    document.title = `🗣️ ${languageName}`;
    languageSubtitle.textContent = `Der ultimative ${languageName}-${translatedTranslatorWord}! ✨`;
    outputLabel.innerHTML = '<span class="icon">🪄</span> In ' + languageName;
}

function setMainLetter(letter) {
    const normalizedLetter = letter.toLowerCase();
    mainLetterInput.value = normalizedLetter;
    mainLetterButton.textContent = normalizedLetter.toUpperCase();

    letterOptions.forEach((option) => {
        const isActive = option.dataset.letter === normalizedLetter;
        option.classList.toggle('is-active', isActive);
        option.setAttribute('aria-selected', String(isActive));
    });

    updateLanguageTexts(normalizedLetter);
    translate(inputText.value);
}

function isValidDoubleVowel(char1, char2) {
    return ['ei', 'ie', 'aa', 'ee', 'oo', 'au', 'eu', 'äu', 'ai'].includes(char1 + char2);
}

function isVowel(char) {
    return ['a', 'e', 'i', 'o', 'u', 'ä', 'ö', 'ü'].includes(char);
}
