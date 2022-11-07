package tests.basic;

public class EnumTest {

  public static void main(String[] args) {
    System.out.println(Test.VERSION1.a);
    System.out.println(Test.VERSION1.b);
    System.out.println(Test.VERSION1.c);
    System.out.println(Test.VERSION1.ordinal());
    System.out.println(Test.VERSION1.name());
    System.out.println(Test.VERSION1);

    System.out.println(Test.VERSION2.a);
    System.out.println(Test.VERSION2.b);
    System.out.println(Test.VERSION2.c);
    System.out.println(Test.VERSION2.ordinal());
    System.out.println(Test.VERSION2.name());
    System.out.println(Test.VERSION2);
  }

  public static enum Test {

    VERSION1("Salut!", 1, 3.14),
    VERSION2("Hello!", -1, 420.69);

    String a;
    int b;
    double c;

    Test(String a, int b, double c) {
      this.a = a;
      this.b = b;
      this.c = c;
    }
  }
}
