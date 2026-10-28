import { Link } from '@inertiajs/react';
import { SearchX } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import Button from './Button';
import { Checkbox } from './Form';
import { EmptyState } from './Layout';
import { cx } from './cx';

const hideBelow = { sm: 'hidden sm:table-cell', md: 'hidden md:table-cell', lg: 'hidden lg:table-cell', xl: 'hidden xl:table-cell' };
const align = { left: 'text-left', center: 'text-center', right: 'text-right' };

/**
 * Tabel data dengan tampilan kartu di HP (semua baris, tanpa batas). Kolom:
 * `{ key, header, cell: (row) => node, align, hideBelow: 'sm'|'md'|'lg'|'xl', className }`.
 *
 * - `selection`: `{ selected: id[], onChange: (ids) => void, label: (row) => string }`
 * - `mobileCard`: `(row) => node`; tanpa ini kartu HP menampilkan kolom pertama dan kedua.
 * - `filtered` + `onClearFilters`: bila hasil kosong karena filter, tampilkan "tidak ada yang cocok".
 * - `empty`: EmptyState ketika data memang belum ada.
 * - `toolbar`: judul/pencarian/filter yang menempel di atas saat di-scroll; header tabel menempel
 *   tepat di bawahnya (tinggi toolbar diukur otomatis karena bisa terlipat di layar sempit).
 */
export default function DataTable({ columns, rows, rowKey = (row) => row.id, selection, mobileCard, filtered = false, onClearFilters, empty, toolbar, caption, className }) {
    const toolbarRef = useRef(null);
    const [toolbarHeight, setToolbarHeight] = useState(0);

    useLayoutEffect(() => {
        if (!toolbarRef.current) return undefined;
        const observer = new ResizeObserver(([entry]) => setToolbarHeight(entry.target.offsetHeight));
        observer.observe(toolbarRef.current);
        return () => observer.disconnect();
    }, [Boolean(toolbar)]);

    const stickyToolbar = toolbar && (
        <div ref={toolbarRef} className="sticky top-0 z-30 border-b border-line bg-surface">{toolbar}</div>
    );

    if (rows.length === 0) {
        return (
            <div className={className}>
                {stickyToolbar}
                {filtered ? (
                    <EmptyState
                        icon={SearchX}
                        title="Tidak ada yang cocok"
                        description="Coba kata kunci lain atau hapus filter yang aktif."
                        action={onClearFilters && <Button size="sm" onClick={onClearFilters}>Hapus filter</Button>}
                    />
                ) : (
                    empty ?? <EmptyState title="Belum ada data" />
                )}
            </div>
        );
    }

    const ids = rows.map(rowKey);
    const selectedSet = new Set(selection?.selected ?? []);
    const selectedVisible = ids.filter((id) => selectedSet.has(id)).length;
    const toggle = (id) => selection.onChange(selectedSet.has(id) ? selection.selected.filter((x) => x !== id) : [...selection.selected, id]);
    const toggleAll = () =>
        selection.onChange(
            selectedVisible === ids.length
                ? selection.selected.filter((id) => !ids.includes(id))
                : [...new Set([...selection.selected, ...ids])],
        );

    return (
        <div className={className}>
            {stickyToolbar}

            {/* HP: daftar kartu */}
            <ul className="divide-y divide-line sm:hidden">
                {rows.map((row) => {
                    const id = rowKey(row);
                    return (
                        <li key={id} className={cx('relative flex items-start gap-1 py-2 pl-2 pr-4', selectedSet.has(id) && 'bg-accent-soft/60')}>
                            {selection && <Checkbox checked={selectedSet.has(id)} onChange={() => toggle(id)} label={selection.label(row)} className="relative z-10" />}
                            <div className={cx('min-w-0 flex-1 py-2', !selection && 'pl-2')}>
                                {mobileCard ? mobileCard(row) : (
                                    <>
                                        <div className="text-sm">{columns[0].cell(row)}</div>
                                        {columns[1] && <div className="mt-1 text-sm text-ink-2">{columns[1].cell(row)}</div>}
                                    </>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>

            {/* Layar lebar: tabel */}
            <table className="hidden w-full text-left text-sm sm:table">
                {caption && <caption className="sr-only">{caption}</caption>}
                {/* Header menempel saat halaman di-scroll; garis bawah lewat bayangan agar ikut menempel. */}
                <thead className="sticky z-20 bg-surface [&_th]:shadow-[inset_0_-1px_0_rgb(var(--line))]" style={{ top: toolbarHeight }}>
                    <tr>
                        {selection && (
                            <th scope="col" className="w-12 pl-2">
                                <Checkbox
                                    checked={selectedVisible > 0 && selectedVisible === ids.length}
                                    indeterminate={selectedVisible > 0 && selectedVisible < ids.length}
                                    onChange={toggleAll}
                                    label="Pilih semua baris yang tampil"
                                />
                            </th>
                        )}
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                scope="col"
                                className={cx('whitespace-nowrap px-4 py-3 text-xs font-medium text-ink-2', align[col.align ?? 'left'], col.hideBelow && hideBelow[col.hideBelow])}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => {
                        const id = rowKey(row);
                        return (
                            <tr
                                key={id}
                                className={cx('relative border-b border-line transition-colors last:border-0', selectedSet.has(id) ? 'bg-accent-soft/60' : 'hover:bg-surface-2/60')}
                            >
                                {selection && (
                                    <td className="pl-2">
                                        <Checkbox checked={selectedSet.has(id)} onChange={() => toggle(id)} label={selection.label(row)} className="relative z-10" />
                                    </td>
                                )}
                                {columns.map((col) => (
                                    <td
                                        key={col.key}
                                        className={cx('px-4 py-2.5 text-ink', align[col.align ?? 'left'], col.hideBelow && hideBelow[col.hideBelow], col.className)}
                                    >
                                        {col.cell(row)}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

/**
 * Tautan utama baris: area kliknya meluas ke seluruh baris/kartu (baris harus `relative`),
 * sementara kontrol lain di baris tetap bisa diklik karena berada di atasnya (`relative z-10`).
 */
export function RowLink({ href, className, children }) {
    return (
        <Link href={href} className={cx('font-medium text-ink after:absolute after:inset-0 hover:underline focus-visible:outline-none focus-visible:after:rounded-md focus-visible:after:ring-2 focus-visible:after:ring-accent', className)}>
            {children}
        </Link>
    );
}
