import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { cx } from './cx';
import { useTheme } from './theme';

const OPTIONS = [
    { value: 'system', label: 'Ikuti sistem', icon: Monitor },
    { value: 'light', label: 'Terang', icon: Sun },
    { value: 'dark', label: 'Gelap', icon: Moon },
];

/**
 * Tombol tampilan di bilah atas: Ikuti sistem (bawaan) / Terang / Gelap.
 */
export default function ThemeMenu() {
    const [theme, setTheme] = useTheme();
    const current = OPTIONS.find((option) => option.value === theme);
    const Icon = current.icon;

    return (
        <Menu>
            <MenuButton
                aria-label={`Tampilan: ${current.label}`}
                title={`Tampilan: ${current.label}`}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink data-[open]:bg-surface-2 data-[open]:text-ink"
            >
                <Icon className="h-5 w-5" aria-hidden="true" />
            </MenuButton>
            <MenuItems
                anchor={{ to: 'bottom end', gap: 8 }}
                transition
                className="z-[60] w-48 rounded-xl border border-line bg-surface p-1 shadow-xl transition duration-100 ease-out focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
            >
                <p className="px-3 pb-1 pt-2 text-xs font-medium text-ink-2">Tampilan</p>
                {OPTIONS.map(({ value, label, icon: OptionIcon }) => (
                    <MenuItem key={value}>
                        <button
                            type="button"
                            role="menuitemradio"
                            aria-checked={theme === value}
                            onClick={() => setTheme(value)}
                            className={cx('flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-ink data-[focus]:bg-surface-2')}
                        >
                            <OptionIcon className="h-4 w-4 text-ink-2" aria-hidden="true" />
                            <span className="flex-1 text-left">{label}</span>
                            {theme === value && <Check className="h-4 w-4 text-accent" aria-hidden="true" />}
                        </button>
                    </MenuItem>
                ))}
            </MenuItems>
        </Menu>
    );
}
