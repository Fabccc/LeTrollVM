package runtime;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

public class JUnitTest {

  public static void main(String[] args) {
    var junit = new JUnitTest();
    junit.testLoteryPercentageAccuracy();
  }

  public static void assertEquals(double d1, double d2, double delta) {
    if (Math.abs(d1 - d2) > delta) {
      throw new RuntimeException("Assertion failed");
    }
  }

  public static class Pair<U, V> {

    private U first;
    private V second;
    /**
     * @param first
     * @param second
     */
    public Pair(U first, V second) {
      this.first = first;
      this.second = second;
    }
    public U get1() { return this.first; }
    public V get2() { return this.second; }
  }

  public void testLoteryPercentageAccuracy() {

    List<LoteryRewardStub> rewards =
        List.of(new LoteryRewardStub(200, "dirt", UUID.randomUUID()),
                new LoteryRewardStub(200, "ironblock", UUID.randomUUID()),
                new LoteryRewardStub(100, "podzol", UUID.randomUUID()),
                new LoteryRewardStub(100, "diamond", UUID.randomUUID()),
                new LoteryRewardStub(15, "gapple", UUID.randomUUID()),
                new LoteryRewardStub(5, "enma", UUID.randomUUID()),
                new LoteryRewardStub(5, "800torii", UUID.randomUUID()));
    final double totalProbability = getTotalProbability(rewards);
    final double maxRoll = 10_000_000;

    Map<LoteryRewardStub, AtomicInteger> map = new HashMap<>();
    rewards.forEach(r -> { map.put(r, new AtomicInteger(0)); });

    for (int i = 0; i < maxRoll; i++) {
      var generated = generateReward(totalProbability, rewards);
      map.get(generated).incrementAndGet();
    }

    for (var entry : map.entrySet()) {
      double count = entry.getValue().doubleValue();
      double realPercentage = count / maxRoll;
      double expectedPercentage = entry.getKey().percentage / totalProbability;
      assertEquals(expectedPercentage, realPercentage, 0.01);
    }
  }

  public double getTotalProbability(List<LoteryRewardStub> stubs) {
    return stubs.stream().mapToDouble(LoteryRewardStub::percentage).sum();
  }

  public LoteryRewardStub get(List<LoteryRewardStub> stubs, UUID id) {
    return stubs.stream().filter(r -> r.id.equals(id)).findFirst().orElse(null);
  }

  private LoteryRewardStub generateReward(double probabilitySums,
                                          List<LoteryRewardStub> stubs) {
    var temp = new ArrayList<>(stubs);
    Collections.sort(temp);

    List<Pair<UUID, Double>> list = new ArrayList<>();

    double start = 0;
    double randomIndex = start;
    double end = probabilitySums;

    for (var reward : stubs) {
      double currIndex = randomIndex + (reward.percentage() / end);
      list.add(new Pair<>(reward.id(), currIndex));
      randomIndex = currIndex;
    }
    try {
      double random = NumberUtils.randomD();
      for (Pair<UUID, Double> reward : list) {
        if (reward.get2() >= random) {
          return get(stubs, reward.get1());
        }
      }
    } catch (Exception e) {
      e.printStackTrace();
    }

    return temp.get(temp.size() - 1);
  }

  public record LoteryRewardStub(double percentage, String name, UUID id)
      implements Comparable<LoteryRewardStub> {

    @Override
    public int compareTo(JUnitTest.LoteryRewardStub o) {
      if (this.percentage < o.percentage) {
        return 1;
      }
      if (this.percentage > o.percentage) {
        return -1;
      }
      return 0;
    }
  }
}
