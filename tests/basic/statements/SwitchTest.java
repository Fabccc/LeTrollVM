package tests.basic.statements;

public class SwitchTest {

  public static void main(String[] args) {
    for (int i = 0; i < 3; i++) {
      switch (i) {
      case 0:
        System.out.println("Salut!");
        break;
      case 1:
        System.out.println("Foo");
        break;
      case 2:
        System.out.println("Bar");

        break;
      default:
        break;
      }
    }
    for (int i = 0; i < 3; i++) {
      switch (i) {
      case 0 -> System.out.println("John");
      case 1 -> System.out.println("Doe");
      case 2 -> System.out.println("420");
      default -> System.out.println("none");
      }
    }
  }
}
