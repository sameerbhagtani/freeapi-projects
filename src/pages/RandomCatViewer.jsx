import { useEffect, useState } from "react";
import axios from "axios";

import PageShell from "../components/PageShell";

const API_URL = "https://api.freeapi.app/api/v1/public/cats/cat/random";

export default function RandomCatViewer() {
    const [cat, setCat] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshIndex, setRefreshIndex] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        async function fetchCat() {
            try {
                setIsLoading(true);
                setError("");

                const res = await axios.get(API_URL, {
                    signal: controller.signal,
                });

                if (res.data.success && res.data.data) {
                    setCat(res.data.data);
                }
            } catch (err) {
                if (err.name === "CanceledError") return;

                setError(err.message || "Something went wrong");
            } finally {
                setIsLoading(false);
            }
        }

        fetchCat();

        return () => {
            controller.abort();
        };
    }, [refreshIndex]);

    function handleRefetch() {
        setRefreshIndex((prevIndex) => prevIndex + 1);
    }

    function formatScore(value) {
        return value ?? "N/A";
    }

    return (
        <PageShell title="Random Cat Viewer">
            <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center">
                {isLoading ? (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 text-sm text-zinc-400">
                        Loading cat...
                    </div>
                ) : error ? (
                    <div className="rounded-2xl border border-orange-900/60 bg-orange-950/40 p-6 text-sm text-orange-200">
                        {error}
                    </div>
                ) : cat ? (
                    <article className="w-full max-w-4xl overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/85 shadow-2xl shadow-black/30">
                        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
                            <div className="relative min-h-[320px]">
                                <img
                                    src={cat.image}
                                    alt={cat.name}
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6">
                                    <h1 className="text-3xl font-bold text-white sm:text-4xl">
                                        {cat.name}
                                    </h1>
                                    <p className="mt-2 text-sm uppercase tracking-[0.25em] text-orange-300/90">
                                        Origin: {cat.origin}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col p-6 sm:p-8">
                                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-5">
                                    <h2 className="text-lg font-semibold text-white">
                                        About
                                    </h2>
                                    <p className="mt-3 text-sm leading-6 text-zinc-300">
                                        {cat.description}
                                    </p>
                                </div>

                                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                    {[
                                        ["Temperament", cat.temperament],
                                        ["Life Span", cat.life_span],
                                        [
                                            "Adaptability",
                                            formatScore(cat.adaptability),
                                        ],
                                        [
                                            "Affection",
                                            formatScore(cat.affection_level),
                                        ],
                                        [
                                            "Child Friendly",
                                            formatScore(cat.child_friendly),
                                        ],
                                        [
                                            "Dog Friendly",
                                            formatScore(cat.dog_friendly),
                                        ],
                                        [
                                            "Energy",
                                            formatScore(cat.energy_level),
                                        ],
                                    ].map(([label, value]) => (
                                        <div
                                            key={label}
                                            className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4"
                                        >
                                            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                                                {label}
                                            </p>
                                            <p className="mt-2 text-sm font-medium text-zinc-100">
                                                {value}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4">
                                    <p className="text-xs uppercase tracking-[0.2em] text-orange-300/80">
                                        Wikipedia
                                    </p>
                                    <a
                                        href={cat.wikipedia_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-3 inline-flex rounded-full border border-orange-500/50 bg-orange-500/10 px-4 py-2 text-sm font-medium text-orange-200 transition hover:border-orange-500 hover:bg-orange-500/20"
                                    >
                                        Open Wikipedia
                                    </a>
                                </div>

                                <div className="mt-auto pt-6">
                                    <button
                                        type="button"
                                        onClick={handleRefetch}
                                        disabled={isLoading}
                                        className="w-full rounded-full border border-orange-500/50 bg-orange-500/10 px-5 py-3 text-sm font-semibold text-orange-100 transition hover:border-orange-500 hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        Get Another Cat
                                    </button>
                                </div>
                            </div>
                        </div>
                    </article>
                ) : null}
            </div>
        </PageShell>
    );
}
