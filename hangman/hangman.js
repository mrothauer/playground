class Hangman {

    constructor() {
        this.words = [];
    }

    setWords(words) {
        this.words = words;
    }

    getRandWord() {
        return this.words[Math.floor(Math.random() * this.words.length)];
    }

}

const hangman = new Hangman();
hangman.setWords(words);
const word = hangman.getRandWord();

// render the word to output
const output = document.getElementById('output');

// output the length of the word
output.innerHTML = word.split('').map(letter => '_').join(' ');