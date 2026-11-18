package de.rothauer.bsprache;

/**
 * Port of b-sprache/b-sprache.js: after every vowel, insert the main letter (default "b") + the vowel.
 * Valid double vowels (ei, au, ...) are treated as one sound: "ei" -> "eibei".
 */
public final class BSprache {
    /** Auswählbare Hauptbuchstaben (wie im Web-Original: alle Konsonanten). */
    public static final String LETTERS = "bcdfghjklmnpqrstvwxyz";
    private static final String VOWELS = "aeiouäöü";
    private static final String[] DOUBLE_VOWELS = {"ei", "ie", "aa", "ee", "oo", "au", "eu", "äu", "ai"};

    private BSprache() {}

    public static String translate(String input) {
        return translate(input, "b");
    }

    public static String translate(String input, String mainLetter) {
        StringBuilder out = new StringBuilder(input.length() * 2);
        String secondVowel = "";
        for (int i = 0; i < input.length(); i++) {
            char current = input.charAt(i);
            char lower = Character.toLowerCase(current);
            out.append(current);
            if (isVowel(lower)) {
                boolean hasNext = i + 1 < input.length();
                char nextLower = hasNext ? Character.toLowerCase(input.charAt(i + 1)) : 0;
                if (hasNext && isVowel(nextLower) && isValidDoubleVowel(lower, nextLower)) {
                    secondVowel = String.valueOf(lower);
                } else {
                    out.append(mainLetter.toLowerCase()).append(secondVowel).append(lower);
                    secondVowel = "";
                }
            }
        }
        return out.toString();
    }

    private static boolean isVowel(char c) {
        return VOWELS.indexOf(c) >= 0;
    }

    private static boolean isValidDoubleVowel(char a, char b) {
        String pair = "" + a + b;
        for (String d : DOUBLE_VOWELS) {
            if (d.equals(pair)) return true;
        }
        return false;
    }
}
