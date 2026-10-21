/** Kartu angka bergaya Material Dashboard: label + nilai, ikon gelap 48px, garis pudar, catatan kaki. */
export default function KpiCard({ label, value, icon, delay = 0, children }) {
    return (
        <div className="card-soft" data-aos="fade-up" data-aos-delay={delay}>
            <div className="flex items-start justify-between gap-3 p-2 pl-4">
                <div className="min-w-0 pt-1">
                    <p className="text-sm text-neutral-500">{label}</p>
                    <h4 className="text-2xl font-bold text-neutral-800 tabular-nums">{value}</h4>
                </div>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-white shadow-dark">
                    <span className="h-5 w-5">{icon}</span>
                </span>
            </div>
            <hr className="hr-fade" />
            <p className="truncate p-2 pl-4 text-sm text-neutral-500">{children}</p>
        </div>
    );
}
