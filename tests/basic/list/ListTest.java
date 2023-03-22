package tests.basic.list;

import java.util.ArrayList;
import java.util.List;

public class ListTest {
  
  public static void main(String[] args) {
    
    List<Integer> list = new ArrayList<>();
    System.out.println(list.size());
    list.add(5);
    list.add(2);
    list.add(26);
    list.add(694205);
    System.out.println(list);
    list.remove(3);
    list.remove(0);
    System.out.println(list);
    System.out.println(list.size());

    for(int i : list){
      System.out.println(i);
    }

  }

}
