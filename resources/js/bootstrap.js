import axios from 'axios';
import { APP_URL } from '@/lib/appUrl';

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Request seperti axios.post('/api/face/match') diarahkan ke subfolder aplikasi (mis. /presensi).
if (APP_URL) {
    window.axios.defaults.baseURL = APP_URL;
}
