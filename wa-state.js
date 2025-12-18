// FloodPlan Washington State - County-Level Flood Risk Assessment
// 6-Month Historical Analysis & Real-Time Monitoring

// Global variables
let waMap;
let currentLayer = 'counties';
let currentTimeRange = '6months';
let countyPolygons = [];
let riverMarkers = [];
let updateInterval;

// Washington State county flood data
const washingtonData = {
    counties: {
        'king': {
            name: 'King County',
            center: [47.5480, -121.9836],
            risk: 'high',
            population: 2269675,
            populationAtRisk: 85000,
            activeGauges: 23,
            trend: '+15%',
            trendDirection: 'up',
            majorRivers: ['Green River', 'Cedar River', 'White River'],
            currentConditions: {
                rainfall6Month: '16.8 inches',
                riverLevel: '85%',
                temperature: '+2.1°F above normal',
                snowpack: '115% of normal'
            },
            riverStatus: [
                { name: 'Green River', status: 'warning', level: '12.3 ft', floodStage: '11.5 ft' },
                { name: 'Cedar River', status: 'normal', level: '8.7 ft', floodStage: '12.0 ft' },
                { name: 'White River', status: 'watch', level: '9.1 ft', floodStage: '11.0 ft' }
            ]
        },
        'skagit': {
            name: 'Skagit County',
            center: [48.4618, -121.4167],
            risk: 'high',
            population: 129523,
            populationAtRisk: 28000,
            activeGauges: 8,
            trend: '+22%',
            trendDirection: 'up',
            majorRivers: ['Skagit River', 'Sauk River'],
            currentConditions: {
                rainfall6Month: '22.3 inches',
                riverLevel: '88%',
                temperature: '+1.9°F above normal',
                snowpack: '128% of normal'
            },
            riverStatus: [
                { name: 'Skagit River', status: 'warning', level: '18.7 ft', floodStage: '22.0 ft' },
                { name: 'Sauk River', status: 'watch', level: '12.1 ft', floodStage: '15.0 ft' }
            ]
        },
        'pierce': {
            name: 'Pierce County',
            center: [47.0379, -122.1276],
            risk: 'moderate',
            population: 921130,
            populationAtRisk: 12000,
            activeGauges: 12,
            trend: '+8%',
            trendDirection: 'up',
            majorRivers: ['Puyallup River', 'Carbon River'],
            currentConditions: {
                rainfall6Month: '13.2 inches',
                riverLevel: '68%',
                temperature: '+1.8°F above normal',
                snowpack: '112% of normal'
            },
            riverStatus: [
                { name: 'Puyallup River', status: 'normal', level: '8.2 ft', floodStage: '12.0 ft' },
                { name: 'Carbon River', status: 'normal', level: '6.5 ft', floodStage: '9.0 ft' }
            ]
        },
        'snohomish': {
            name: 'Snohomish County',
            center: [48.0330, -121.8339],
            risk: 'moderate',
            population: 827957,
            populationAtRisk: 15000,
            activeGauges: 9,
            trend: '+2%',
            trendDirection: 'stable',
            majorRivers: ['Snohomish River', 'Pilchuck River'],
            currentConditions: {
                rainfall6Month: '12.8 inches',
                riverLevel: '62%',
                temperature: '+1.5°F above normal',
                snowpack: '108% of normal'
            },
            riverStatus: [
                { name: 'Snohomish River', status: 'normal', level: '7.9 ft', floodStage: '11.5 ft' },
                { name: 'Pilchuck River', status: 'normal', level: '5.3 ft', floodStage: '8.0 ft' }
            ]
        },
        'clark': {
            name: 'Clark County',
            center: [45.7466, -122.4943],
            risk: 'low',
            population: 503311,
            populationAtRisk: 8000,
            activeGauges: 5,
            trend: '-5%',
            trendDirection: 'down',
            majorRivers: ['Columbia River', 'Lewis River'],
            currentConditions: {
                rainfall6Month: '9.8 inches',
                riverLevel: '45%',
                temperature: '+1.2°F above normal',
                snowpack: '95% of normal'
            },
            riverStatus: [
                { name: 'Columbia River', status: 'normal', level: '12.1 ft', floodStage: '16.0 ft' },
                { name: 'Lewis River', status: 'normal', level: '4.8 ft', floodStage: '8.5 ft' }
            ]
        }
    },
    historicalData: {
        sixMonthRainfall: [8.2, 12.5, 15.8, 18.3, 16.7, 14.2], // July to December 2024
        temperature: [67.2, 69.8, 72.1, 71.5, 68.9, 65.3], // Average temps
        riverLevels: {
            'Green River': [8.5, 9.2, 10.8, 12.1, 13.1, 12.3],
            'Skagit River': [15.2, 16.8, 18.9, 20.1, 19.3, 18.7],
            'Puyallup River': [6.8, 7.5, 8.9, 10.2, 9.1, 8.2]
        }
    },
    forecast: {
        precipitation: [0.8, 1.2, 2.1, 3.5, 4.2, 2.8, 1.5, 0.9, 0.6, 1.1], // Next 10 days
        temperatures: [45, 47, 48, 46, 44, 43, 45, 47, 49, 48]
    }
};

// Initialize Washington State application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌊 FloodPlan Washington State - Initializing...');
    
    try {
        initializeWAMap();
        setupWAEventListeners();
        initializeWACharts();
        updateWAStatistics();
        setupWATabNavigation();
        startWADataUpdates();
        
        console.log('✅ FloodPlan Washington State - Initialization complete');
    } catch (error) {
        console.error('❌ WA Initialization error:', error);
        showWANotification('System initialization failed. Please refresh the page.', 'error');
    }
});

// Initialize Washington State map
function initializeWAMap() {
    // Center on Washington State
    waMap = L.map('waMap', {
        center: [47.7511, -120.7401],
        zoom: 7,
        minZoom: 6,
        maxZoom: 12,
        zoomControl: true
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
    }).addTo(waMap);

    // Add county boundaries and data
    addWACountyOverlays();
    addWARiverMarkers();

    // Set up map interactions
    waMap.on('click', onWAMapClick);

    console.log('🗺️ Washington State map initialized');
}

// Add county overlay polygons
function addWACountyOverlays() {
    // Simplified county boundary coordinates (in real app, would use GeoJSON)
    const countyBoundaries = {
        'king': [
            [47.1553, -121.0757], [47.7764, -121.0757], [47.7764, -122.5429], [47.1553, -122.5429]
        ],
        'skagit': [
            [48.2096, -121.0000], [48.7000, -121.0000], [48.7000, -121.8000], [48.2096, -121.8000]
        ],
        'pierce': [
            [46.8172, -121.5000], [47.3500, -121.5000], [47.3500, -122.7500], [46.8172, -122.7500]
        ],
        'snohomish': [
            [47.7500, -121.0000], [48.2000, -121.0000], [48.2000, -122.3000], [47.7500, -122.3000]
        ],
        'clark': [
            [45.5000, -122.0000], [46.0000, -122.0000], [46.0000, -122.8000], [45.5000, -122.8000]
        ]
    };

    Object.keys(countyBoundaries).forEach(countyKey => {
        const county = washingtonData.counties[countyKey];
        if (county) {
            const polygon = L.polygon(countyBoundaries[countyKey], {
                fillColor: getWARiskColor(county.risk),
                weight: 2,
                opacity: 0.8,
                color: '#ffffff',
                fillOpacity: 0.6
            }).addTo(waMap);

            polygon.bindPopup(createCountyPopup(county));
            polygon.on('click', () => updateCountyInfo(county));
            
            countyPolygons.push(polygon);
        }
    });
}

// Add river system markers
function addWARiverMarkers() {
    const riverData = [
        { name: 'Green River', location: [47.3548, -122.2285], status: 'warning' },
        { name: 'Skagit River', location: [48.4037, -121.5515], status: 'warning' },
        { name: 'Puyallup River', location: [47.1854, -122.3095], status: 'normal' },
        { name: 'Cedar River', location: [47.4510, -122.0326], status: 'normal' },
        { name: 'Snohomish River', location: [47.9129, -122.1004], status: 'normal' }
    ];

    riverData.forEach(river => {
        const marker = L.circleMarker(river.location, {
            radius: 6,
            fillColor: getWARiverStatusColor(river.status),
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(waMap);

        marker.bindPopup(`
            <div style="font-family: 'Inter', sans-serif;">
                <h4 style="margin: 0 0 0.5rem 0;">${river.name}</h4>
                <p style="margin: 0; color: ${getWARiverStatusColor(river.status)};">
                    Status: ${river.status.charAt(0).toUpperCase() + river.status.slice(1)}
                </p>
            </div>
        `);

        riverMarkers.push(marker);
    });
}

// Create county popup content
function createCountyPopup(county) {
    return `
        <div style="font-family: 'Inter', sans-serif; max-width: 250px;">
            <h4 style="margin: 0 0 0.8rem 0; color: ${getWARiskColor(county.risk)};">
                ${county.name}
            </h4>
            <div style="margin-bottom: 0.8rem;">
                <span style="background: ${getWARiskColor(county.risk)}20; padding: 0.3rem 0.6rem; border-radius: 10px; font-size: 0.8rem; font-weight: 600;">
                    ${county.risk.toUpperCase()} RISK
                </span>
            </div>
            <div style="font-size: 0.9rem; line-height: 1.4;">
                <div style="margin-bottom: 0.4rem;">👥 <strong>${county.populationAtRisk.toLocaleString()}</strong> at risk</div>
                <div style="margin-bottom: 0.4rem;">📊 <strong>${county.trend}</strong> 6-month trend</div>
                <div style="margin-bottom: 0.4rem;">🌊 <strong>${county.majorRivers.length}</strong> major rivers</div>
                <div>📡 <strong>${county.activeGauges}</strong> monitoring gauges</div>
            </div>
        </div>
    `;
}

// Update county information panel
function updateCountyInfo(county) {
    const countyInfoElement = document.getElementById('countyInfo');
    
    const riskBadge = `<span class="risk-level ${county.risk}">${county.risk.toUpperCase()} RISK</span>`;
    
    countyInfoElement.innerHTML = `
        <div class="county-details">
            <div class="county-header">
                <h4 style="color: #f1f5f9; margin-bottom: 0.8rem; font-size: 1.3rem;">
                    ${county.name} ${riskBadge}
                </h4>
            </div>
            
            <div class="county-stats-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                <div style="background: rgba(51, 65, 85, 0.5); padding: 1rem; border-radius: 10px; text-align: center;">
                    <div style="font-size: 1.4rem; font-weight: 700; color: #f1f5f9; margin-bottom: 0.3rem;">
                        ${county.populationAtRisk.toLocaleString()}
                    </div>
                    <div style="font-size: 0.8rem; color: #94a3b8;">Population at Risk</div>
                </div>
                <div style="background: rgba(51, 65, 85, 0.5); padding: 1rem; border-radius: 10px; text-align: center;">
                    <div style="font-size: 1.4rem; font-weight: 700; color: #f1f5f9; margin-bottom: 0.3rem;">
                        ${county.activeGauges}
                    </div>
                    <div style="font-size: 0.8rem; color: #94a3b8;">Active Gauges</div>
                </div>
            </div>

            <div class="current-conditions" style="margin-bottom: 1.5rem;">
                <h5 style="color: #f1f5f9; margin-bottom: 1rem;">6-Month Conditions</h5>
                <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                    <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(59, 130, 246, 0.1);">
                        <span style="color: #94a3b8; font-size: 0.85rem;">Rainfall Total</span>
                        <span style="color: #f1f5f9; font-size: 0.85rem; font-weight: 600;">${county.currentConditions.rainfall6Month}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(59, 130, 246, 0.1);">
                        <span style="color: #94a3b8; font-size: 0.85rem;">River Capacity</span>
                        <span style="color: #f1f5f9; font-size: 0.85rem; font-weight: 600;">${county.currentConditions.riverLevel}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(59, 130, 246, 0.1);">
                        <span style="color: #94a3b8; font-size: 0.85rem;">Temperature</span>
                        <span style="color: #f1f5f9; font-size: 0.85rem; font-weight: 600;">${county.currentConditions.temperature}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                        <span style="color: #94a3b8; font-size: 0.85rem;">Snowpack</span>
                        <span style="color: #f1f5f9; font-size: 0.85rem; font-weight: 600;">${county.currentConditions.snowpack}</span>
                    </div>
                </div>
            </div>

            <div class="major-rivers-section">
                <h5 style="color: #f1f5f9; margin-bottom: 1rem;">Major River Systems</h5>
                <div class="river-status-list">
                    ${county.riverStatus.map(river => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.8rem; background: rgba(51, 65, 85, 0.5); border-radius: 10px; margin-bottom: 0.8rem;">
                            <div>
                                <div style="color: #f1f5f9; font-weight: 600; margin-bottom: 0.3rem;">${river.name}</div>
                                <div style="color: #94a3b8; font-size: 0.8rem;">Current: ${river.level} | Flood: ${river.floodStage}</div>
                            </div>
                            <span style="background: ${getWARiverStatusColor(river.status)}20; color: ${getWARiverStatusColor(river.status)}; padding: 0.3rem 0.6rem; border-radius: 8px; font-size: 0.75rem; font-weight: 600;">
                                ${river.status.toUpperCase()}
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="trend-summary" style="margin-top: 1.5rem; padding: 1rem; background: rgba(59, 130, 246, 0.1); border-radius: 10px; border-left: 3px solid #3b82f6;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #93c5fd; font-weight: 600;">6-Month Trend</span>
                    <span style="color: #f1f5f9; font-size: 1.1rem; font-weight: 700;">
                        ${county.trend} ${county.trendDirection === 'up' ? '↗' : county.trendDirection === 'down' ? '↘' : '→'}
                    </span>
                </div>
            </div>
        </div>
    `;
    
    showWANotification(`Selected ${county.name} - ${county.risk} risk level`, 'info');
}

// Handle map click events
function onWAMapClick(e) {
    console.log('Map clicked at:', e.latlng);
}

// Setup event listeners
function setupWAEventListeners() {
    // County selector
    const countySelect = document.getElementById('countySelect');
    if (countySelect) {
        countySelect.addEventListener('change', (e) => {
            const selectedCounty = e.target.value;
            if (selectedCounty === 'all') {
                waMap.setView([47.7511, -120.7401], 7);
            } else if (washingtonData.counties[selectedCounty]) {
                const county = washingtonData.counties[selectedCounty];
                waMap.setView(county.center, 9);
                updateCountyInfo(county);
            }
        });
    }

    // Time range selector
    const timeRange = document.getElementById('timeRange');
    if (timeRange) {
        timeRange.addEventListener('change', (e) => {
            currentTimeRange = e.target.value;
            updateWACharts();
            showWANotification(`Updated to ${e.target.selectedOptions[0].text}`, 'info');
        });
    }

    // Map layer controls
    document.querySelectorAll('.map-control-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.map-control-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            currentLayer = e.target.dataset.layer;
            updateWAMapLayer();
            showWANotification(`Switched to ${e.target.textContent}`, 'info');
        });
    });
}

// Initialize charts
function initializeWACharts() {
    try {
        // 6-Month rainfall chart
        const sixMonthRainCtx = document.getElementById('sixMonthRainChart');
        if (sixMonthRainCtx) {
            createSixMonthRainfallChart(sixMonthRainCtx);
        }

        // Temperature & Snowmelt chart
        const tempSnowCtx = document.getElementById('tempSnowChart');
        if (tempSnowCtx) {
            createTempSnowChart(tempSnowCtx);
        }

        // River levels chart
        const riverLevelsCtx = document.getElementById('riverLevelsChart');
        if (riverLevelsCtx) {
            createRiverLevelsChart(riverLevelsCtx);
        }

        // Precipitation forecast chart
        const precipForecastCtx = document.getElementById('precipitationForecastChart');
        if (precipForecastCtx) {
            createPrecipitationForecastChart(precipForecastCtx);
        }

        console.log('📊 Washington State charts initialized');
    } catch (error) {
        console.error('❌ WA Chart initialization error:', error);
    }
}

// Create 6-month rainfall chart
function createSixMonthRainfallChart(ctx) {
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['July', 'August', 'September', 'October', 'November', 'December'],
            datasets: [
                {
                    label: 'Actual Rainfall (inches)',
                    data: washingtonData.historicalData.sixMonthRainfall,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Historical Average',
                    data: [6.2, 8.8, 11.2, 13.5, 12.8, 10.1],
                    borderColor: '#94a3b8',
                    borderDash: [5, 5],
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

// Create temperature & snowmelt chart
function createTempSnowChart(ctx) {
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['July', 'August', 'September', 'October', 'November', 'December'],
            datasets: [
                {
                    label: 'Average Temperature (°F)',
                    data: washingtonData.historicalData.temperature,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    yAxisID: 'y'
                },
                {
                    label: 'Snowpack Level (%)',
                    data: [85, 78, 95, 108, 118, 115],
                    borderColor: '#06b6d4',
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    fill: true,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                    title: { display: true, text: 'Temperature (°F)', color: '#cbd5e0' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    ticks: { color: '#94a3b8' },
                    grid: { drawOnChartArea: false },
                    title: { display: true, text: 'Snowpack (%)', color: '#cbd5e0' }
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

// Create river levels chart
function createRiverLevelsChart(ctx) {
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['July', 'August', 'September', 'October', 'November', 'December'],
            datasets: [
                {
                    label: 'Green River (ft)',
                    data: washingtonData.historicalData.riverLevels['Green River'],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: false
                },
                {
                    label: 'Skagit River (ft)',
                    data: washingtonData.historicalData.riverLevels['Skagit River'],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    fill: false
                },
                {
                    label: 'Puyallup River (ft)',
                    data: washingtonData.historicalData.riverLevels['Puyallup River'],
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

// Create precipitation forecast chart
function createPrecipitationForecastChart(ctx) {
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10'],
            datasets: [{
                label: 'Predicted Precipitation (inches)',
                data: washingtonData.forecast.precipitation,
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
function setupWATabNavigation() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetTab = e.currentTarget.dataset.tab;
            switchWATab(targetTab);
        });
    });
}

// Switch between tabs
function switchWATab(tabName) {
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

// Update Washington State statistics
function updateWAStatistics() {
    try {
        let totalPopulationAtRisk = 0;
        let activeWarnings = 0;
        let countiesAffected = 0;

        Object.values(washingtonData.counties).forEach(county => {
            totalPopulationAtRisk += county.populationAtRisk;
            if (county.risk === 'high' || county.risk === 'extreme') {
                countiesAffected++;
            }
            // Count active warnings from river status
            county.riverStatus.forEach(river => {
                if (river.status === 'warning' || river.status === 'critical') {
                    activeWarnings++;
                }
            });
        });

        // Update DOM elements
        updateWAStatElement('activeFloodsWA', activeWarnings);
        updateWAStatElement('countiesAffectedWA', countiesAffected);
        updateWAStatElement('rainfallTotalWA', '14.2"');
        updateWAStatElement('riverLevelWA', '78%');
        updateWAStatElement('peopleAtRiskWA', formatWANumber(totalPopulationAtRisk));

        console.log('📊 Washington State statistics updated');
    } catch (error) {
        console.error('❌ WA Statistics update error:', error);
    }
}

// Update a statistic element
function updateWAStatElement(elementId, value) {
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
function formatWANumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
}

// Get color based on risk level
function getWARiskColor(risk) {
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
function getWARiverStatusColor(status) {
    const colors = {
        'critical': '#dc2626',
        'warning': '#f59e0b',
        'watch': '#3b82f6',
        'normal': '#10b981'
    };
    return colors[status] || '#94a3b8';
}

// Update charts based on current settings
function updateWACharts() {
    console.log(`📊 Updating WA charts for ${currentTimeRange}`);
    // In a real application, this would update chart data based on time range
}

// Update map layer
function updateWAMapLayer() {
    console.log(`🔄 Switched to ${currentLayer} layer`);
    
    // In a real application, this would show different overlays
    switch (currentLayer) {
        case 'counties':
            // Show county risk levels
            break;
        case 'rivers':
            // Highlight river systems
            break;
        case 'precipitation':
            // Show precipitation overlay
            break;
        case 'elevation':
            // Show elevation data
            break;
    }
}

// Start data update interval
function startWADataUpdates() {
    updateInterval = setInterval(() => {
        updateWAStatistics();
        // Simulate small data changes
        simulateWADataChanges();
    }, 45000); // Update every 45 seconds

    console.log('⏰ WA data update interval started (45s)');
}

// Simulate data changes for demo
function simulateWADataChanges() {
    // Add small random variations
    Object.values(washingtonData.counties).forEach(county => {
        const variation = Math.random() * 0.05 - 0.025; // ±2.5% variation
        county.populationAtRisk = Math.floor(county.populationAtRisk * (1 + variation));
    });
    
    updateWAStatistics();
}

// Toggle WA emergency details modal
function toggleWAEmergencyDetails() {
    const modal = document.getElementById('waEmergencyModal');
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
function showWANotification(message, type = 'info') {
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
    console.error('❌ WA Application error:', e.error);
    showWANotification('An error occurred. Some features may not work correctly.', 'error');
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
});

console.log('🚀 FloodPlan Washington State - Script loaded successfully');
