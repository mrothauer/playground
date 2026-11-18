import de.rothauer.bsprache.BSprache;
import java.nio.file.*;
// Usage: java Compare <cases.txt> [letter]
public class Compare {
  public static void main(String[] a) throws Exception {
    String letter = a.length > 1 ? a[1] : "b";
    for (String line : Files.readAllLines(Paths.get(a[0]))) System.out.println(BSprache.translate(line, letter));
  }
}
