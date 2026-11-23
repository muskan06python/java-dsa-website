import java.util.*;
public class CampusNavigatorApp {

    static Graph campus = new Graph();
    static Scanner sc = new Scanner(System.in);

    public static void main(String[] args) {
        loadSampleCampusData();

        boolean running = true;
        while (running) {
            printMenu();
            String choice = sc.nextLine().trim();

            switch (choice) {
                case "1":
                    showAllLocations();
                    break;
                case "2":
                    findShortestPath();
                    break;
                case "3":
                    campus.printGraph();
                    break;
                case "4":
                    addNewPath();
                    break;
                case "5":
                    running = false;
                    System.out.println("Goodbye!");
                    break;
                default:
                    System.out.println("Invalid option. Try again.");
            }
        }
        sc.close();
    }

    static void printMenu() {
        System.out.println("\n===== CAMPUS NAVIGATION SYSTEM =====");
        System.out.println("1. Show all locations");
        System.out.println("2. Find shortest path between two locations");
        System.out.println("3. Show full campus graph");
        System.out.println("4. Add a new location/path");
        System.out.println("5. Exit");
        System.out.print("Choose an option: ");
    }

    static void showAllLocations() {
        System.out.println("\nAvailable locations:");
        int i = 1;
        for (String loc : campus.getAllLocations()) {
            System.out.println(i++ + ". " + loc);
        }
    }

    static void findShortestPath() {
        showAllLocations();
        System.out.print("\nEnter start location: ");
        String start = sc.nextLine().trim();
        System.out.print("Enter destination: ");
        String end = sc.nextLine().trim();

        if (!campus.getAllLocations().contains(start) || !campus.getAllLocations().contains(end)) {
            System.out.println("One or both locations not found. Please check spelling.");
            return;
        }

        Map<String, String> predecessors = new HashMap<>();
        Map<String, Double> distances = campus.dijkstra(start, predecessors);

        double totalDistance = distances.get(end);
        if (totalDistance == Double.MAX_VALUE) {
            System.out.println("No path exists between " + start + " and " + end);
            return;
        }

        List<String> path = Graph.buildPath(start, end, predecessors);
        System.out.println("\nShortest path: " + String.join(" -> ", path));
        System.out.println("Total distance: " + totalDistance + " meters");
    }

    static void addNewPath() {
        System.out.print("Enter first location name: ");
        String a = sc.nextLine().trim();
        System.out.print("Enter second location name: ");
        String b = sc.nextLine().trim();
        System.out.print("Enter distance between them (meters): ");
        double dist = Double.parseDouble(sc.nextLine().trim());
        campus.addPath(a, b, dist);
        System.out.println("Path added: " + a + " <-> " + b + " (" + dist + "m)");
    }

    /**
     * Sample campus layout. Replace these with your actual college's
     * buildings and estimated distances (see notes on getting map data).
     */
    static void loadSampleCampusData() {
        campus.addPath("Main Gate", "Admin Block", 120);
        campus.addPath("Main Gate", "Parking", 60);
        campus.addPath("Admin Block", "Library", 80);
        campus.addPath("Admin Block", "Academic Block A", 100);
        campus.addPath("Academic Block A", "Academic Block B", 70);
        campus.addPath("Academic Block A", "Canteen", 150);
        campus.addPath("Academic Block B", "Auditorium", 90);
        campus.addPath("Canteen", "Hostel A", 200);
        campus.addPath("Canteen", "Hostel B", 220);
        campus.addPath("Library", "Auditorium", 130);
        campus.addPath("Auditorium", "Sports Complex", 180);
        campus.addPath("Hostel A", "Sports Complex", 250);
        campus.addPath("Parking", "Sports Complex", 300);
    }
}
