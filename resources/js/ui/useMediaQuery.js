import { useEffect, useState } from 'react';

/** `true` selama media query cocok, misal `useMediaQuery('(min-width: 1024px)')`. */
export default function useMediaQuery(query) {
    const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

    useEffect(() => {
        const list = window.matchMedia(query);
        const update = () => setMatches(list.matches);
        update();
        list.addEventListener('change', update);
        return () => list.removeEventListener('change', update);
    }, [query]);

    return matches;
}
