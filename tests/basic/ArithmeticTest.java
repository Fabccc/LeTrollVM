package tests.basic;

public class ArithmeticTest {

  public static void main(String[] args) {
    int a = 35;
    int b = 34;
    long l = 1000000000;
    double d = 1234.5678D;
    float f = 12.34f;

    // Addition
    System.out.println(a + b);
    System.out.println(a + l);
    System.out.println(l + l);
    System.out.println(d + l);
    System.out.println(f + a);
    System.out.println(f + d);

    // Substraction
    System.out.println(a - b);
    System.out.println(a - l);
    System.out.println(l - l);
    System.out.println(d - l);
    System.out.println(f - a);
    System.out.println(f - d);

    // Multiplication
    System.out.println(a * b);
    System.out.println(a * l);
    System.out.println(l * l);
    System.out.println(d * l);
    System.out.println(f * a);
    System.out.println(f * d);
    // Division
    System.out.println(a / b);
    System.out.println(a / l);
    System.out.println(l / l);
    System.out.println(d / l);
    System.out.println(f / a);
    System.out.println(f / d);
    // Modulo
    System.out.println(a % b);
    System.out.println(a % l);
    System.out.println(l % l);
    System.out.println(d % l);
    System.out.println(f % a);
    System.out.println(f % d);
    // Bit operation
    // And
    System.out.println(a & 0x05);
    // Or
    System.out.println(b | 0xF1);
    // Shift left
    System.out.println(a << 3);
    // Shift right
    System.out.println(a >> 3);
  }
}
