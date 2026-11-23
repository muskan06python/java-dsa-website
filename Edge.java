
/**
 * Represents a path (edge) from one location to another,
 * with a weight (distance in meters, or time in minutes).
 */
public class Edge {
    String destination;
    double weight;

    public Edge(String destination, double weight) {
        this.destination = destination;
        this.weight = weight;
    }
}