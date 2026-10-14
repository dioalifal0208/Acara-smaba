import { appUrl } from '@/lib/appUrl';

export default function ApplicationLogo(props) {
    return (
        <img
            {...props}
            src={appUrl('images/logo.png')}
            alt="Logo E-Presensi SMABA"
        />
    );
}
