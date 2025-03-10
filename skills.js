// Skills Graph Data
const nodes = new vis.DataSet([
    // Core Skills
    { id: 1, label: 'JavaScript', group: 'core', value: 4 },
    { id: 2, label: 'HTML5', group: 'core', value: 35 },
    { id: 3, label: 'CSS3', group: 'core', value: 35 },
    { id: 4, label: 'Python', group: 'core', value: 30 },
    { id: 15, label: 'TypeScript', group: 'core', value: 35 },
    { id: 20, label: 'Go', group: 'core', value: 30 },
    { id: 21, label: 'Bash', group: 'core', value: 25 },
    
    // Frameworks & Libraries
    { id: 5, label: 'Three.js', group: 'framework', value: 25 },
    { id: 6, label: 'D3.js', group: 'framework', value: 25 },
    { id: 7, label: 'React', group: 'framework', value: 30 },
    { id: 16, label: 'Node.js', group: 'framework', value: 30 },
    { id: 17, label: 'Flask', group: 'framework', value: 25 },
    
    // Tools & Technologies
    { id: 8, label: 'Git', group: 'tool', value: 25 },
    { id: 9, label: 'VS Code', group: 'tool', value: 20 },
    { id: 10, label: 'Burp Suite Pro', group: 'tool', value: 20 },
    { id: 11, label: 'Kali Linux', group: 'tool', value: 20 },
    { id: 18, label: 'PostgreSQL', group: 'tool', value: 25 },
    { id: 19, label: 'MongoDB', group: 'tool', value: 25 },
    { id: 22, label: 'Nmap', group: 'tool', value: 20 },

    // Experience
    { id: 12, label: 'Eirpol', group: 'experience', value: 35 },
    { id: 13, label: 'Bug Bounty\nHunting', group: 'experience', value: 30 },
    { id: 14, label: 'MoonMapper', group: 'experience', value: 35 }
]);

const edges = new vis.DataSet([
    // Core Skills Connections
    { from: 1, to: 5 },  // JavaScript -> Three.js
    { from: 1, to: 6 },  // JavaScript -> D3.js
    { from: 1, to: 7 },  // JavaScript -> React
    { from: 2, to: 3 },  // HTML -> CSS
    { from: 2, to: 7 },  // HTML -> React
    { from: 3, to: 7 },  // CSS -> React
    { from: 15, to: 7 }, // TypeScript -> React
    { from: 4, to: 17 }, // Python -> Flask
    { from: 21, to: 11 }, // Bash -> Kali Linux
    
    // Framework Connections
    { from: 7, to: 8 },  // React -> Git
    
    // Tool Connections
    { from: 8, to: 9 },  // Git -> VS Code
    { from: 10, to: 11 }, // Burp Suite -> Kali Linux
    { from: 22, to: 11 }, // Nmap -> Kali Linux

    // Experience Connections
    // Eirpol Connections
    { from: 12, to: 6 },  // Eirpol -> D3.js
    { from: 12, to: 1 },  // Eirpol -> JavaScript
    { from: 12, to: 2 },  // Eirpol -> HTML5
    { from: 12, to: 3 },  // Eirpol -> CSS3
    { from: 12, to: 4 },  // Eirpol -> Python
    { from: 12, to: 15 }, // Eirpol -> TypeScript
    { from: 12, to: 16 }, // Eirpol -> Node.js
    { from: 12, to: 17 }, // Eirpol -> Flask
    { from: 12, to: 18 }, // Eirpol -> PostgreSQL
    { from: 12, to: 19 }, // Eirpol -> MongoDB
    { from: 12, to: 7 },  // Eirpol -> React

    // Technology Relationships
    { from: 16, to: 18 }, // Node.js -> PostgreSQL
    { from: 16, to: 19 }, // Node.js -> MongoDB
    { from: 17, to: 18 }, // Flask -> PostgreSQL
    { from: 17, to: 19 }, // Flask -> MongoDB

    // Bug Bounty Connections
    { from: 13, to: 10 }, // Bug Bounty -> Burp Suite
    { from: 13, to: 11 }, // Bug Bounty -> Kali Linux
    { from: 13, to: 20 }, // Bug Bounty -> Go
    { from: 13, to: 21 }, // Bug Bounty -> Bash
    { from: 13, to: 22 }, // Bug Bounty -> Nmap

    // MoonMapper Connections
    { from: 14, to: 5 },  // MoonMapper -> Three.js
    { from: 14, to: 1 },  // MoonMapper -> JavaScript
    { from: 14, to: 4 },  // MoonMapper -> Python
    { from: 14, to: 7 }   // MoonMapper -> React
]);

// Network Configuration
const container = document.getElementById('skills-network');
const data = {
    nodes: nodes,
    edges: edges
};

const options = {
    nodes: {
        shape: 'dot',
        scaling: {
            min: 15,
            max: 30,
            label: {
                min: 12,
                max: 18,
                drawThreshold: 9,
                maxVisible: 20
            }
        },
        font: {
            size: 12,
            face: 'Inter',
            color: '#FFFFFF',
            multi: true
        },
        color: {
            border: '#2B2B2B',
            background: '#1A1A1A',
            highlight: {
                border: '#FFFFFF',
                background: '#2B2B2B'
            }
        }
    },
    edges: {
        width: 2,
        color: {
            color: 'rgba(255, 255, 255, 0.2)',
            highlight: 'rgba(255, 255, 255, 0.8)',
            hover: 'rgba(255, 255, 255, 0.8)'
        },
        smooth: {
            type: 'continuous'
        }
    },
    physics: {
        enabled: true,
        barnesHut: {
            gravitationalConstant: -15000,
            centralGravity: 0.8,
            springLength: 100,
            springConstant: 0.08,
            damping: 0.4,
            avoidOverlap: 0.5
        },
        stabilization: {
            enabled: true,
            iterations: 200,
            updateInterval: 25,
            fit: true
        }
    },
    groups: {
        core: {
            shape: 'dot',
            scaling: {
                min: 20,
                max: 30
            },
            font: {
                size: 12,
                face: 'Inter'
            },
            color: {
                background: 'rgba(100, 255, 218, 0.2)',
                border: 'rgba(100, 255, 218, 0.8)',
                highlight: { background: 'rgba(100, 255, 218, 0.3)', border: 'rgba(100, 255, 218, 1)' }
            }
        },
        framework: {
            shape: 'dot',
            scaling: {
                min: 15,
                max: 25
            },
            font: {
                size: 12,
                face: 'Inter'
            },
            color: {
                background: 'rgba(231, 111, 81, 0.2)',
                border: 'rgba(231, 111, 81, 0.8)',
                highlight: { background: 'rgba(231, 111, 81, 0.3)', border: 'rgba(231, 111, 81, 1)' }
            }
        },
        tool: {
            shape: 'dot',
            scaling: {
                min: 15,
                max: 25
            },
            font: {
                size: 12,
                face: 'Inter'
            },
            color: {
                background: 'rgba(67, 97, 238, 0.2)',
                border: 'rgba(67, 97, 238, 0.8)',
                highlight: { background: 'rgba(67, 97, 238, 0.3)', border: 'rgba(67, 97, 238, 1)' }
            }
        },
        experience: {
            shape: 'diamond',
            scaling: {
                min: 30,
                max: 45
            },
            font: {
                size: 16,
                bold: true
            },
            color: {
                background: 'rgba(255, 193, 7, 0.2)',
                border: 'rgba(255, 193, 7, 0.8)',
                highlight: { background: 'rgba(255, 193, 7, 0.3)', border: 'rgba(255, 193, 7, 1)' }
            }
        }
    },
    interaction: {
        hover: true,
        hoverConnectedEdges: true,
        tooltipDelay: 200,
        zoomView: false,
        dragView: false,
        dragNodes: false
    },
    layout: {
        improvedLayout: true,
        clusterThreshold: 150
    },
    autoResize: true,
    height: '100%',
    width: '100%'
};

// Create Network
const network = new vis.Network(container, data, options);

// Responsive Design - Enhanced fit behavior
window.addEventListener('resize', () => {
    network.fit({
        animation: {
            duration: 500,
            easingFunction: 'easeInOutQuad'
        }
    });
});

// Initial Animation with proper fitting
network.once('stabilizationIterationsDone', () => {
    network.fit({
        animation: {
            duration: 500,
            easingFunction: 'easeInOutQuad'
        }
    });
});

// Add hover interactions
network.on('hoverNode', (params) => {
    const nodeId = params.node;
    const connectedNodes = network.getConnectedNodes(nodeId);
    const connectedEdges = network.getConnectedEdges(nodeId);
    
    // Highlight connected nodes and edges, dim others
    nodes.update(nodes.get().map(node => ({
        ...node,
        opacity: connectedNodes.includes(node.id) || node.id === nodeId ? 1 : 0.2,
        font: {
            ...node.font,
            color: connectedNodes.includes(node.id) || node.id === nodeId ? '#FFFFFF' : 'rgba(255, 255, 255, 0.2)'
        }
    })));
    
    edges.update(edges.get().map(edge => ({
        ...edge,
        opacity: connectedEdges.includes(edge.id) ? 1 : 0.1,
        color: {
            ...edge.color,
            opacity: connectedEdges.includes(edge.id) ? 1 : 0.1
        }
    })));
});

network.on('blurNode', () => {
    // Reset all nodes and edges to default state
    nodes.update(nodes.get().map(node => ({
        ...node,
        opacity: 1,
        font: {
            ...node.font,
            color: '#FFFFFF'
        }
    })));
    
    edges.update(edges.get().map(edge => ({
        ...edge,
        opacity: 1,
        color: {
            color: 'rgba(255, 255, 255, 0.2)',
            highlight: 'rgba(255, 255, 255, 0.8)',
            hover: 'rgba(255, 255, 255, 0.8)'
        }
    })));
}); 