// Skills graph data with fixed positions
const skillsData = {
    nodes: [
        // Experience/Projects (Top Row)
        { id: "Eirpol", group: "experience", size: 30, fx: 300, fy: 100 },
        { id: "MoonMapper", group: "experience", size: 30, fx: 600, fy: 100 },
        { id: "Vulnerability Disclosure", group: "experience", size: 30, fx: 900, fy: 100 },
        { id: "Drip", group: "experience", size: 30, fx: 1200, fy: 100 },
        
        // Core Skills (Middle Row)
        { id: "JavaScript", group: "skill", size: 25, fx: 300, fy: 250 },
        { id: "TypeScript", group: "skill", size: 25, fx: 500, fy: 250 },
        { id: "HTML", group: "skill", size: 25, fx: 700, fy: 250 },
        { id: "CSS", group: "skill", size: 25, fx: 900, fy: 250 },
        { id: "Python", group: "skill", size: 25, fx: 1100, fy: 250 },
        
        // Tools (Bottom Row)
        { id: "Git", group: "tool", size: 20, fx: 300, fy: 400 },
        { id: "VS Code", group: "tool", size: 20, fx: 500, fy: 400 },
        { id: "Webpack", group: "tool", size: 20, fx: 700, fy: 400 },
        { id: "Docker", group: "tool", size: 20, fx: 900, fy: 400 },
        { id: "Postgres", group: "tool", size: 20, fx: 1100, fy: 400 },
        { id: "Flask", group: "tool", size: 20, fx: 1300, fy: 400 }
    ],
    links: [
        // Eirpol connections
        { source: "Python", target: "Eirpol", value: 3 },
        { source: "TypeScript", target: "Eirpol", value: 3 },
        { source: "JavaScript", target: "Eirpol", value: 3 },
        { source: "HTML", target: "Eirpol", value: 2 },
        { source: "CSS", target: "Eirpol", value: 2 },
        { source: "Postgres", target: "Eirpol", value: 3 },
        { source: "Flask", target: "Eirpol", value: 3 },
        
        // MoonMapper connections
        { source: "JavaScript", target: "MoonMapper", value: 3 },
        { source: "Python", target: "MoonMapper", value: 3 },
        { source: "TypeScript", target: "MoonMapper", value: 2 },
        
        // Vulnerability Disclosure connections
        { source: "Python", target: "Vulnerability Disclosure", value: 3 },
        { source: "JavaScript", target: "Vulnerability Disclosure", value: 2 },
        
        // Drip connections
        { source: "TypeScript", target: "Drip", value: 3 },
        { source: "JavaScript", target: "Drip", value: 3 },
        { source: "HTML", target: "Drip", value: 2 },
        { source: "CSS", target: "Drip", value: 2 },
        
        // Tools to Skills connections
        { source: "Git", target: "JavaScript", value: 2 },
        { source: "VS Code", target: "TypeScript", value: 2 },
        { source: "Webpack", target: "JavaScript", value: 2 },
        { source: "Docker", target: "Python", value: 2 },
        { source: "Postgres", target: "Python", value: 2 },
        { source: "Flask", target: "Python", value: 2 }
    ]
};

// Color scale with vibrant, accessible colors
const color = d3.scaleOrdinal()
    .domain(["skill", "tool", "experience"])
    .range(["#64ffda", "#F2994A", "#BB6BD9"]);

// Initialize the SVG container
const container = document.getElementById('skills-graph');
const margin = { top: 50, right: 50, bottom: 50, left: 50 };
const width = 1500; // Increased width to accommodate project names
const height = 500;

// Create SVG with viewBox for responsiveness
const svg = d3.select("#skills-graph")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("background-color", "rgba(0, 0, 0, 0.2)")
    .style("border-radius", "8px");

// Create the links
const link = svg.append("g")
    .selectAll("line")
    .data(skillsData.links)
    .join("line")
    .style("stroke", "#64ffda")
    .style("stroke-opacity", 0.3)
    .style("stroke-width", d => Math.sqrt(d.value) * 2)
    .attr("x1", d => d.source.fx)
    .attr("y1", d => d.source.fy)
    .attr("x2", d => d.target.fx)
    .attr("y2", d => d.target.fy);

// Create node groups
const node = svg.append("g")
    .selectAll("g")
    .data(skillsData.nodes)
    .join("g")
    .attr("transform", d => `translate(${d.fx},${d.fy})`);

// Add circles to nodes
node.append("circle")
    .attr("r", d => d.size)
    .style("fill", d => color(d.group))
    .style("fill-opacity", 0.9)
    .style("stroke", d => d3.color(color(d.group)).darker())
    .style("stroke-width", 2);

// Add labels to nodes with improved text wrapping for long names
node.append("text")
    .text(d => d.id)
    .attr("dy", d => d.size + 15)
    .attr("text-anchor", "middle")
    .style("fill", "#ffffff")
    .style("font-family", "Inter")
    .style("font-size", d => {
        if (d.group === "experience") return "16px";
        if (d.group === "skill") return "14px";
        return "12px";
    })
    .style("font-weight", d => d.group === "experience" ? "bold" : "normal")
    .call(wrap, 120); // Wrap text for long project names

// Text wrapping function
function wrap(text, width) {
    text.each(function() {
        let text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr("dy"),
            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y);
            
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", 0).attr("dy", `${lineHeight}em`).text(word);
                lineNumber++;
            }
        }
    });
}

// Add hover effects with improved highlighting
node
    .on("mouseover", function(event, d) {
        // Highlight connected links
        link
            .style("stroke-opacity", l => 
                l.source.id === d.id || l.target.id === d.id ? 0.8 : 0.1)
            .style("stroke-width", l => 
                (l.source.id === d.id || l.target.id === d.id) ? 
                Math.sqrt(l.value) * 3 : Math.sqrt(l.value) * 2);
        
        // Highlight connected nodes
        node
            .style("opacity", n => 
                n.id === d.id || 
                skillsData.links.some(l => 
                    (l.source.id === d.id && l.target.id === n.id) || 
                    (l.target.id === d.id && l.source.id === n.id)
                ) ? 1 : 0.3);
    })
    .on("mouseout", function() {
        // Reset styles
        link
            .style("stroke-opacity", 0.3)
            .style("stroke-width", d => Math.sqrt(d.value) * 2);
        node.style("opacity", 1);
    });

// Add legend
const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

const legendData = [
    { label: "Projects", color: color("experience") },
    { label: "Core Skills", color: color("skill") },
    { label: "Tools", color: color("tool") }
];

const legendItems = legend.selectAll("g")
    .data(legendData)
    .join("g")
    .attr("transform", (d, i) => `translate(0, ${i * 25})`);

legendItems.append("circle")
    .attr("r", 6)
    .style("fill", d => d.color);

legendItems.append("text")
    .attr("x", 15)
    .attr("y", 5)
    .style("fill", "#ffffff")
    .style("font-family", "Inter")
    .style("font-size", "12px")
    .text(d => d.label);

// Make container fit content
container.style.height = "auto";
container.style.minHeight = "500px"; 