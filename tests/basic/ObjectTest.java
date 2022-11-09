package tests.basic;

public class ObjectTest {

  public static void main(String[] args) {

    B person = new B("Walter White", 69);
    System.out.println("Hi ! I'm " + person.getName() + " and I'm " +
                       person.getAge() + " years old.");
    System.out.println(person);
  }

  public static class A {

    private String name;

    public A(String name) { this.name = name; }

    /**
     * @return the name
     */
    public String getName() { return name; }

    @Override
    public String toString() {
      return "{Class A:" + this.name + "}";
    }
  }

  public static class B extends A {

    private int age;

    public B(String name, int age) {
      super(name);
      this.age = age;
    }

    /**
     * @return the age
     */
    public int getAge() { return age; }
  }
}
