// Add vis.js network graph
document.addEventListener('DOMContentLoaded', function() {
    // Load the graph data
    fetch('graph-data.json')
        .then(response => response.json())
        .then(data => {
            // Create nodes array with custom styling
            const nodes = new vis.DataSet(data.nodes.map(node => {
                const baseNode = {
                    id: node.id,
                    label: node.id,
                    title: node.description,
                    font: {
                        size: 16,
                        face: 'Inter',
                        multi: true,
                        strokeWidth: 3,
                        strokeColor: '#ffffff'
                    }
                };

                // Customize node appearance based on group
                switch(node.group) {
                    case 'project':
                        return {
                            ...baseNode,
                            size: 40,
                            margin: 20,
                            color: {
                                background: '#4CAF50',
                                border: '#2E7D32',
                                highlight: {
                                    background: '#66BB6A',
                                    border: '#2E7D32'
                                }
                            },
                            font: {
                                ...baseNode.font,
                                size: 18,
                                bold: true
                            }
                        };
                    case 'tool':
                        return {
                            ...baseNode,
                            size: 30,
                            margin: 16,
                            color: {
                                background: '#2196F3',
                                border: '#1565C0',
                                highlight: {
                                    background: '#42A5F5',
                                    border: '#1565C0'
                                }
                            }
                        };
                    case 'skill':
                        return {
                            ...baseNode,
                            size: 25,
                            margin: 14,
                            color: {
                                background: '#FF9800',
                                border: '#E65100',
                                highlight: {
                                    background: '#FFA726',
                                    border: '#E65100'
                                }
                            }
                        };
                }
            }));

            // Create edges array
            const edges = new vis.DataSet(data.links.map(link => ({
                from: link.source,
                to: link.target,
                width: link.value,
                color: {
                    color: '#848484',
                    highlight: '#666666',
                    opacity: 0.5
                },
                smooth: {
                    type: 'continuous',
                    roundness: 0.5
                }
            })));

            // Configuration for the network
            const options = {
                nodes: {
                    shape: 'dot',
                    shadow: true,
                    scaling: {
                        label: {
                            enabled: true,
                            min: 14,
                            max: 24
                        }
                    }
                },
                edges: {
                    smooth: {
                        type: 'continuous',
                        roundness: 0.5
                    },
                    shadow: true
                },
                physics: {
                    enabled: true,
                    solver: 'forceAtlas2Based',
                    forceAtlas2Based: {
                        gravitationalConstant: -1000,
                        centralGravity: 0.005,
                        springLength: 250,
                        springConstant: 0.05,
                        damping: 0.4,
                        avoidOverlap: 1
                    },
                    stabilization: {
                        enabled: true,
                        iterations: 2000,
                        updateInterval: 25,
                        fit: true
                    },
                    minVelocity: 0.75,
                    maxVelocity: 30
                },
                layout: {
                    improvedLayout: true,
                    clusterThreshold: 150,
                    randomSeed: 2
                },
                interaction: {
                    hover: true,
                    tooltipDelay: 200,
                    hideEdgesOnDrag: true,
                    navigationButtons: true,
                    keyboard: true,
                    zoomView: true
                }
            };

            // Create the network
            const container = document.getElementById('skills-graph');
            const network = new vis.Network(container, { nodes, edges }, options);

            // Create tooltip element
            const tooltip = document.createElement('div');
            tooltip.className = 'node-description';
            document.body.appendChild(tooltip);

            // Handle node hover events
            network.on('hoverNode', function(params) {
                const node = nodes.get(params.node);
                tooltip.innerHTML = node.title;
                tooltip.style.display = 'block';
                tooltip.style.left = params.event.pageX + 10 + 'px';
                tooltip.style.top = params.event.pageY + 10 + 'px';
            });

            network.on('blurNode', function() {
                tooltip.style.display = 'none';
            });

            // Stabilize the network and fit to view
            network.once('stabilizationIterationsDone', function() {
                network.fit({
                    animation: {
                        duration: 1000,
                        easingFunction: 'easeInOutQuad'
                    }
                });
            });
        })
        .catch(error => console.error('Error loading graph data:', error));
}); 