let urlParams = new URLSearchParams(window.location.search);
let lowestNumber = urlParams.get('niedrigsteZahl');
if (lowestNumber === null) {
    lowestNumber = 30000;
}
let highestNumber = urlParams.get('hoechsteZahl');
if (highestNumber === null) {
    highestNumber = 50000;
}
let niedrigsteZahl = parseInt(lowestNumber);
let hoechsteZahl = parseInt(highestNumber);

document.getElementById('niedrigsteZahl').value = niedrigsteZahl;
document.getElementById('hoechsteZahl').value = hoechsteZahl;

let outputContainer = document.getElementById('output');

let countPrimes = 0;
let startTime = performance.now(); // Start time

// Sieve of Eratosthenes
let sieve = new Array(hoechsteZahl + 1).fill(true);
sieve[0] = sieve[1] = false;

for (let i = 2; i * i <= hoechsteZahl; i++) {
    if (sieve[i]) {
        for (let j = i * i; j <= hoechsteZahl; j += i) {
            sieve[j] = false;
        }
    }
}

let primeContainer = document.createElement('div');
primeContainer.style.display = 'grid';
primeContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(60px, 1fr))';
primeContainer.style.gap = '0';
primeContainer.style.marginTop = '10px';
outputContainer.appendChild(primeContainer);

function renderNumber(zahl) {
    let primeElement = document.createElement('div');
    primeElement.style.color = '#999';
    primeElement.style.border = '1px solid #ccc';
    primeElement.style.padding = '2px';
    primeElement.style.textAlign = 'center';
    primeElement.style.fontSize = '12px';

    if (isPrime(zahl)) {
        primeElement.style.color = 'blue';
        primeElement.style.fontWeight = 'bold';
        countPrimes++;
    }

    primeElement.innerHTML = zahl.toLocaleString();
    primeContainer.appendChild(primeElement);

}

function renderNumbersInstantly() {
    for (let zahl = niedrigsteZahl; zahl <= hoechsteZahl; zahl++) {
        renderNumber(zahl);
    }

    let endTime = performance.now(); // End time
    let runtime = ((endTime - startTime) / 1000).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    outputContainer.innerHTML = 'Anzahl Primzahlen von ' + niedrigsteZahl.toLocaleString() + ' bis ' + hoechsteZahl.toLocaleString() + ': <b>' + countPrimes.toLocaleString() + '</b><br />' + 'Laufzeit: <b>' + runtime + ' sec</b><br />' + outputContainer.innerHTML;
}

renderNumbersInstantly();

function isPrime(zahl) {
    return sieve[zahl];
}
