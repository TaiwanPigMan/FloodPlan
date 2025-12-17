# FloodWatch WA - Flood Risk Visualization Dashboard

A comprehensive flood risk monitoring and early warning system for Washington State, integrating real-time data from multiple agencies to provide community safety intelligence.

![FloodWatch WA Dashboard](https://img.shields.io/badge/Status-Active-green) ![Data Sources](https://img.shields.io/badge/Data%20Sources-NOAA%20|%20USGS%20|%20King%20County-blue)

## 🌊 Overview

FloodWatch WA provides real-time flood risk assessment and early warning capabilities for Washington State counties, with particular focus on King County's flood warning systems. The dashboard integrates multiple data sources to deliver comprehensive flood intelligence to communities across Western Washington.

## 🏛️ Data Sources

### Primary APIs
- **NOAA National Weather Service** - Real-time weather and precipitation data
- **USGS Water Services** - Streamflow and river gauge monitoring
- **Open-Meteo Weather API** - 7-day weather forecasts and historical data
- **King County Flood Warning System** - Local flood monitoring and alerts

### Real USGS Stream Gauges
- **King County**: Green River at Auburn (12113000), Cedar River at Renton (12119000)
- **Pierce County**: Puyallup River at Puyallup (12093500), White River near Auburn (12089500)
- **Snohomish County**: Snohomish River near Monroe (12134500), Stillaguamish River (12150800)
- **Skagit County**: Skagit River near Concrete (12200500), Sauk River near Sauk (12175500)
- **Whatcom County**: Nooksack River at Ferndale (12213100)

## 🎯 Key Features

### Real-time Monitoring
- **Flood Risk Assessment** - Multi-factor risk calculation (0-100% scale)
- **Rainfall Tracking** - Hourly precipitation monitoring with 24-hour trends
- **River Level Monitoring** - Real-time streamflow and gauge height data
- **Soil Saturation Analysis** - Ground water capacity and infiltration rates
- **Interactive County Selection** - Focus on any of 8 Washington counties

### Advanced Visualizations
- **Interactive Maps** - Washington State flood risk visualization with Leaflet.js
- **Real-time Charts** - 24-hour rainfall and river level trend analysis
- **7-Day Forecasting** - Precipitation vs flood risk correlation modeling
- **Historical Analysis** - 10-year flood event tracking and climate trends

### Early Warning System
- **Active Alert Monitoring** - Integration with National Weather Service alerts
- **Emergency Information** - Evacuation routes and shelter locations
- **Multi-Agency Integration** - NOAA, USGS, King County, WA Emergency Management
- **Risk-Based Notifications** - Color-coded risk levels with actionable guidance

## 🗂️ Dashboard Sections

### 1. 🌊 Flood Dashboard (Main)
- Real-time flood risk metrics for selected county
- 24-hour rainfall and river level trending
- Interactive Washington State flood risk map
- Flood safety tips and preparedness guidance

### 2. 📈 Risk Forecast
- 7-day flood risk probability forecast
- Precipitation correlation analysis
- Watershed health indicators (snowpack, atmospheric rivers)
- Predictive modeling based on weather patterns

### 3. 📊 Historical Trends
- Annual flood event tracking (2015-2024)
- Seasonal precipitation pattern analysis
- Climate change impact indicators
- Notable flood event timeline for Washington State

### 4. 🚨 Alerts & Warnings
- Active flood alerts from multiple agencies
- Emergency alert system status monitoring
- Evacuation route and shelter information
- Real-time emergency management integration

## 🚀 Technology Stack

### Frontend
- **HTML5** - Semantic structure and accessibility
- **CSS3** - Responsive design with gradient styling
- **JavaScript (ES6+)** - Modern async/await API integration
- **Chart.js** - Dynamic data visualization and trending
- **Leaflet.js** - Interactive mapping with custom markers

### APIs & Data Integration
- **Open-Meteo API** - Weather forecasting (no API key required)
- **USGS Water Services** - Real-time streamflow data (public API)
- **Real-time Data Processing** - Async data fetching with fallback mechanisms
- **Cross-Origin Resource Sharing (CORS)** - Secure API integration

### Design Philosophy
- **Mobile-First Responsive Design** - Optimized for all device sizes
- **Accessibility Compliance** - WCAG guidelines for emergency information
- **Performance Optimization** - Lazy loading and efficient data caching
- **User Experience Focus** - Intuitive navigation and clear risk communication

## 📦 Installation & Setup

### Local Development
```bash
# Clone or download the project
cd flood-risk-dashboard

# Start local development server
python -m http.server 8080

# Open in browser
open http://localhost:8080
```

### File Structure
```
flood-risk-dashboard/
├── index.html          # Main dashboard page
├── styles.css          # Complete styling and responsive design
├── script.js           # Data integration and interactivity
└── README.md           # Project documentation
```

## 🔗 API Integration

### Weather Data (Open-Meteo)
```javascript
const weatherAPI = `https://api.open-meteo.com/v1/forecast?
    latitude=${lat}&longitude=${lon}&
    current=temperature_2m,precipitation&
    hourly=precipitation&
    daily=precipitation_sum&
    temperature_unit=fahrenheit&
    precipitation_unit=inch&
    timezone=America/Los_Angeles&
    forecast_days=7`;
```

### Streamflow Data (USGS)
```javascript
const streamflowAPI = `https://waterservices.usgs.gov/nwis/iv?
    format=json&
    sites=${gaugeId}&
    parameterCd=00060&
    period=P1D&
    siteStatus=all`;
```

## 🎨 Design Features

### Color-Coded Risk Levels
- **🟢 Low Risk (0-25%)** - Green (#27ae60)
- **🟡 Moderate Risk (25-50%)** - Yellow (#f39c12)
- **🟠 High Risk (50-75%)** - Orange (#e67e22)
- **🔴 Extreme Risk (75-100%)** - Red (#e74c3c)

### Interactive Elements
- **County Selection Dropdown** - 8 Washington counties
- **Tabbed Navigation** - Dashboard, Forecast, Historical, Alerts
- **Map Interaction** - Click counties for detailed information
- **Animated Counters** - Smooth metric updates
- **Responsive Charts** - Touch-friendly data exploration

## 🎯 Use Cases

### Emergency Management
- **First Responders** - Real-time flood risk assessment for resource allocation
- **Emergency Coordinators** - Multi-county monitoring and alert coordination
- **Public Safety** - Early warning system for community protection

### Community Preparedness
- **Residents** - Personal flood risk awareness and preparedness planning
- **Schools & Businesses** - Institutional flood safety planning
- **Property Owners** - Flood insurance and mitigation decision support

### Research & Planning
- **Climate Scientists** - Long-term flood pattern analysis
- **Urban Planners** - Flood-resilient development planning
- **Insurance Industry** - Risk assessment and policy development

## 📊 Data Sources & Accuracy

### Real-time Data Refresh
- **Streamflow Data**: Updated every 15 minutes from USGS gauges
- **Weather Data**: Updated hourly from NOAA/Open-Meteo
- **Flood Alerts**: Real-time from National Weather Service
- **Dashboard Updates**: Automatic refresh every 10 minutes

### Fallback Mechanisms
- **API Failure Handling** - Realistic sample data generation
- **Network Resilience** - Cached data and offline indicators
- **Error Recovery** - Graceful degradation with user notifications

## 🛡️ Safety & Disclaimers

### Emergency Use Guidelines
⚠️ **IMPORTANT**: This dashboard is for informational purposes only. During actual flood emergencies:

1. **Always follow official emergency guidance** from local authorities
2. **Call 911 for immediate emergency assistance**
3. **Monitor official channels** - National Weather Service, King County Emergency Management
4. **Never drive through flooded roads** - "Turn Around, Don't Drown"

### Data Limitations
- **Predictive Models**: Based on current conditions and forecasts, not guarantees
- **Local Variations**: Microclimates and local conditions may vary from county-wide data
- **Real-time Delays**: Some data sources may have 15-60 minute delays

## 🤝 Contributing & Future Development

### Enhancement Opportunities
- **Additional Counties** - Expand to all 39 Washington counties
- **Mobile App Development** - Native iOS/Android applications
- **Advanced Modeling** - Machine learning flood prediction algorithms
- **Community Integration** - Citizen reporting and crowd-sourced data

### Technical Improvements
- **WebSocket Integration** - Real-time data streaming
- **Progressive Web App** - Offline functionality and push notifications
- **GIS Enhancement** - Detailed watershed and topographic overlays
- **API Rate Limiting** - Optimized data fetching and caching

## 📞 Emergency Contacts

### King County Emergency Management
- **Emergency**: 911
- **Non-Emergency**: (206) 296-3830
- **Website**: https://kingcounty.gov/emergency

### National Weather Service
- **Seattle Office**: (206) 526-6087
- **Spokane Office**: (509) 244-0110
- **Website**: https://www.weather.gov/sew/

## 📄 License & Attribution

### Open Source Components
- **Leaflet.js** - BSD 2-Clause License
- **Chart.js** - MIT License
- **Inter Font** - SIL Open Font License

### Data Attribution
- **NOAA/National Weather Service** - Public Domain
- **USGS Water Data** - Public Domain
- **King County Data** - King County Open Data License
- **OpenStreetMap** - © OpenStreetMap contributors

---

**Built with 🌊 for Washington State community safety and flood resilience.**

*For technical support or questions about this dashboard, please refer to the official emergency management channels listed above.*
