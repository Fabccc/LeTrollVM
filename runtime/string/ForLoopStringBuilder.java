package runtime.string;

public class ForLoopStringBuilder {
  
  public static void main(String[] args) {
    String s1 = "Salut ! ";
    for(int i = 0; i < 10; i++){
      s1 += " "+i;
    }
    System.out.println(s1);
  }

}
