package de.rothauer.bsprache;

import android.app.Activity;
import android.app.Dialog;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.Gravity;
import android.view.View;
import android.view.animation.OvershootInterpolator;
import android.widget.EditText;
import android.widget.GridLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Button;
import android.widget.Toast;
import java.util.Locale;

public class MainActivity extends Activity {
    private static final String PREFS = "settings";
    private static final String KEY_LETTER = "mainLetter";

    private EditText input;
    private TextView output;
    private TextView letterView;
    private TextView subtitle;
    private TextView outputLabel;
    private TextView charCount;
    private View talkingB;
    private long lastHop;
    private String mainLetter = "b";
    private Button speakButton;
    private TextToSpeech tts;
    private boolean ttsReady;
    private boolean speaking;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        input = findViewById(R.id.input);
        output = findViewById(R.id.output);
        letterView = findViewById(R.id.letter);
        subtitle = findViewById(R.id.subtitle);
        outputLabel = findViewById(R.id.output_label);
        charCount = findViewById(R.id.char_count);
        talkingB = findViewById(R.id.talkingB);
        talkingB.setOnClickListener(v -> wiggle());
        letterView.setOnClickListener(v -> showLetterPicker());

        mainLetter = getSharedPreferences(PREFS, MODE_PRIVATE).getString(KEY_LETTER, "b");

        input.addTextChangedListener(new TextWatcher() {
            @Override public void beforeTextChanged(CharSequence s, int a, int b, int c) {}
            @Override public void onTextChanged(CharSequence s, int a, int b, int c) {}
            @Override public void afterTextChanged(Editable s) {
                updateOutput();
                hop();
            }
        });

        if (savedInstanceState == null) {
            String shared = sharedText(getIntent());
            input.setText(shared != null ? shared : getString(R.string.default_text));
            input.setSelection(input.getText().length());
        }
        updateLanguageTexts();
        updateOutput();

        speakButton = findViewById(R.id.speak);
        speakButton.setOnClickListener(v -> toggleSpeak());
        initTts();

        findViewById(R.id.clear).setOnClickListener(v -> input.setText(""));
        findViewById(R.id.copy).setOnClickListener(v -> {
            ClipboardManager cm = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
            cm.setPrimaryClip(ClipData.newPlainText(getString(R.string.app_name), output.getText()));
            Toast.makeText(this, R.string.copied, Toast.LENGTH_SHORT).show();
        });
        findViewById(R.id.share).setOnClickListener(v -> {
            Intent send = new Intent(Intent.ACTION_SEND);
            send.setType("text/plain");
            send.putExtra(Intent.EXTRA_TEXT, output.getText().toString());
            startActivity(Intent.createChooser(send, getString(R.string.share)));
        });
    }

    /** Sprachausgabe vorbereiten: deutsche Stimme, etwas langsamer für die vielen Silben. */
    private void initTts() {
        tts = new TextToSpeech(this, status -> {
            if (status != TextToSpeech.SUCCESS) return;
            int r = tts.setLanguage(Locale.GERMANY);
            if (r == TextToSpeech.LANG_MISSING_DATA || r == TextToSpeech.LANG_NOT_SUPPORTED) {
                r = tts.setLanguage(Locale.GERMAN);
            }
            if (r == TextToSpeech.LANG_MISSING_DATA || r == TextToSpeech.LANG_NOT_SUPPORTED) {
                runOnUiThread(() -> {
                    Toast.makeText(this, R.string.tts_missing, Toast.LENGTH_LONG).show();
                    try {
                        startActivity(new Intent(TextToSpeech.Engine.ACTION_INSTALL_TTS_DATA));
                    } catch (Exception ignored) { }
                });
                return;
            }
            tts.setSpeechRate(0.9f);
            tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                @Override public void onStart(String id) { runOnUiThread(() -> setSpeaking(true)); }
                @Override public void onDone(String id) { runOnUiThread(() -> setSpeaking(false)); }
                @Override public void onError(String id) { runOnUiThread(() -> setSpeaking(false)); }
                @Override public void onStop(String id, boolean interrupted) { runOnUiThread(() -> setSpeaking(false)); }
            });
            ttsReady = true;
        });
    }

    private void toggleSpeak() {
        if (tts == null) {
            Toast.makeText(this, R.string.tts_unavailable, Toast.LENGTH_SHORT).show();
            return;
        }
        if (!ttsReady) {
            Toast.makeText(this, R.string.tts_not_ready, Toast.LENGTH_SHORT).show();
            return;
        }
        if (speaking) {
            tts.stop();
            setSpeaking(false);
            return;
        }
        String text = output.getText().toString().trim();
        if (text.isEmpty()) return;
        tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "bsprache");
    }

    private void setSpeaking(boolean on) {
        speaking = on;
        speakButton.setText(on ? R.string.stop : R.string.speak);
        if (on) { lastHop = 0; hop(); }
    }

    @Override
    protected void onStop() {
        super.onStop();
        if (tts != null && speaking) tts.stop();
    }

    @Override
    protected void onDestroy() {
        if (tts != null) tts.shutdown();
        super.onDestroy();
    }

    private void updateOutput() {
        String text = input.getText().toString();
        output.setText(BSprache.translate(text, mainLetter));
        charCount.setText(getString(R.string.char_count, text.length()));
    }

    /** Titel, Untertitel und Ausgabe-Label an den Buchstaben anpassen (wie updateLanguageTexts im Web). */
    private void updateLanguageTexts() {
        String upper = mainLetter.toUpperCase();
        String languageName = upper + getString(R.string.suffix);
        letterView.setText(upper + "▾");
        subtitle.setText(getString(R.string.subtitle, languageName,
                BSprache.translate(getString(R.string.translator_word), mainLetter)));
        outputLabel.setText(getString(R.string.label_output, languageName));
    }

    private void setMainLetter(String letter) {
        mainLetter = letter.toLowerCase();
        getSharedPreferences(PREFS, MODE_PRIVATE).edit().putString(KEY_LETTER, mainLetter).apply();
        updateLanguageTexts();
        updateOutput();
        wiggle();
    }

    /** Buchstaben-Raster: alle Konsonanten, der aktive ist hervorgehoben. */
    private void showLetterPicker() {
        float d = getResources().getDisplayMetrics().density;
        Dialog dialog = new Dialog(this);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundResource(R.drawable.dialog_bg);
        int pad = (int) (20 * d);
        root.setPadding(pad, pad, pad, pad);

        TextView title = new TextView(this);
        title.setText(R.string.pick_letter);
        title.setTextSize(20);
        title.setTextColor(getColor(R.color.text));
        title.setTypeface(android.graphics.Typeface.create("sans-serif-black", android.graphics.Typeface.NORMAL));
        title.setGravity(Gravity.CENTER);
        title.setPadding(0, 0, 0, (int) (14 * d));
        root.addView(title);

        GridLayout grid = new GridLayout(this);
        grid.setColumnCount(5);
        int size = (int) (52 * d);
        int margin = (int) (4 * d);
        for (char c : BSprache.LETTERS.toCharArray()) {
            String letter = String.valueOf(c);
            boolean active = letter.equals(mainLetter);
            TextView option = new TextView(this);
            option.setText(letter.toUpperCase());
            option.setGravity(Gravity.CENTER);
            option.setTextSize(22);
            option.setTypeface(android.graphics.Typeface.create("sans-serif-black", android.graphics.Typeface.NORMAL));
            option.setTextColor(active ? Color.WHITE : getColor(R.color.output_text));
            option.setBackgroundResource(active ? R.drawable.letter_option_active : R.drawable.letter_option);
            option.setContentDescription(letter.toUpperCase() + getString(R.string.suffix));
            option.setOnClickListener(v -> {
                dialog.dismiss();
                setMainLetter(letter);
            });
            GridLayout.LayoutParams lp = new GridLayout.LayoutParams();
            lp.width = size;
            lp.height = size;
            lp.setMargins(margin, margin, margin, margin);
            grid.addView(option, lp);
        }
        LinearLayout.LayoutParams gridLp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        gridLp.gravity = Gravity.CENTER_HORIZONTAL;
        root.addView(grid, gridLp);

        dialog.setContentView(root);
        if (dialog.getWindow() != null) {
            dialog.getWindow().setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT));
        }
        dialog.show();
    }

    /** Kleiner Hüpfer beim Tippen (höchstens alle 400 ms). */
    private void hop() {
        long now = System.currentTimeMillis();
        if (talkingB == null || now - lastHop < 400) return;
        lastHop = now;
        float h = -12 * getResources().getDisplayMetrics().density;
        talkingB.animate().translationY(h).setDuration(120).withEndAction(() ->
            talkingB.animate().translationY(0).setInterpolator(new OvershootInterpolator(3f)).setDuration(260).start()
        ).start();
    }

    /** Antippen: das B wackelt hin und her. */
    private void wiggle() {
        talkingB.animate().cancel();
        talkingB.setRotation(0);
        talkingB.animate().rotation(-14).setDuration(90).withEndAction(() ->
            talkingB.animate().rotation(12).setDuration(140).withEndAction(() ->
                talkingB.animate().rotation(0).setInterpolator(new OvershootInterpolator(4f)).setDuration(300).start()
            ).start()
        ).start();
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        String shared = sharedText(intent);
        if (shared != null) input.setText(shared);
    }

    private static String sharedText(Intent intent) {
        if (intent != null && Intent.ACTION_SEND.equals(intent.getAction())) {
            CharSequence t = intent.getCharSequenceExtra(Intent.EXTRA_TEXT);
            return t != null ? t.toString() : null;
        }
        return null;
    }
}
