// FloodPlan Global - Worldwide Flood Risk Assessment Platform
// Interactive World Map and Emergency Response System

// Global variables
let worldMap;
let currentLayer = 'risk';
let currentTimeframe = 'current';
let emergencyMarkers = [];
let riskPolygons = [];
let updateInterval;

// Flood risk data simulation (in a real application, this would come from APIs)
const globalFloodData = {
    regions: {
        'asia-pacific': {
            name: 'Asia-Pacific',
            center: [35, 105],
            risk: 'extreme',
            affected: 847000,
            activeFloods: 12,
            description: 'Monsoon season causing widespread flooding across river systems',
            details: {
                precipitation: '+45% above normal',
                temperature: '+2.1°C',
                riverLevels: 'Critical (>90% capacity)',
                evacuations: '145,000 people',
                shelters: 89,
                rescueUnits: 67
            }
        },
        'europe': {
            name: 'Europe',
            center: [54, 15],
            risk: 'high',
            affected: 234000,
            activeFloods: 6,
            description: 'Alpine snowmelt raising river levels across major watersheds',
            details: {
                precipitation: '+15% above normal',
                temperature: '+1.8°C',
                riverLevels: 'High (75-85% capacity)',
                evacuations: '23,000 people',
                shelters: 34,
                rescueUnits: 28
            }
        },
        'south-america': {
            name: 'South America',
            center: [-15, -60],
            risk: 'moderate',
            affected: 156000,
            activeFloods: 3,
            description: 'Seasonal rainfall patterns with localized flooding',
            details: {
                precipitation: '+8% above normal',
                temperature: '+1.2°C',
                riverLevels: 'Moderate (60-70% capacity)',
                evacuations: '12,000 people',
                shelters: 18,
                rescueUnits: 15
            }
        },
        'africa': {
            name: 'Africa',
            center: [0, 20],
            risk: 'moderate',
            affected: 98000,
            activeFloods: 2,
            description: 'Irregular rainfall patterns affecting drought-recovery areas',
            details: {
                precipitation: '-5% below normal',
                temperature: '+1.5°C',
                riverLevels: 'Normal (45-55% capacity)',
                evacuations: '8,000 people',
                shelters: 12,
                rescueUnits: 8
            }
        },
        'north-america': {
            name: 'North America',
            center: [45, -100],
            risk: 'low',
            affected: 45000,
            activeFloods: 0,
            description: 'Stable conditions with normal seasonal patterns',
            details: {
                precipitation: '-10% below normal',
                temperature: '+0.8°C',
                riverLevels: 'Low (30-40% capacity)',
                evacuations: '0 people',
                shelters: 5,
                rescueUnits: 3
            }
        }
    },
    emergencyZones: [
        {
            location: [23.8, 90.3],
            name: 'Bangladesh Delta',
            severity: 'critical',
            type: 'monsoon',
            affected: 500000,
            description: 'Extreme monsoon flooding in Brahmaputra basin'
        },
        {
            location: [50.1, 8.7],
            name: 'Rhine Valley',
            severity: 'warning',
            type: 'snowmelt',
            affected: 150000,
            description: 'Rapid snowmelt causing river level rise'
        },
        {
            location: [-27.5, 153.0],
            name: 'Queensland Coast',
            severity: 'watch',
            type: 'cyclone',
            affected: 300000,
            description: 'Tropical cyclone approaching with flood potential'
        }
    ]
};

// Chart data for global visualizations
const chartConfigs = {
    globalFlood: {
        type: 'doughnut',
        data: {
            labels: ['Extreme Risk', 'High Risk', 'Moderate Risk', 'Low Risk', 'Minimal Risk'],
            datasets: [{
                data: [12, 18, 28, 25, 17],
                backgroundColor: [
                    '#dc2626', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: '#cbd5e0', font: { size: 11 } }
                },
                title: {
                    display: true,
                    text: 'Global Risk Distribution',
                    color: '#f1f5f9'
                }
            }
        }
    },
    precipitation: {
        type: 'line',
        data: {
            labels: Array.from({length: 24}, (_, i) => `${i}:00`),
            datasets: [
                {
                    label: 'Global Average (mm/hr)',
                    data: [2.1, 1.8, 1.5, 1.2, 0.9, 1.1, 1.8, 2.4, 3.2, 4.1, 5.2, 6.8, 
                           7.2, 6.9, 5.5, 4.8, 4.2, 3.9, 3.5, 3.1, 2.8, 2.5, 2.3, 2.2],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Critical Threshold',
                    data: Array(24).fill(5.0),
                    borderColor: '#dc2626',
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
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                },
                x: { 
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                }
            },
            plugins: {
                legend: { 
                    labels: { color: '#cbd5e0' }
                }
            }
        }
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌊 FloodPlan Global - Initializing...');
    
    try {
        // Check if required libraries are loaded
        if (typeof L === 'undefined') {
            console.warn('⚠️ Leaflet library not loaded, map features will be limited');
        }
        if (typeof Chart === 'undefined') {
            console.warn('⚠️ Chart.js library not loaded, charts will be limited');
        }

        initializeGlobalMap();
        setupEventListeners();
        initializeCharts();
        updateGlobalStatistics();
        startDataUpdateInterval();
        setupTabNavigation();
        
        console.log('✅ FloodPlan Global - Initialization complete');
    } catch (error) {
        console.error('❌ Initialization error:', error);
        console.error('Error details:', error.message, error.stack);
        showNotificationSafe('System initialization completed with some limitations.', 'warning');
    }
});

// Initialize the world map with Leaflet
function initializeGlobalMap() {
    try {
        // Check if Leaflet is available
        if (typeof L === 'undefined') {
            console.warn('⚠️ Leaflet not available, showing placeholder map');
            showMapPlaceholder();
            return;
        }

        // Initialize the map centered on the world
        worldMap = L.map('worldMap', {
            center: [20, 0],
            zoom: 2,
            minZoom: 2,
            maxZoom: 10,
            zoomControl: true,
            scrollWheelZoom: true,
            doubleClickZoom: true
        });

        // Add base tile layer with dark theme
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(worldMap);

        // Add risk overlay layers
        addRiskOverlays();
        addEmergencyMarkers();

        // Set up map interactions
        worldMap.on('click', onMapClick);
        worldMap.on('zoomend', onMapZoom);

        console.log('🗺️ World map initialized');
    } catch (error) {
        console.error('❌ Map initialization failed:', error);
        showMapPlaceholder();
    }
}

// Show map placeholder when Leaflet is not available
function showMapPlaceholder() {
    const mapElement = document.getElementById('worldMap');
    if (mapElement) {
        mapElement.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
                background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
                border-radius: 25px;
                color: #f1f5f9;
                font-family: 'Inter', sans-serif;
                text-align: center;
                padding: 2rem;
            ">
                <div>
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🌍</div>
                    <h3 style="margin-bottom: 0.5rem; font-weight: 600;">Global Flood Risk Map</h3>
                    <p style="color: #cbd5e0; margin-bottom: 1.5rem;">Interactive world map showing flood risk levels</p>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; max-width: 600px;">
                        <div style="background: rgba(220, 38, 38, 0.2); padding: 1rem; border-radius: 10px; border-left: 3px solid #dc2626;">
                            <div style="font-weight: 600; margin-bottom: 0.5rem;">🔴 Extreme Risk</div>
                            <div style="font-size: 0.9rem; color: #cbd5e0;">Asia-Pacific: 847K affected</div>
                        </div>
                        <div style="background: rgba(239, 68, 68, 0.2); padding: 1rem; border-radius: 10px; border-left: 3px solid #ef4444;">
                            <div style="font-weight: 600; margin-bottom: 0.5rem;">🟡 High Risk</div>
                            <div style="font-size: 0.9rem; color: #cbd5e0;">Europe: 234K affected</div>
                        </div>
                        <div style="background: rgba(245, 158, 11, 0.2); padding: 1rem; border-radius: 10px; border-left: 3px solid #f59e0b;">
                            <div style="font-weight: 600; margin-bottom: 0.5rem;">🟠 Moderate Risk</div>
                            <div style="font-size: 0.9rem; color: #cbd5e0;">S. America: 156K affected</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Add risk overlay polygons to the map
function addRiskOverlays() {
    // Define risk polygons for major regions
    const riskPolygonData = [
        {
            name: 'Bangladesh-India Delta',
            coordinates: [[20, 85], [26, 85], [26, 95], [20, 95]],
            risk: 'extreme',
            popup: 'Critical: Monsoon flooding affecting millions'
        },
        {
            name: 'Central Europe Rivers',
            coordinates: [[45, 5], [55, 5], [55, 20], [45, 20]],
            risk: 'high',
            popup: 'Warning: Alpine snowmelt raising river levels'
        },
        {
            name: 'Amazon Basin',
            coordinates: [[-10, -70], [5, -70], [5, -50], [-10, -50]],
            risk: 'moderate',
            popup: 'Watch: Seasonal flooding in river basin'
        },
        {
            name: 'Queensland Coast',
            coordinates: [[-30, 145], [-20, 145], [-20, 155], [-30, 155]],
            risk: 'high',
            popup: 'Warning: Cyclone approach with flood potential'
        }
    ];

    riskPolygonData.forEach(polygon => {
        const coords = polygon.coordinates.map(coord => [coord[0], coord[1]]);
        
        const riskPolygon = L.polygon(coords, {
            fillColor: getRiskColor(polygon.risk),
            weight: 2,
            opacity: 0.8,
            color: getRiskColor(polygon.risk),
            fillOpacity: 0.3
        }).addTo(worldMap);

        riskPolygon.bindPopup(`
            <div style="font-family: 'Inter', sans-serif; max-width: 250px;">
                <h4 style="margin: 0 0 0.5rem 0; color: ${getRiskColor(polygon.risk)}; font-size: 1rem;">
                    ${polygon.name}
                </h4>
                <p style="margin: 0; font-size: 0.9rem; line-height: 1.4;">
                    ${polygon.popup}
                </p>
            </div>
        `);

        riskPolygons.push(riskPolygon);
    });
}

// Add emergency markers to the map
function addEmergencyMarkers() {
    globalFloodData.emergencyZones.forEach(zone => {
        const marker = createEmergencyMarker(zone);
        emergencyMarkers.push(marker);
    });
}

// Create custom emergency marker
function createEmergencyMarker(zone) {
    const iconHtml = `
        <div style="
            background: ${getEmergencyColor(zone.severity)};
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            animation: pulse 2s infinite;
        ">🚨</div>
    `;

    const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-emergency-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });

    const marker = L.marker(zone.location, { icon: customIcon }).addTo(worldMap);

    marker.bindPopup(`
        <div style="font-family: 'Inter', sans-serif; max-width: 300px;">
            <h4 style="margin: 0 0 0.5rem 0; color: ${getEmergencyColor(zone.severity)}; font-size: 1.1rem;">
                ${zone.name} - ${zone.severity.toUpperCase()}
            </h4>
            <p style="margin: 0 0 0.8rem 0; font-size: 0.9rem; line-height: 1.4;">
                <strong>${zone.type.charAt(0).toUpperCase() + zone.type.slice(1)} Emergency:</strong> 
                ${zone.description}
            </p>
            <div style="font-size: 0.8rem; color: #666;">
                <div style="margin-bottom: 0.3rem;">👥 <strong>${zone.affected.toLocaleString()}</strong> people affected</div>
                <div style="margin-bottom: 0.3rem;">📍 Coordinates: ${zone.location[0].toFixed(1)}°, ${zone.location[1].toFixed(1)}°</div>
            </div>
        </div>
    `);

    return marker;
}

// Get color based on risk level
function getRiskColor(risk) {
    const colors = {
        'extreme': '#dc2626',
        'high': '#ef4444',
        'moderate': '#f59e0b',
        'low': '#3b82f6',
        'minimal': '#10b981'
    };
    return colors[risk] || '#94a3b8';
}

// Get color based on emergency severity
function getEmergencyColor(severity) {
    const colors = {
        'critical': '#dc2626',
        'warning': '#f59e0b',
        'watch': '#3b82f6'
    };
    return colors[severity] || '#94a3b8';
}

// Handle map click events
function onMapClick(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    
    // Find the closest region
    const region = findClosestRegion(lat, lng);
    if (region) {
        updateRegionInfo(region);
        showRegionAnalysis(region);
    }
}

// Find the closest region to clicked coordinates
function findClosestRegion(lat, lng) {
    let closestRegion = null;
    let minDistance = Infinity;

    Object.values(globalFloodData.regions).forEach(region => {
        const distance = calculateDistance(lat, lng, region.center[0], region.center[1]);
        if (distance < minDistance) {
            minDistance = distance;
            closestRegion = region;
        }
    });

    return closestRegion;
}

// Calculate distance between two coordinates
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Update region information panel
function updateRegionInfo(region) {
    const regionInfoElement = document.getElementById('regionInfo');
    
    const riskBadge = `<span class="risk-level ${region.risk}">${region.risk.toUpperCase()}</span>`;
    
    regionInfoElement.innerHTML = `
        <div class="region-details">
            <div class="region-header">
                <h4 style="color: #f1f5f9; margin-bottom: 0.8rem; font-size: 1.2rem;">
                    ${region.name} Analysis ${riskBadge}
                </h4>
            </div>
            
            <div class="region-stats" style="margin-bottom: 1.5rem;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    <div style="background: rgba(51, 65, 85, 0.5); padding: 1rem; border-radius: 10px; text-align: center;">
                        <div style="font-size: 1.5rem; font-weight: 700; color: #f1f5f9; margin-bottom: 0.3rem;">
                            ${region.affected.toLocaleString()}
                        </div>
                        <div style="font-size: 0.8rem; color: #94a3b8;">People Affected</div>
                    </div>
                    <div style="background: rgba(51, 65, 85, 0.5); padding: 1rem; border-radius: 10px; text-align: center;">
                        <div style="font-size: 1.5rem; font-weight: 700; color: #f1f5f9; margin-bottom: 0.3rem;">
                            ${region.activeFloods}
                        </div>
                        <div style="font-size: 0.8rem; color: #94a3b8;">Active Floods</div>
                    </div>
                </div>
            </div>

            <p style="color: #cbd5e0; margin-bottom: 1.5rem; font-size: 0.9rem; line-height: 1.5;">
                ${region.description}
            </p>

            <div class="detailed-metrics">
                <h5 style="color: #f1f5f9; margin-bottom: 1rem;">Current Conditions</h5>
                <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                    <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(59, 130, 246, 0.1);">
                        <span style="color: #94a3b8; font-size: 0.85rem;">Precipitation</span>
                        <span style="color: #f1f5f9; font-size: 0.85rem; font-weight: 600;">${region.details.precipitation}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(59, 130, 246, 0.1);">
                        <span style="color: #94a3b8; font-size: 0.85rem;">Temperature Anomaly</span>
                        <span style="color: #f1f5f9; font-size: 0.85rem; font-weight: 600;">${region.details.temperature}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(59, 130, 246, 0.1);">
                        <span style="color: #94a3b8; font-size: 0.85rem;">River Levels</span>
                        <span style="color: #f1f5f9; font-size: 0.85rem; font-weight: 600;">${region.details.riverLevels}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                        <span style="color: #94a3b8; font-size: 0.85rem;">Evacuations</span>
                        <span style="color: #f1f5f9; font-size: 0.85rem; font-weight: 600;">${region.details.evacuations}</span>
                    </div>
                </div>
            </div>

            <div class="response-summary" style="margin-top: 1.5rem; padding: 1rem; background: rgba(59, 130, 246, 0.1); border-radius: 10px; border-left: 3px solid #3b82f6;">
                <h6 style="color: #93c5fd; margin-bottom: 0.8rem;">Emergency Response</h6>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span style="color: #cbd5e0; font-size: 0.8rem;">🏠 Shelters Active</span>
                    <span style="color: #f1f5f9; font-size: 0.8rem; font-weight: 600;">${region.details.shelters}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: #cbd5e0; font-size: 0.8rem;">🚁 Rescue Units</span>
                    <span style="color: #f1f5f9; font-size: 0.8rem; font-weight: 600;">${region.details.rescueUnits}</span>
                </div>
            </div>
        </div>
    `;
}

// Handle map zoom events
function onMapZoom(e) {
    const zoom = worldMap.getZoom();
    
    // Show/hide markers based on zoom level
    emergencyMarkers.forEach(marker => {
        if (zoom < 3) {
            marker.setOpacity(0.7);
        } else {
            marker.setOpacity(1);
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Time frame selector
    const timeframeSelect = document.getElementById('riskTimeframe');
    if (timeframeSelect) {
        timeframeSelect.addEventListener('change', (e) => {
            currentTimeframe = e.target.value;
            updateMapData();
            showNotification(`Switched to ${e.target.selectedOptions[0].text}`, 'info');
        });
    }

    // Map layer controls
    document.querySelectorAll('.map-control-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update active state
            document.querySelectorAll('.map-control-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            currentLayer = e.target.dataset.layer;
            updateMapLayer();
            showNotification(`Switched to ${e.target.textContent} layer`, 'info');
        });
    });

    // Emergency mode button
    const emergencyBtn = document.getElementById('emergencyMode');
    if (emergencyBtn) {
        emergencyBtn.addEventListener('click', toggleEmergencyMode);
    }

    // Future predictions button
    const predictionBtn = document.getElementById('togglePrediction');
    if (predictionBtn) {
        predictionBtn.addEventListener('click', togglePredictions);
    }

    // Emergency response buttons
    setupEmergencyResponseButtons();
}

// Setup emergency response button handlers
function setupEmergencyResponseButtons() {
    const responseButtons = {
        'evacuation': showEvacuationRoutes,
        'shelters': showEmergencyShelters,
        'rescue': showRescueUnits,
        'supplies': showSupplyChains
    };

    Object.keys(responseButtons).forEach(type => {
        const btn = document.querySelector(`.response-btn.${type}`);
        if (btn) {
            btn.addEventListener('click', responseButtons[type]);
        }
    });
}

// Initialize charts
function initializeCharts() {
    try {
        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.warn('⚠️ Chart.js not available, showing placeholder charts');
            showChartPlaceholders();
            return;
        }

        // Global flood distribution chart
        const globalFloodCtx = document.getElementById('globalFloodChart');
        if (globalFloodCtx) {
            new Chart(globalFloodCtx, chartConfigs.globalFlood);
        }

        // 24-hour precipitation chart
        const precipitationCtx = document.getElementById('precipitationChart');
        if (precipitationCtx) {
            new Chart(precipitationCtx, chartConfigs.precipitation);
        }

        // Weekly precipitation chart (forecast tab)
        const weeklyPrecipCtx = document.getElementById('weeklyPrecipitationChart');
        if (weeklyPrecipCtx) {
            createWeeklyPrecipitationChart(weeklyPrecipCtx);
        }

        // Climate factors chart
        const climateFactorsCtx = document.getElementById('climateFactorsChart');
        if (climateFactorsCtx) {
            createClimateFactorsChart(climateFactorsCtx);
        }

        // Historical trends chart
        const historicalTrendsCtx = document.getElementById('historicalTrendsChart');
        if (historicalTrendsCtx) {
            createHistoricalTrendsChart(historicalTrendsCtx);
        }

        // Climate impact chart
        const climateImpactCtx = document.getElementById('climateImpactChart');
        if (climateImpactCtx) {
            createClimateImpactChart(climateImpactCtx);
        }

        console.log('📊 Charts initialized successfully');
    } catch (error) {
        console.error('❌ Chart initialization error:', error);
        showChartPlaceholders();
    }
}

// Show chart placeholders when Chart.js is not available
function showChartPlaceholders() {
    const chartContainers = [
        'globalFloodChart',
        'precipitationChart', 
        'weeklyPrecipitationChart',
        'climateFactorsChart',
        'historicalTrendsChart',
        'climateImpactChart'
    ];

    chartContainers.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            const canvas = element.parentNode;
            if (canvas) {
                canvas.innerHTML = `
                    <div style="
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 300px;
                        background: rgba(51, 65, 85, 0.3);
                        border-radius: 15px;
                        color: #cbd5e0;
                        font-family: 'Inter', sans-serif;
                        text-align: center;
                    ">
                        <div>
                            <div style="font-size: 2rem; margin-bottom: 1rem;">📊</div>
                            <div style="font-weight: 600; margin-bottom: 0.5rem;">Chart Placeholder</div>
                            <div style="font-size: 0.9rem; opacity: 0.8;">Data visualization would appear here</div>
                        </div>
                    </div>
                `;
            }
        }
    });
}

// Create weekly precipitation chart
function createWeeklyPrecipitationChart(ctx) {
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Predicted Precipitation (mm)',
                    data: [12, 19, 24, 35, 28, 15, 8],
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderColor: '#3b82f6',
                    borderWidth: 1
                },
                {
                    label: 'Historical Average (mm)',
                    data: [8, 12, 15, 18, 16, 10, 6],
                    type: 'line',
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
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                },
                x: { 
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                }
            },
            plugins: {
                legend: { 
                    labels: { color: '#cbd5e0' }
                }
            }
        }
    });
}

// Create climate factors chart
function createClimateFactorsChart(ctx) {
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Temperature', 'Sea Level', 'Precipitation', 'Storm Intensity', 'Drought Risk', 'Snowpack'],
            datasets: [{
                label: 'Current vs Historical',
                data: [85, 78, 92, 88, 65, 72],
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                borderColor: '#ef4444',
                borderWidth: 2,
                pointBackgroundColor: '#ef4444'
            }]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.2)' },
                    angleLines: { color: 'rgba(148, 163, 184, 0.2)' },
                    pointLabels: { color: '#cbd5e0' }
                }
            },
            plugins: {
                legend: { 
                    labels: { color: '#cbd5e0' }
                }
            }
        }
    });
}

// Create historical trends chart
function createHistoricalTrendsChart(ctx) {
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['2020', '2021', '2022', '2023', '2024'],
            datasets: [
                {
                    label: 'Global Flood Events',
                    data: [45, 52, 48, 61, 58],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Economic Impact (Billions USD)',
                    data: [23, 31, 28, 42, 38],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    fill: true,
                    tension: 0.4,
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
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    ticks: { color: '#94a3b8' },
                    grid: { drawOnChartArea: false }
                },
                x: { 
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                }
            },
            plugins: {
                legend: { 
                    labels: { color: '#cbd5e0' }
                }
            }
        }
    });
}

// Create climate impact chart
function createClimateImpactChart(ctx) {
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Sea Level Rise', 'Temperature Increase', 'Extreme Precipitation', 'Storm Intensity', 'Seasonal Shift'],
            datasets: [{
                label: 'Impact Factor (0-100)',
                data: [85, 78, 92, 75, 68],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.6)',
                    'rgba(239, 68, 68, 0.6)',
                    'rgba(34, 197, 94, 0.6)',
                    'rgba(245, 158, 11, 0.6)',
                    'rgba(168, 85, 247, 0.6)'
                ],
                borderColor: [
                    '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { 
                    beginAtZero: true,
                    max: 100,
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                },
                x: { 
                    ticks: { color: '#94a3b8', maxRotation: 45 },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                }
            },
            plugins: {
                legend: { 
                    display: false
                }
            }
        }
    });
}

// Setup tab navigation
function setupTabNavigation() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetTab = e.currentTarget.dataset.tab;
            switchTab(targetTab);
        });
    });
}

// Switch between tabs
function switchTab(tabName) {
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

// Update global statistics
function updateGlobalStatistics() {
    try {
        // Calculate totals from regional data
        const totals = Object.values(globalFloodData.regions).reduce((acc, region) => {
            acc.affected += region.affected;
            acc.activeFloods += region.activeFloods;
            acc.shelters += region.details.shelters;
            acc.rescueUnits += region.details.rescueUnits;
            return acc;
        }, { affected: 0, activeFloods: 0, shelters: 0, rescueUnits: 0 });

        // Update DOM elements
        updateStatElement('activeFloodsGlobal', totals.activeFloods);
        updateStatElement('peopleAffectedGlobal', formatNumber(totals.affected));
        updateStatElement('sheltersActiveGlobal', totals.shelters);
        updateStatElement('rescueUnitsGlobal', totals.rescueUnits);
        updateStatElement('economicImpactGlobal', '$2.8B'); // Simulated value

        console.log('📊 Global statistics updated');
    } catch (error) {
        console.error('❌ Statistics update error:', error);
    }
}

// Update a statistic element
function updateStatElement(elementId, value) {
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
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
}

// Start data update interval
function startDataUpdateInterval() {
    // Update data every 30 seconds
    updateInterval = setInterval(() => {
        updateGlobalStatistics();
        simulateDataChanges();
    }, 30000);

    console.log('⏰ Data update interval started (30s)');
}

// Simulate data changes for demo purposes
function simulateDataChanges() {
    // Add small random variations to simulate real-time data
    Object.values(globalFloodData.regions).forEach(region => {
        const variation = Math.random() * 0.1 - 0.05; // ±5% variation
        region.affected = Math.floor(region.affected * (1 + variation));
    });
    
    updateGlobalStatistics();
}

// Emergency response functions
function showEvacuationRoutes() {
    worldMap.eachLayer(layer => {
        if (layer.options && layer.options.className === 'evacuation-route') {
            worldMap.removeLayer(layer);
        }
    });

    // Add sample evacuation routes
    const evacuationRoutes = [
        [[23.8, 90.3], [24.0, 90.8], [24.2, 91.2]],
        [[50.1, 8.7], [50.3, 8.9], [50.5, 9.1]]
    ];

    evacuationRoutes.forEach(route => {
        L.polyline(route, {
            color: '#fbbf24',
            weight: 4,
            opacity: 0.8,
            className: 'evacuation-route'
        }).addTo(worldMap).bindPopup('Emergency Evacuation Route');
    });

    showNotification('Evacuation routes displayed on map', 'info');
}

function showEmergencyShelters() {
    // Sample shelter locations
    const shelters = [
        { location: [23.9, 90.5], capacity: 1000 },
        { location: [50.2, 8.8], capacity: 500 },
        { location: [-27.4, 153.1], capacity: 750 }
    ];

    shelters.forEach(shelter => {
        L.circleMarker(shelter.location, {
            radius: 8,
            fillColor: '#22c55e',
            color: '#16a34a',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(worldMap).bindPopup(`Emergency Shelter<br>Capacity: ${shelter.capacity} people`);
    });

    showNotification('Emergency shelters displayed on map', 'info');
}

function showRescueUnits() {
    // Sample rescue unit locations
    const rescueUnits = [
        { location: [24.1, 90.7], type: 'Helicopter' },
        { location: [50.4, 8.9], type: 'Boat Team' },
        { location: [-27.3, 153.2], type: 'Ground Unit' }
    ];

    rescueUnits.forEach(unit => {
        L.marker(unit.location, {
            icon: L.divIcon({
                html: '🚁',
                className: 'rescue-marker',
                iconSize: [20, 20]
            })
        }).addTo(worldMap).bindPopup(`Rescue Unit: ${unit.type}`);
    });

    showNotification('Rescue units displayed on map', 'info');
}

function showSupplyChains() {
    // Sample supply chain routes
    const supplyRoutes = [
        [[23.7, 90.1], [23.9, 90.4], [24.1, 90.7]],
        [[50.0, 8.5], [50.2, 8.8], [50.4, 9.0]]
    ];

    supplyRoutes.forEach(route => {
        L.polyline(route, {
            color: '#8b5cf6',
            weight: 3,
            opacity: 0.7,
            className: 'supply-route',
            dashArray: '10, 10'
        }).addTo(worldMap).bindPopup('Supply Chain Route');
    });

    showNotification('Supply chains displayed on map', 'info');
}

// Region zoom functions
function zoomToRegion(regionName) {
    const regionBounds = {
        'global': [[60, -180], [-60, 180]],
        'asia': [[50, 60], [10, 150]],
        'europe': [[70, -10], [35, 40]],
        'americas': [[70, -170], [-55, -30]],
        'africa': [[35, -20], [-35, 55]]
    };

    if (regionBounds[regionName]) {
        worldMap.fitBounds(regionBounds[regionName]);
        showNotification(`Zoomed to ${regionName}`, 'info');
    }
}

// Toggle functions
function toggleEmergencyMode() {
    const body = document.body;
    body.classList.toggle('emergency-mode');
    
    if (body.classList.contains('emergency-mode')) {
        showNotification('Emergency mode activated', 'warning');
        // Show emergency overlay
        document.querySelectorAll('.emergency-marker').forEach(marker => {
            marker.style.animation = 'pulse 1s infinite';
        });
    } else {
        showNotification('Emergency mode deactivated', 'info');
    }
}

function togglePredictions() {
    const currentMode = currentTimeframe;
    const newMode = currentMode === 'current' ? '24h' : 'current';
    
    document.getElementById('riskTimeframe').value = newMode;
    currentTimeframe = newMode;
    updateMapData();
    
    showNotification(`Switched to ${newMode === 'current' ? 'current conditions' : 'future predictions'}`, 'info');
}

function toggleEmergencyDetails() {
    const modal = document.getElementById('emergencyModal');
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

// Update map data based on current settings
function updateMapData() {
    // Update overlays based on current timeframe
    riskPolygons.forEach(polygon => {
        const newOpacity = currentTimeframe === 'current' ? 0.3 : 0.5;
        polygon.setStyle({ fillOpacity: newOpacity });
    });

    console.log(`🗺️ Map data updated for ${currentTimeframe}`);
}

// Update map layer
function updateMapLayer() {
    // In a real application, this would switch between different data layers
    console.log(`🔄 Switched to ${currentLayer} layer`);
}

// Show notification
function showNotification(message, type = 'info') {
    try {
        showNotificationSafe(message, type);
    } catch (error) {
        console.error('❌ Notification error:', error);
        // Fallback to alert if notification fails
        alert(`${type.toUpperCase()}: ${message}`);
    }
}

// Safe notification function
function showNotificationSafe(message, type = 'info') {
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
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 4000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
    }
    @keyframes fadeOut {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.9); }
    }
    @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.05); opacity: 0.8; }
    }
    .rescue-marker, .custom-emergency-marker {
        border-radius: 50%;
        border: 2px solid white;
        text-align: center;
        line-height: 1;
    }
`;
document.head.appendChild(style);

// Error handling
window.addEventListener('error', (e) => {
    console.error('❌ Application error:', e.error);
    showNotification('An error occurred. Some features may not work correctly.', 'error');
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
});

console.log('🚀 FloodPlan Global - Script loaded successfully');
