class Hangman {

    constructor() {
        this.words = [];
        this.word = '';
        this.typedLetters = [];
        this.setWords(words);
        this.setWord();
        this.bindLetterEvents();
    }

    bindLetterEvents() {
        const letters = 'abcdefghijklmnopqrstuvwxyzäöüß';
        letters.split('').forEach(letter => {
            document.addEventListener('keypress', (event) => {
                if (event.key.toLowerCase() === letter) {
                    this.typedLetters.push(letter);
                    this.typedLetters = [...new Set(this.typedLetters)];
                    this.checkTypedLetters();
                }
            });
        });
    }

    setWords(words) {
        this.words = words;
    }

    setWord() {
        this.word = this.words[Math.floor(Math.random() * this.words.length)];
    }

    getWord() {
        return this.word;
    }

    checkTypedLetters() {
        const wordOutput = this.word.split('').map(letter => {
            if (this.typedLetters.includes(letter.toLocaleLowerCase())) {
                return letter;
            }
            return '_';
        }).join(' ');

        const wordContainer = document.getElementById('word');
        wordContainer.innerHTML = wordOutput;
    }

    getWordOutput() {
        return this.word.split('').map(letter => '_').join(' ');
    }

    render() {
        const wordContainer = document.getElementById('word');
        wordContainer.innerHTML = this.getWordOutput();
    }

}

const hangman = new Hangman();
const word = hangman.getWord();

// render the word to output
console.log(word);
hangman.render();

