const fs = require('fs');
const file = 'resources/js/Pages/SelfCheckIn/Form.jsx';
if (fs.existsSync(file)) {
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

    if (content.includes(importString) && !content.includes('marker-icon.png')) {
        content = content.replace(importString, fixString);
        fs.writeFileSync(file, content, 'utf8');
        console.log("Leaflet icon fix applied to Form.jsx.");
    } else {
        console.log("Fix already applied or import not found.");
    }
} else {
    console.log("Form.jsx not found.");
}
