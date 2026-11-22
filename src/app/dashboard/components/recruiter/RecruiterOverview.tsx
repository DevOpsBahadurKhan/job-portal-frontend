
const stats = [
    { label: "Total Users", value: 1250 },
    { label: "Total Jobs", value: 340 },
    { label: "Companies", value: 85 },
    { label: "Open Jobs", value: 210 },
];

export default function RecruiterOverview() {
    return (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                    <p className="text-sm text-slate-500">{stat.label}</p>
                    <h2 className="mt-4 text-3xl font-bold text-slate-900">
                        {stat.value.toLocaleString()}
                    </h2>
                </div>
            ))}
        </div>
    );
}
