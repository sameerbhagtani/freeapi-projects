import { Link } from "react-router";
import PageShell from "../components/PageShell";

const pages = [
    { href: "/authentication-app", title: "Authentication App" },
    { href: "/youtube-videos-listing", title: "YouTube Videos Listing" },
    { href: "/product-listing", title: "Product Listing" },
    { href: "/quotes-listing", title: "Quotes Listing" },
    { href: "/jokes-viewer", title: "Jokes Viewer" },
    { href: "/random-cat-viewer", title: "Random Cat Viewer" },
    { href: "/meals-listing", title: "Meals Listing" },
    { href: "/random-users", title: "Random Users" },
];

export default function Home() {
    return (
        <PageShell title="FreeAPI Projects">
            <div className="mx-auto max-w-5xl px-6 py-12">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {pages.map((p) => (
                        <Link
                            key={p.href}
                            to={p.href}
                            className="group block rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 transition hover:scale-[1.01] hover:border-orange-500/50"
                            aria-label={p.title}
                        >
                            <h3 className="text-lg font-semibold text-white">
                                {p.title}
                            </h3>
                            <p className="mt-2 text-sm text-zinc-400">
                                Open the {p.title} page.
                            </p>
                            <div className="mt-4 text-xs text-zinc-500 group-hover:text-orange-200">
                                View →
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </PageShell>
    );
}
