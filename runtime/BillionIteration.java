package runtime;

public interface BillionIteration {
  public static void main(String[] args) {
    System.out.println("start");
    int b = 1;
    for (long i = 0; i < 1_000_000; i++) {
      b = 1;
    }
    System.out.println("end " + b);
  }
}
