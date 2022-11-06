package tests.basic.statements;

public class LoopTest {

  public static void main(String[] args) {
    for (int i = 0; i < 10; i++) {
      System.out.println(i);
    }
    for (int i = 0; i < 2; i++) {
      for (int j = 0; j < 2; j++) {
        System.out.println(i + j);
      }
    }
    int i = 10;
    while (i > 0) {
      i--;
      System.out.println(i);
    }
    i = 10;
    do {
      i--;
      System.out.println(i);
    } while (i > 0);
  }
}
