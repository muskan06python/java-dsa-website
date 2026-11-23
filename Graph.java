import java.util.*;
/**
 * Campus graph represented as a weighted, undirected adjacency list.
 * Nodes = campus locations (buildings, gates, etc.)
 * Edges = walkable paths between them, weighted by distance.
 */
public class Graph {

    private final Map<String, List<Edge>> adjList = new HashMap<>();

    /** Add a location (node) to the graph if it doesn't already exist. */
    public void addLocation(String name) {
        adjList.putIfAbsent(name, new ArrayList<>());
    }

    /** Add a bidirectional path between two locations with a given distance. */
    public void addPath(String from, String to, double distance) {
        addLocation(from);
        addLocation(to);
        adjList.get(from).add(new Edge(to, distance));
        adjList.get(to).add(new Edge(from, distance)); // undirected: paths work both ways
    }

    public Set<String> getAllLocations() {
        return adjList.keySet();
    }

    public Map<String, List<Edge>> getAdjList() {
        return adjList;
    }

    public void printGraph() {
        for (String node : adjList.keySet()) {
            System.out.print(node + " -> ");
            List<String> connections = new ArrayList<>();
            for (Edge e : adjList.get(node)) {
                connections.add(e.destination + " (" + e.weight + "m)");
            }
            System.out.println(String.join(", ", connections));
        }
    }

    /**
     * Dijkstra's algorithm: computes shortest distance from `start` to every
     * other node. Fills `predecessors` so the actual path can be reconstructed.
     *
     * Time complexity: O((V + E) log V) using a priority queue.
     */
    public Map<String, Double> dijkstra(String start, Map<String, String> predecessors) {
        Map<String, Double> dist = new HashMap<>();
        for (String node : adjList.keySet()) {
            dist.put(node, Double.MAX_VALUE);
        }
        dist.put(start, 0.0);

        PriorityQueue<String> pq = new PriorityQueue<>(Comparator.comparingDouble(dist::get));
        pq.add(start);
        Set<String> visited = new HashSet<>();

        while (!pq.isEmpty()) {
            String current = pq.poll();
            if (visited.contains(current)) continue;
            visited.add(current);

            for (Edge e : adjList.getOrDefault(current, new ArrayList<>())) {
                if (visited.contains(e.destination)) continue;
                double newDist = dist.get(current) + e.weight;
                if (newDist < dist.get(e.destination)) {
                    dist.put(e.destination, newDist);
                    predecessors.put(e.destination, current);
                    pq.add(e.destination);
                }
            }
        }
        return dist;
    }

    /** Reconstructs the path from start to end using the predecessor map. */
    public static List<String> buildPath(String start, String end, Map<String, String> predecessors) {
        LinkedList<String> path = new LinkedList<>();
        String current = end;
        while (current != null && !current.equals(start)) {
            path.addFirst(current);
            current = predecessors.get(current);
        }
        if (current == null) {
            return Collections.emptyList(); // no path found
        }
        path.addFirst(start);
        return path;
    }
}

