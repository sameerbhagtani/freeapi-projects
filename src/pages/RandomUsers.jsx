import { useState, useEffect } from "react";
import axios from "axios";

import PageShell from "../components/PageShell";

const API_URL = "https://api.freeapi.app/api/v1/public/randomusers";

export default function RandomUsers() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const controller = new AbortController();

        async function fetchUsers() {
            try {
                setIsLoading(true);
                setError("");

                const res = await axios.get(`${API_URL}?page=${page}`, {
                    signal: controller.signal,
                });

                if (res.data.success && res.data.data) {
                    setUsers(res.data.data.data);
                    setTotalPages(res.data.data.totalPages || 1);
                }
            } catch (err) {
                if (err.name === "CanceledError") return;

                setError(err.message || "Something went wrong");
            } finally {
                setIsLoading(false);
            }
        }

        fetchUsers();

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

    function formatDate(dateString) {
        if (!dateString) return "N/A";

        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) return "N/A";

        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        }).format(date);
    }

    return (
        <PageShell title="Random Users">
            {isLoading ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 text-sm text-zinc-400">
                    Loading users...
                </div>
            ) : error ? (
                <div className="rounded-2xl border border-orange-900/60 bg-orange-950/40 p-6 text-sm text-orange-200">
                    {error}
                </div>
            ) : (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {users.map((user) => {
                            const fullName =
                                `${user.name.title} ${user.name.first} ${user.name.last}`.trim();
                            const location = [
                                user.location.city,
                                user.location.state,
                                user.location.country,
                            ]
                                .filter(Boolean)
                                .join(", ");

                            return (
                                <article
                                    key={user.id}
                                    className="group rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-lg transition duration-200 hover:-translate-y-1 hover:border-orange-500/40 hover:bg-zinc-900"
                                >
                                    <div className="flex items-start gap-4">
                                        <img
                                            src={user.picture.large}
                                            alt={fullName}
                                            className="h-20 w-20 rounded-2xl border border-zinc-700 object-cover ring-1 ring-black/20"
                                            loading="lazy"
                                        />

                                        <div className="min-w-0 flex-1">
                                            <h2 className="truncate text-lg font-semibold text-white">
                                                {fullName}
                                            </h2>

                                            <p className="mt-1 text-sm text-zinc-400">
                                                {location}
                                            </p>

                                            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                                <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-orange-200">
                                                    {user.gender}
                                                </span>
                                                <span className="rounded-full border border-zinc-700 bg-zinc-950/60 px-2.5 py-1 text-zinc-300">
                                                    DOB:{" "}
                                                    {formatDate(user.dob.date)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 space-y-2 border-t border-zinc-800 pt-4 text-sm text-zinc-300">
                                        <p className="break-words">
                                            <span className="text-zinc-500">
                                                Email:{" "}
                                            </span>
                                            {user.email}
                                        </p>

                                        <p className="break-words">
                                            <span className="text-zinc-500">
                                                Phone:{" "}
                                            </span>
                                            {user.phone}
                                        </p>

                                        <p className="break-words">
                                            <span className="text-zinc-500">
                                                Cell:{" "}
                                            </span>
                                            {user.cell}
                                        </p>
                                    </div>
                                </article>
                            );
                        })}
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
