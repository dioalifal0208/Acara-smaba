const fs = require('fs');
const file = 'resources/js/Pages/Events/Index.jsx';
let content = fs.readFileSync(file, 'utf8');

const importString = `import L from 'leaflet';`;
const fixString = `import L from 'leaflet';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow
});`;

if (!content.includes('marker-icon.png')) {
    content = content.replace(importString, fixString);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Leaflet icon fix applied.");
} else {
    console.log("Fix already applied.");
}
