import { useEffect, useState } from "react";
import axios from "axios";

import PageShell from "../components/PageShell";

const API_URL = "https://api.freeapi.app/api/v1/public/quotes";

export default function QuotesListing() {
    const [quotes, setQuotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const controller = new AbortController();

        async function fetchQuotes() {
            try {
                setIsLoading(true);
                setError("");

                const res = await axios.get(`${API_URL}?page=${page}`, {
                    signal: controller.signal,
                });

                if (res.data.success && res.data.data) {
                    setQuotes(res.data.data.data);
                    setTotalPages(res.data.data.totalPages || 1);
                }
            } catch (err) {
                if (err.name === "CanceledError") return;

                setError(err.message || "Something went wrong");
            } finally {
                setIsLoading(false);
            }
        }

        fetchQuotes();

        return () => {
            controller.abort();
        };
    }, [page]);

    function handlePreviousPage() {
        setPage((prevPage) => (prevPage > 1 ? prevPage - 1 : 1));
    }

    function handleNextPage() {
        setPage((prevPage) =>
            prevPage < totalPages ? prevPage + 1 : prevPage,
        );
    }

    return (
        <PageShell title="Quotes Listing">
            {isLoading ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 text-sm text-zinc-400">
                    Loading quotes...
                </div>
            ) : error ? (
                <div className="rounded-2xl border border-orange-900/60 bg-orange-950/40 p-6 text-sm text-orange-200">
                    {error}
                </div>
            ) : (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {quotes.map((quote) => (
                            <article
                                key={quote.id}
                                className="group rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-lg transition duration-200 hover:-translate-y-1 hover:border-orange-500/40 hover:bg-zinc-900"
                            >
                                <div className="flex flex-wrap gap-2">
                                    {quote.tags?.length ? (
                                        quote.tags.map((tag, index) => (
                                            <span
                                                key={`${quote.id}-${tag}-${index}`}
                                                className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-xs text-orange-200"
                                            >
                                                {tag}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="rounded-full border border-zinc-700 bg-zinc-950/60 px-2.5 py-1 text-xs text-zinc-400">
                                            No tags
                                        </span>
                                    )}
                                </div>

                                <p className="mt-4 text-base leading-7 text-zinc-100">
                                    {quote.content}
                                </p>

                                <p className="mt-5 text-sm text-zinc-400">
                                    -- {quote.author}
                                </p>
                            </article>
                        ))}
                    </div>

                    <div className="mt-8 flex items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-3">
                        <button
                            type="button"
                            onClick={handlePreviousPage}
                            disabled={page === 1 || isLoading}
                            className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-orange-500/50 hover:text-orange-200 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Previous
                        </button>

                        <span className="text-sm text-zinc-400">
                            Page {page}
                        </span>

                        <button
                            type="button"
                            onClick={handleNextPage}
                            disabled={isLoading || page >= totalPages}
                            className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-orange-500/50 hover:text-orange-200 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </PageShell>
    );
}
