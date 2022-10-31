package runtime.list;

import java.util.ArrayList;
import java.util.List;

public class ListIntPrint {

  public static void main(String[] args) {

    List<Integer> ints = new ArrayList<>();
    ints.forEach(System.out::println);
    ints.forEach(i -> System.out.println(i));
    
  }
}
