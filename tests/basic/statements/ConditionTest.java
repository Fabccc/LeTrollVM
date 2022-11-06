package tests.basic.statements;

public class ConditionTest {

  public static void main(String[] args) {
    int a = 4;
    int b = 19;
    if (a > b) {
      System.out.println("A");
    }
    if (a < b) {
      System.out.println("B");
    }
    if (a <= b) {
      System.out.println("C");
    }
    if (a == b) {
      System.out.println("D");
    } else {
      System.out.println("E");
    }
  }
}
