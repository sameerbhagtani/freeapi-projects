import { useEffect, useState } from "react";
import axios from "axios";

import PageShell from "../components/PageShell";

const API_URL = "https://api.freeapi.app/api/v1/public/youtube/videos";

export default function YouTubeVideosListing() {
    const [videos, setVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const controller = new AbortController();

        async function fetchVideos() {
            try {
                setIsLoading(true);
                setError("");

                const res = await axios.get(`${API_URL}?page=${page}`, {
                    signal: controller.signal,
                });

                if (res.data.success && res.data.data) {
                    setVideos(res.data.data.data);
                    setTotalPages(res.data.data.totalPages || 1);
                }
            } catch (err) {
                if (err.name === "CanceledError") return;

                setError(err.message || "Something went wrong");
            } finally {
                setIsLoading(false);
            }
        }

        fetchVideos();

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

    function formatViews(viewCount) {
        const numericValue = Number(viewCount || 0);

        return new Intl.NumberFormat("en-US", {
            notation: "compact",
            maximumFractionDigits: 1,
        }).format(numericValue);
    }

    function formatPublishedDate(dateString) {
        if (!dateString) return "N/A";

        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return "N/A";

        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        }).format(date);
    }

    function formatDuration(duration) {
        if (!duration) return "--:--";

        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return "--:--";

        const hours = Number(match[1] || 0);
        const minutes = Number(match[2] || 0);
        const seconds = Number(match[3] || 0);

        if (hours > 0) {
            return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
        }

        return `${minutes}:${String(seconds).padStart(2, "0")}`;
    }

    return (
        <PageShell title="YouTube Videos Listing">
            {isLoading ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 text-sm text-zinc-400">
                    Loading videos...
                </div>
            ) : error ? (
                <div className="rounded-2xl border border-orange-900/60 bg-orange-950/40 p-6 text-sm text-orange-200">
                    {error}
                </div>
            ) : (
                <>
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {videos.map((entry, index) => {
                            const video = entry.items || entry;
                            const snippet = video.snippet || {};
                            const statistics = video.statistics || {};
                            const contentDetails = video.contentDetails || {};
                            const thumbnail =
                                snippet.thumbnails?.high?.url ||
                                snippet.thumbnails?.medium?.url ||
                                snippet.thumbnails?.default?.url;
                            const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;

                            return (
                                <article
                                    key={video.id || index}
                                    className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 shadow-lg transition duration-200 hover:-translate-y-1 hover:border-orange-500/40 hover:bg-zinc-900"
                                >
                                    <a
                                        href={videoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block"
                                    >
                                        <div className="relative aspect-video overflow-hidden bg-zinc-950">
                                            {thumbnail ? (
                                                <img
                                                    src={thumbnail}
                                                    alt={
                                                        snippet.title ||
                                                        "Video thumbnail"
                                                    }
                                                    className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                                                    No thumbnail
                                                </div>
                                            )}

                                            <span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-xs font-medium text-zinc-100">
                                                {formatDuration(
                                                    contentDetails.duration,
                                                )}
                                            </span>
                                        </div>
                                    </a>

                                    <div className="p-4">
                                        <h2 className="line-clamp-2 text-base font-semibold leading-6 text-zinc-100">
                                            {snippet.title}
                                        </h2>

                                        <p className="mt-2 text-sm text-zinc-400">
                                            {snippet.channelTitle}
                                        </p>

                                        <p className="mt-1 text-xs text-zinc-500">
                                            {formatViews(statistics.viewCount)}{" "}
                                            views
                                            <span className="mx-1">•</span>
                                            {formatPublishedDate(
                                                snippet.publishedAt,
                                            )}
                                        </p>

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {(snippet.tags || [])
                                                .slice(0, 3)
                                                .map((tag) => (
                                                    <span
                                                        key={`${video.id}-${tag}`}
                                                        className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-xs text-orange-200"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                        </div>
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
