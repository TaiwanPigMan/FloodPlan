// FloodPlan United States - State-Level Flood Risk Assessment
// National Emergency Coordination & FEMA Integration

// Global variables
let usMap;
let currentLayer = 'states';
let currentTimeRange = 'current';
let statePolygons = [];
let riverMarkers = [];
let updateInterval;

// United States flood data
const unitedStatesData = {
    states: {
        'texas': {
            name: 'Texas',
            center: [31.9686, -99.9018],
            risk: 'extreme',
            population: 29945493,
            populationAtRisk: 125000,
            femaStatus: 'Major Disaster Declaration',
            economicImpact: 340000000,
            majorRivers: ['Colorado River', 'Trinity River', 'Brazos River'],
            riverStatus: [
                { name: 'Colorado River', status: 'warning', level: '25.3 ft', floodStage: '22.0 ft' },
                { name: 'Trinity River', status: 'critical', level: '28.7 ft', floodStage: '30.0 ft' },
                { name: 'Brazos River', status: 'warning', level: '18.1 ft', floodStage: '20.0 ft' }
            ]
        },
        'louisiana': {
            name: 'Louisiana',
            center: [31.1695, -91.8678],
            risk: 'high',
            population: 4657757,
            populationAtRisk: 89000,
            femaStatus: 'Emergency Declaration',
            economicImpact: 210000000,
            majorRivers: ['Mississippi River', 'Atchafalaya River'],
            riverStatus: [
                { name: 'Mississippi River', status: 'warning', level: '32.1 ft', floodStage: '30.0 ft' },
                { name: 'Atchafalaya River', status: 'watch', level: '22.1 ft', floodStage: '25.0 ft' }
            ]
        },
        'florida': {
            name: 'Florida',
            center: [27.7663, -81.6868],
            risk: 'high',
            population: 21538187,
            populationAtRisk: 76000,
            femaStatus: 'Flood Warning',
            economicImpact: 180000000,
            majorRivers: ['Everglades Region', 'Tampa Bay Area'],
            riverStatus: [
                { name: 'Everglades Region', status: 'normal', level: 'Normal', floodStage: 'N/A' },
                { name: 'Tampa Bay Area', status: 'watch', level: 'Storm Watch', floodStage: 'N/A' }
            ]
        },
        'missouri': {
            name: 'Missouri',
            center: [38.4561, -92.2884],
            risk: 'moderate',
            population: 6154913,
            populationAtRisk: 45000,
            femaStatus: 'Monitoring',
            economicImpact: 95000000,
            majorRivers: ['Mississippi River', 'Missouri River'],
            riverStatus: [
                { name: 'Mississippi River', status: 'critical', level: '34.2 ft', floodStage: '30.0 ft' },
                { name: 'Missouri River', status: 'normal', level: '15.3 ft', floodStage: '18.0 ft' }
            ]
        },
        'washington': {
            name: 'Washington',
            center: [47.7511, -121.7401],
            risk: 'moderate',
            population: 7693612,
            populationAtRisk: 38000,
            femaStatus: 'Advisory',
            economicImpact: 65000000,
            majorRivers: ['Columbia River', 'Puget Sound Region'],
            riverStatus: [
                { name: 'Columbia River', status: 'normal', level: '18.3 ft', floodStage: '21.0 ft' },
                { name: 'Puget Sound Region', status: 'normal', level: 'Normal', floodStage: 'N/A' }
            ]
        },
        'california': {
            name: 'California',
            center: [36.1162, -119.6816],
            risk: 'low',
            population: 39538223,
            populationAtRisk: 28000,
            femaStatus: 'Watch',
            economicImpact: 45000000,
            majorRivers: ['Sacramento River', 'San Joaquin River'],
            riverStatus: [
                { name: 'Sacramento River', status: 'normal', level: '12.1 ft', floodStage: '15.0 ft' },
                { name: 'San Joaquin River', status: 'normal', level: '8.7 ft', floodStage: '12.0 ft' }
            ]
        }
    },
    nationalData: {
        floodTrend: [18, 22, 31, 28, 24, 35], // Past 6 months
        regionalPrecipitation: [
            { region: 'Gulf Coast', precipitation: 28.5 },
            { region: 'Southeast', precipitation: 22.1 },
            { region: 'Midwest', precipitation: 18.7 },
            { region: 'Southwest', precipitation: 12.3 },
            { region: 'West Coast', precipitation: 15.8 },
            { region: 'Northeast', precipitation: 16.2 }
        ],
        riverLevels: {
            'Mississippi River': [28.5, 29.2, 31.8, 34.1, 32.8, 34.2],
            'Trinity River': [22.1, 24.5, 26.9, 28.2, 27.5, 28.7],
            'Columbia River': [16.2, 17.1, 18.8, 19.2, 18.5, 18.3]
        },
        forecast: {
            precipitation: [2.1, 3.8, 4.5, 2.9, 1.8, 1.2, 2.5], // Next 7 days
            temperatures: [78, 82, 85, 83, 79, 76, 78]
        }
    }
};

// Initialize US application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🇺🇸 FloodPlan United States - Initializing...');
    
    try {
        initializeUSMap();
        setupUSEventListeners();
        initializeUSCharts();
        updateUSStatistics();
        setupUSTabNavigation();
        startUSDataUpdates();
        
        console.log('✅ FloodPlan United States - Initialization complete');
    } catch (error) {
        console.error('❌ US Initialization error:', error);
        showUSNotification('System initialization failed. Please refresh the page.', 'error');
    }
});

// Initialize US map
function initializeUSMap() {
    // Center on continental United States
    usMap = L.map('usMap', {
        center: [39.8283, -98.5795],
        zoom: 4,
        minZoom: 3,
        maxZoom: 10,
        zoomControl: true
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
    }).addTo(usMap);

    // Add state boundaries and data
    addUSStateOverlays();
    addUSRiverMarkers();

    // Set up map interactions
    usMap.on('click', onUSMapClick);

    console.log('🗺️ United States map initialized');
}

// Add state overlay polygons
function addUSStateOverlays() {
    // Simplified state boundary coordinates (in real app, would use GeoJSON)
    const stateBoundaries = {
        'texas': [
            [25.8371, -106.6456], [36.5007, -106.6456], [36.5007, -93.5084], [25.8371, -93.5084]
        ],
        'louisiana': [
            [28.9385, -94.0432], [33.0197, -94.0432], [33.0197, -88.8584], [28.9385, -88.8584]
        ],
        'florida': [
            [24.3963, -87.6349], [31.0009, -87.6349], [31.0009, -79.9743], [24.3963, -79.9743]
        ],
        'missouri': [
            [35.9956, -95.7743], [40.6136, -95.7743], [40.6136, -89.0998], [35.9956, -89.0998]
        ],
        'washington': [
            [45.5437, -124.8482], [49.0025, -124.8482], [49.0025, -116.9158], [45.5437, -116.9158]
        ],
        'california': [
            [32.5343, -124.4096], [42.0095, -124.4096], [42.0095, -114.1308], [32.5343, -114.1308]
        ]
    };

    Object.keys(stateBoundaries).forEach(stateKey => {
        const state = unitedStatesData.states[stateKey];
        if (state) {
            const polygon = L.polygon(stateBoundaries[stateKey], {
                fillColor: getUSRiskColor(state.risk),
                weight: 2,
                opacity: 0.8,
                color: '#ffffff',
                fillOpacity: 0.6
            }).addTo(usMap);

            polygon.bindPopup(createStatePopup(state));
            polygon.on('click', () => updateStateInfo(state));
            
            statePolygons.push(polygon);
        }
    });
}

// Add river system markers
function addUSRiverMarkers() {
    const riverData = [
        { name: 'Mississippi River', location: [38.4561, -90.1994], status: 'critical' },
        { name: 'Trinity River', location: [32.7767, -96.7970], status: 'warning' },
        { name: 'Colorado River (TX)', location: [30.2672, -97.7431], status: 'warning' },
        { name: 'Columbia River', location: [46.2376, -119.2725], status: 'normal' },
        { name: 'Sacramento River', location: [38.5816, -121.4944], status: 'normal' }
    ];

    riverData.forEach(river => {
        const marker = L.circleMarker(river.location, {
            radius: 8,
            fillColor: getUSRiverStatusColor(river.status),
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(usMap);

        marker.bindPopup(`
            <div style="font-family: 'Inter', sans-serif;">
                <h4 style="margin: 0 0 0.5rem 0;">${river.name}</h4>
                <p style="margin: 0; color: ${getUSRiverStatusColor(river.status)};">
                    Status: ${river.status.charAt(0).toUpperCase() + river.status.slice(1)}
                </p>
            </div>
        `);

        riverMarkers.push(marker);
    });
}

// Create state popup content
function createStatePopup(state) {
    return `
        <div style="font-family: 'Inter', sans-serif; max-width: 280px;">
            <h4 style="margin: 0 0 0.8rem 0; color: ${getUSRiskColor(state.risk)};">
                ${state.name}
            </h4>
            <div style="margin-bottom: 0.8rem;">
                <span style="background: ${getUSRiskColor(state.risk)}20; padding: 0.3rem 0.6rem; border-radius: 10px; font-size: 0.8rem; font-weight: 600;">
                    ${state.risk.toUpperCase()} RISK
                </span>
            </div>
            <div style="font-size: 0.9rem; line-height: 1.4;">
                <div style="margin-bottom: 0.4rem;">👥 <strong>${state.populationAtRisk.toLocaleString()}</strong> at risk</div>
                <div style="margin-bottom: 0.4rem;">🏛️ <strong>${state.femaStatus}</strong></div>
                <div style="margin-bottom: 0.4rem;">🌊 <strong>${state.majorRivers.length}</strong> major river systems</div>
                <div>💰 <strong>$${(state.economicImpact / 1000000).toFixed(0)}M</strong> economic impact</div>
            </div>
        </div>
    `;
}

// Update state information panel
function updateStateInfo(state) {
    const stateInfoElement = document.getElementById('stateInfo');
    
    const riskBadge = `<span class="risk-level ${state.risk}">${state.risk.toUpperCase()} RISK</span>`;
    
    stateInfoElement.innerHTML = `
        <div class="state-details">
            <div class="state-header">
                <h4 style="color: #f1f5f9; margin-bottom: 0.8rem; font-size: 1.3rem;">
                    ${state.name} ${riskBadge}
                </h4>
            </div>
            
            <div class="state-stats-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                <div style="background: rgba(51, 65, 85, 0.5); padding: 1rem; border-radius: 10px; text-align: center;">
                    <div style="font-size: 1.4rem; font-weight: 700; color: #f1f5f9; margin-bottom: 0.3rem;">
                        ${state.populationAtRisk.toLocaleString()}
                    </div>
                    <div style="font-size: 0.8rem; color: #94a3b8;">Population at Risk</div>
                </div>
                <div style="background: rgba(51, 65, 85, 0.5); padding: 1rem; border-radius: 10px; text-align: center;">
                    <div style="font-size: 1.4rem; font-weight: 700; color: #f1f5f9; margin-bottom: 0.3rem;">
                        $${(state.economicImpact / 1000000).toFixed(0)}M
                    </div>
                    <div style="font-size: 0.8rem; color: #94a3b8;">Economic Impact</div>
                </div>
            </div>

            <div class="fema-status" style="margin-bottom: 1.5rem;">
                <h5 style="color: #f1f5f9; margin-bottom: 1rem;">FEMA Status & Response</h5>
                <div style="padding: 1rem; background: rgba(51, 65, 85, 0.5); border-radius: 10px; border-left: 3px solid #3b82f6;">
                    <div style="color: #93c5fd; font-weight: 600; margin-bottom: 0.5rem;">Current Status</div>
                    <div style="color: #f1f5f9; font-size: 1.1rem; font-weight: 700;">
                        ${state.femaStatus}
                    </div>
                </div>
            </div>

            <div class="major-rivers-section">
                <h5 style="color: #f1f5f9; margin-bottom: 1rem;">Major River Systems</h5>
                <div class="river-status-list">
                    ${state.riverStatus.map(river => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.8rem; background: rgba(51, 65, 85, 0.5); border-radius: 10px; margin-bottom: 0.8rem;">
                            <div>
                                <div style="color: #f1f5f9; font-weight: 600; margin-bottom: 0.3rem;">${river.name}</div>
                                <div style="color: #94a3b8; font-size: 0.8rem;">Level: ${river.level} | Stage: ${river.floodStage}</div>
                            </div>
                            <span style="background: ${getUSRiverStatusColor(river.status)}20; color: ${getUSRiverStatusColor(river.status)}; padding: 0.3rem 0.6rem; border-radius: 8px; font-size: 0.75rem; font-weight: 600;">
                                ${river.status.toUpperCase()}
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="population-stats" style="margin-top: 1.5rem; padding: 1rem; background: rgba(59, 130, 246, 0.1); border-radius: 10px; border-left: 3px solid #3b82f6;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="color: #93c5fd; font-weight: 600; font-size: 0.9rem;">Total State Population</div>
                        <div style="color: #f1f5f9; font-size: 1.1rem; font-weight: 700;">
                            ${state.population.toLocaleString()}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="color: #93c5fd; font-weight: 600; font-size: 0.9rem;">Risk Percentage</div>
                        <div style="color: #f1f5f9; font-size: 1.1rem; font-weight: 700;">
                            ${((state.populationAtRisk / state.population) * 100).toFixed(2)}%
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    showUSNotification(`Selected ${state.name} - ${state.risk} risk level`, 'info');
}

// Handle map click events
function onUSMapClick(e) {
    console.log('US Map clicked at:', e.latlng);
}

// Setup event listeners
function setupUSEventListeners() {
    // State selector
    const stateSelect = document.getElementById('stateSelect');
    if (stateSelect) {
        stateSelect.addEventListener('change', (e) => {
            const selectedState = e.target.value;
            if (selectedState === 'all') {
                usMap.setView([39.8283, -98.5795], 4);
            } else if (unitedStatesData.states[selectedState]) {
                const state = unitedStatesData.states[selectedState];
                usMap.setView(state.center, 6);
                updateStateInfo(state);
            }
        });
    }

    // Time range selector
    const timeRange = document.getElementById('usTimeRange');
    if (timeRange) {
        timeRange.addEventListener('change', (e) => {
            currentTimeRange = e.target.value;
            updateUSCharts();
            showUSNotification(`Updated to ${e.target.selectedOptions[0].text}`, 'info');
        });
    }

    // Map layer controls
    document.querySelectorAll('.map-control-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.map-control-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            currentLayer = e.target.dataset.layer;
            updateUSMapLayer();
            showUSNotification(`Switched to ${e.target.textContent}`, 'info');
        });
    });
}

// Initialize charts
function initializeUSCharts() {
    try {
        // National flood trend chart
        const nationalTrendCtx = document.getElementById('nationalFloodTrendChart');
        if (nationalTrendCtx) {
            createNationalFloodTrendChart(nationalTrendCtx);
        }

        // Regional precipitation chart
        const regionalPrecipCtx = document.getElementById('regionalPrecipitationChart');
        if (regionalPrecipCtx) {
            createRegionalPrecipitationChart(regionalPrecipCtx);
        }

        // US river levels chart
        const usRiverCtx = document.getElementById('usRiverLevelsChart');
        if (usRiverCtx) {
            createUSRiverLevelsChart(usRiverCtx);
        }

        // National precipitation forecast chart
        const nationalPrecipForecastCtx = document.getElementById('nationalPrecipitationForecastChart');
        if (nationalPrecipForecastCtx) {
            createNationalPrecipitationForecastChart(nationalPrecipForecastCtx);
        }

        console.log('📊 United States charts initialized');
    } catch (error) {
        console.error('❌ US Chart initialization error:', error);
    }
}

// Create national flood trend chart
function createNationalFloodTrendChart(ctx) {
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['July', 'August', 'September', 'October', 'November', 'December'],
            datasets: [{
                label: 'Active Flood Events',
                data: unitedStatesData.nationalData.floodTrend,
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                    title: { display: true, text: 'Number of Events', color: '#cbd5e0' }
                },
                x: { 
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                }
            },
            plugins: {
                legend: { labels: { color: '#cbd5e0' } }
            }
        }
    });
}

// Create regional precipitation chart
function createRegionalPrecipitationChart(ctx) {
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: unitedStatesData.nationalData.regionalPrecipitation.map(r => r.region),
            datasets: [{
                label: 'Precipitation (inches)',
                data: unitedStatesData.nationalData.regionalPrecipitation.map(r => r.precipitation),
                backgroundColor: [
                    'rgba(239, 68, 68, 0.6)',
                    'rgba(245, 158, 11, 0.6)',
                    'rgba(59, 130, 246, 0.6)',
                    'rgba(16, 185, 129, 0.6)',
                    'rgba(139, 92, 246, 0.6)',
                    'rgba(236, 72, 153, 0.6)'
                ],
                borderColor: [
                    '#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                    title: { display: true, text: 'Inches', color: '#cbd5e0' }
                },
                x: { 
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                }
            },
            plugins: {
                legend: { labels: { color: '#cbd5e0' } }
            }
        }
    });
}

// Create US river levels chart
function createUSRiverLevelsChart(ctx) {
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['July', 'August', 'September', 'October', 'November', 'December'],
            datasets: [
                {
                    label: 'Mississippi River (ft)',
                    data: unitedStatesData.nationalData.riverLevels['Mississippi River'],
                    borderColor: '#dc2626',
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    fill: false
                },
                {
                    label: 'Trinity River (ft)',
                    data: unitedStatesData.nationalData.riverLevels['Trinity River'],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    fill: false
                },
                {
                    label: 'Columbia River (ft)',
                    data: unitedStatesData.nationalData.riverLevels['Columbia River'],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                    title: { display: true, text: 'Water Level (feet)', color: '#cbd5e0' }
                },
                x: { 
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                }
            },
            plugins: {
                legend: { labels: { color: '#cbd5e0' } }
            }
        }
    });
}

// Create national precipitation forecast chart
function createNationalPrecipitationForecastChart(ctx) {
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
            datasets: [{
                label: 'Predicted Precipitation (inches)',
                data: unitedStatesData.nationalData.forecast.precipitation,
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: '#3b82f6',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                    title: { display: true, text: 'Inches', color: '#cbd5e0' }
                },
                x: { 
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                }
            },
            plugins: {
                legend: { labels: { color: '#cbd5e0' } }
            }
        }
    });
}

// Setup tab navigation
function setupUSTabNavigation() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetTab = e.currentTarget.dataset.tab;
            switchUSTab(targetTab);
        });
    });
}

// Switch between tabs
function switchUSTab(tabName) {
    // Update button states
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });

    // Update content visibility
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        if (content.id === `${tabName}-tab`) {
            content.classList.add('active');
        }
    });

    console.log(`📋 Switched to ${tabName} tab`);
}

// Update US statistics
function updateUSStatistics() {
    try {
        let totalPopulationAtRisk = 0;
        let activeWarnings = 0;
        let statesAffected = 0;
        let totalEconomicImpact = 0;

        Object.values(unitedStatesData.states).forEach(state => {
            totalPopulationAtRisk += state.populationAtRisk;
            totalEconomicImpact += state.economicImpact;
            
            if (state.risk === 'high' || state.risk === 'extreme') {
                statesAffected++;
            }
            
            // Count active warnings from river status
            state.riverStatus.forEach(river => {
                if (river.status === 'warning' || river.status === 'critical') {
                    activeWarnings++;
                }
            });
        });

        // Update DOM elements
        updateUSStatElement('activeFloodsUS', activeWarnings);
        updateUSStatElement('statesAffectedUS', statesAffected);
        updateUSStatElement('peopleAtRiskUS', formatUSNumber(totalPopulationAtRisk));
        updateUSStatElement('evacuationCentersUS', 89);
        updateUSStatElement('economicImpactUS', `$${formatUSNumber(totalEconomicImpact / 1000000)}M`);

        console.log('📊 United States statistics updated');
    } catch (error) {
        console.error('❌ US Statistics update error:', error);
    }
}

// Update a statistic element
function updateUSStatElement(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
        element.style.animation = 'pulse 0.5s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }
}

// Format number for display
function formatUSNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
}

// Get color based on risk level
function getUSRiskColor(risk) {
    const colors = {
        'extreme': '#dc2626',
        'high': '#ef4444',
        'moderate': '#f59e0b',
        'low': '#3b82f6',
        'minimal': '#10b981'
    };
    return colors[risk] || '#94a3b8';
}

// Get color based on river status
function getUSRiverStatusColor(status) {
    const colors = {
        'critical': '#dc2626',
        'warning': '#f59e0b',
        'watch': '#3b82f6',
        'normal': '#10b981'
    };
    return colors[status] || '#94a3b8';
}

// Update charts based on current settings
function updateUSCharts() {
    console.log(`📊 Updating US charts for ${currentTimeRange}`);
    // In a real application, this would update chart data based on time range
}

// Update map layer
function updateUSMapLayer() {
    console.log(`🔄 Switched to ${currentLayer} layer`);
    
    // In a real application, this would show different overlays
    switch (currentLayer) {
        case 'states':
            // Show state risk levels
            break;
        case 'rivers':
            // Highlight river systems
            break;
        case 'weather':
            // Show weather patterns
            break;
        case 'infrastructure':
            // Show infrastructure data
            break;
    }
}

// Zoom to US regions
function zoomToUSRegion(region) {
    const regions = {
        'national': { center: [39.8283, -98.5795], zoom: 4 },
        'west': { center: [40.0150, -120.0000], zoom: 5 },
        'central': { center: [40.0000, -95.0000], zoom: 5 },
        'east': { center: [38.0000, -78.0000], zoom: 5 },
        'south': { center: [30.0000, -90.0000], zoom: 5 }
    };
    
    if (regions[region]) {
        usMap.setView(regions[region].center, regions[region].zoom);
        showUSNotification(`Zoomed to ${region} region`, 'info');
    }
}

// Start data update interval
function startUSDataUpdates() {
    updateInterval = setInterval(() => {
        updateUSStatistics();
        // Simulate small data changes
        simulateUSDataChanges();
    }, 60000); // Update every 60 seconds

    console.log('⏰ US data update interval started (60s)');
}

// Simulate data changes for demo
function simulateUSDataChanges() {
    // Add small random variations
    Object.values(unitedStatesData.states).forEach(state => {
        const variation = Math.random() * 0.03 - 0.015; // ±1.5% variation
        state.populationAtRisk = Math.floor(state.populationAtRisk * (1 + variation));
    });
    
    updateUSStatistics();
}

// Toggle US emergency details modal
function toggleUSEmergencyDetails() {
    const modal = document.getElementById('usEmergencyModal');
    if (modal.style.display === 'none' || !modal.style.display) {
        modal.style.display = 'flex';
        modal.style.animation = 'fadeIn 0.3s ease';
    } else {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// Show notification
function showUSNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    const styles = {
        position: 'fixed',
        top: '120px',
        right: '20px',
        background: type === 'error' ? '#dc2626' : type === 'warning' ? '#f59e0b' : '#3b82f6',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        zIndex: '1000',
        fontSize: '0.9rem',
        fontWeight: '500',
        maxWidth: '300px',
        animation: 'slideInRight 0.3s ease'
    };

    Object.assign(notification.style, styles);
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Error handling
window.addEventListener('error', (e) => {
    console.error('❌ US Application error:', e.error);
    showUSNotification('An error occurred. Some features may not work correctly.', 'error');
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
});

console.log('🚀 FloodPlan United States - Script loaded successfully');
