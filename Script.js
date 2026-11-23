/* =========================================================
   PART 1: Graph + Dijkstra's algorithm
   (identical logic to Graph.java — see the Java DSA files)
========================================================= */
class Graph {
  constructor() { this.adj = new Map(); }

  addLocation(name) { if (!this.adj.has(name)) this.adj.set(name, []); }

  addPath(a, b, w) {
    this.addLocation(a); this.addLocation(b);
    this.adj.get(a).push({ to: b, w });
    this.adj.get(b).push({ to: a, w });
  }

  dijkstra(start) {
    const dist = new Map(), prev = new Map(), visited = new Set();
    for (const node of this.adj.keys()) dist.set(node, Infinity);
    dist.set(start, 0);

    const queue = [start];
    while (queue.length) {
      queue.sort((a, b) => dist.get(a) - dist.get(b));
      const current = queue.shift();
      if (visited.has(current)) continue;
      visited.add(current);

      for (const edge of this.adj.get(current)) {
        if (visited.has(edge.to)) continue;
        const newDist = dist.get(current) + edge.w;
        if (newDist < dist.get(edge.to)) {
          dist.set(edge.to, newDist);
          prev.set(edge.to, current);
          queue.push(edge.to);
        }
      }
    }
    return { dist, prev };
  }
}

function buildPath(start, end, prev) {
  const path = [];
  let current = end;
  while (current && current !== start) {
    path.unshift(current);
    current = prev.get(current);
  }
  if (!current) return [];
  path.unshift(start);
  return path;
}

/* =========================================================
   PART 2: Campus data — swap in your real buildings/distances
========================================================= */
const positions = {
  "Main Gate":          { x: 90,  y: 500 },
  "Parking":            { x: 90,  y: 400 },
  "Admin Block":        { x: 230, y: 500 },
  "Library":            { x: 230, y: 380 },
  "Academic Block A":   { x: 390, y: 500 },
  "Academic Block B":   { x: 390, y: 380 },
  "Canteen":            { x: 530, y: 500 },
  "Auditorium":         { x: 530, y: 320 },
  "Hostel A":           { x: 690, y: 500 },
  "Hostel B":           { x: 690, y: 440 },
  "Sports Complex":     { x: 770, y: 320 }
};

const edgesData = [
  ["Main Gate", "Admin Block", 120],
  ["Main Gate", "Parking", 60],
  ["Admin Block", "Library", 80],
  ["Admin Block", "Academic Block A", 100],
  ["Academic Block A", "Academic Block B", 70],
  ["Academic Block A", "Canteen", 150],
  ["Academic Block B", "Auditorium", 90],
  ["Canteen", "Hostel A", 200],
  ["Canteen", "Hostel B", 220],
  ["Library", "Auditorium", 130],
  ["Auditorium", "Sports Complex", 180],
  ["Hostel A", "Sports Complex", 250],
  ["Parking", "Sports Complex", 300]
];

const campus = new Graph();
edgesData.forEach(([a, b, w]) => campus.addPath(a, b, w));

/* =========================================================
   PART 3: Render the trail map (SVG) + wire up the UI
========================================================= */
const SVG_NS = "http://www.w3.org/2000/svg";
const svg = document.getElementById('map-svg');
const startSelect = document.getElementById('start-select');
const endSelect = document.getElementById('end-select');
const locationList = document.getElementById('location-list');
const permit = document.getElementById('permit');
const routePathText = document.getElementById('route-path-text');
const statDistance = document.getElementById('stat-distance');
const statTime = document.getElementById('stat-time');

const locations = [...campus.adj.keys()];

// --- Dropdowns + legend list ---
locations.forEach(loc => {
  const o1 = document.createElement('option'); o1.value = loc; o1.textContent = loc;
  const o2 = document.createElement('option'); o2.value = loc; o2.textContent = loc;
  startSelect.appendChild(o1);
  endSelect.appendChild(o2);

  const li = document.createElement('li'); li.textContent = loc;
  locationList.appendChild(li);
});
startSelect.value = "Main Gate";
endSelect.value = "Sports Complex";

// --- Background: faint topographic contour rings (purely decorative) ---
const contourGroup = document.createElementNS(SVG_NS, "g");
[120, 220, 320, 420].forEach((r, i) => {
  const ring = document.createElementNS(SVG_NS, "ellipse");
  ring.setAttribute("cx", 850);
  ring.setAttribute("cy", 40);
  ring.setAttribute("rx", r);
  ring.setAttribute("ry", r * 0.7);
  ring.setAttribute("class", "contour");
  contourGroup.appendChild(ring);
});
svg.appendChild(contourGroup);

// --- Compass rose (top-right of the map) ---
const compass = document.createElementNS(SVG_NS, "g");
compass.setAttribute("class", "compass");
compass.setAttribute("transform", "translate(830, 60)");
compass.innerHTML = `
  <circle r="26"></circle>
  <line x1="0" y1="-22" x2="0" y2="22"></line>
  <line x1="-22" y1="0" x2="22" y2="0"></line>
  <text x="0" y="-30">N</text>
  <text x="0" y="40">S</text>
  <text x="-32" y="4">W</text>
  <text x="32" y="4">E</text>
`;
svg.appendChild(compass);

// --- Edges: drawn as <path> so we can measure length and place blaze marks ---
const edgeElements = {};
edgesData.forEach(([a, b]) => {
  const p1 = positions[a], p2 = positions[b];
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`);
  path.setAttribute("class", "edge-path");
  svg.appendChild(path);
  edgeElements[a + "|" + b] = path;
  edgeElements[b + "|" + a] = path;
});

// --- Nodes: numbered trail-marker posts ---
const nodeElements = {};
const labelElements = {};
locations.forEach((name, i) => {
  const pos = positions[name];
  const g = document.createElementNS(SVG_NS, "g");
  g.setAttribute("class", "node-post");

  const circle = document.createElementNS(SVG_NS, "circle");
  circle.setAttribute("cx", pos.x);
  circle.setAttribute("cy", pos.y);
  circle.setAttribute("r", 12);
  g.appendChild(circle);

  const num = document.createElementNS(SVG_NS, "text");
  num.setAttribute("x", pos.x);
  num.setAttribute("y", pos.y);
  num.setAttribute("class", "num");
  num.textContent = i + 1;
  g.appendChild(num);

  svg.appendChild(g);
  nodeElements[name] = g;

  const label = document.createElementNS(SVG_NS, "text");
  label.setAttribute("x", pos.x);
  label.setAttribute("y", pos.y - 20);
  label.setAttribute("class", "node-label");
  label.textContent = name;
  svg.appendChild(label);
  labelElements[name] = label;
});

// --- Blaze marks: small diamonds placed along an active edge's real path length ---
const blazeGroup = document.createElementNS(SVG_NS, "g");
svg.appendChild(blazeGroup);

function addBlazeMarksAlong(pathEl) {
  const len = pathEl.getTotalLength();
  const spacing = 34;
  for (let d = spacing / 2; d < len; d += spacing) {
    const pt = pathEl.getPointAtLength(d);
    const mark = document.createElementNS(SVG_NS, "rect");
    mark.setAttribute("width", 6);
    mark.setAttribute("height", 6);
    mark.setAttribute("x", pt.x - 3);
    mark.setAttribute("y", pt.y - 3);
    mark.setAttribute("transform", `rotate(45 ${pt.x} ${pt.y})`);
    mark.setAttribute("class", "blaze-mark");
    mark.style.animationDelay = `${(d / len) * 0.5}s`;
    blazeGroup.appendChild(mark);
  }
}

function resetHighlights() {
  Object.values(edgeElements).forEach(el => el.classList.remove("active"));
  Object.values(nodeElements).forEach(el => el.classList.remove("active", "endpoint"));
  Object.values(labelElements).forEach(el => el.classList.remove("active"));
  blazeGroup.innerHTML = "";
}

function findRoute() {
  const start = startSelect.value;
  const end = endSelect.value;
  resetHighlights();

  if (start === end) {
    permit.classList.remove("show");
    return;
  }

  const { dist, prev } = campus.dijkstra(start);
  const totalDistance = dist.get(end);

  if (!isFinite(totalDistance)) {
    routePathText.innerHTML = `<span class="empty-msg">No trail connects ${start} and ${end}.</span>`;
    statDistance.textContent = "--";
    statTime.textContent = "--";
    permit.classList.add("show");
    return;
  }

  const path = buildPath(start, end, prev);

  path.forEach((node, i) => {
    nodeElements[node].classList.add(i === 0 || i === path.length - 1 ? "endpoint" : "active");
    labelElements[node].classList.add("active");
  });

  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i] + "|" + path[i + 1];
    const edgeEl = edgeElements[key];
    if (edgeEl) {
      edgeEl.classList.add("active");
      addBlazeMarksAlong(edgeEl);
    }
  }

  routePathText.innerHTML = path.map(n => `<span class="stop">${n}</span>`).join('');
  statDistance.textContent = totalDistance;
  const minutes = Math.max(1, Math.round(totalDistance / 1.4 / 60)); // ~1.4 m/s walking pace
  statTime.textContent = minutes;
  permit.classList.add("show");
}

document.getElementById('find-btn').addEventListener('click', findRoute);
document.getElementById('swap-btn').addEventListener('click', () => {
  const tmp = startSelect.value;
  startSelect.value = endSelect.value;
  endSelect.value = tmp;
  findRoute();
});

findRoute();