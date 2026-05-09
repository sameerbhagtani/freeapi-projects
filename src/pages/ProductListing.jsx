import { useEffect, useState } from "react";
import axios from "axios";

import PageShell from "../components/PageShell";

const API_URL = "https://api.freeapi.app/api/v1/public/randomproducts";

export default function ProductListing() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const controller = new AbortController();

        async function fetchProducts() {
            try {
                setIsLoading(true);
                setError("");

                const res = await axios.get(`${API_URL}?page=${page}`, {
                    signal: controller.signal,
                });

                if (res.data.success && res.data.data) {
                    setProducts(res.data.data.data);
                    setTotalPages(res.data.data.totalPages || 1);
                }
            } catch (err) {
                if (err.name === "CanceledError") return;

                setError(err.message || "Something went wrong");
            } finally {
                setIsLoading(false);
            }
        }

        fetchProducts();

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

    function getDiscountedPrice(price, discountPercentage) {
        const discountAmount = (price * discountPercentage) / 100;
        return Math.max(price - discountAmount, 0);
    }

    return (
        <PageShell title="Product Listing">
            {isLoading ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 text-sm text-zinc-400">
                    Loading products...
                </div>
            ) : error ? (
                <div className="rounded-2xl border border-orange-900/60 bg-orange-950/40 p-6 text-sm text-orange-200">
                    {error}
                </div>
            ) : (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {products.map((product) => {
                            const discountedPrice = getDiscountedPrice(
                                product.price,
                                product.discountPercentage,
                            );

                            return (
                                <article
                                    key={product.id}
                                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 shadow-lg transition duration-200 hover:-translate-y-1 hover:border-orange-500/40 hover:bg-zinc-900"
                                >
                                    <div className="relative overflow-hidden">
                                        <img
                                            src={product.thumbnail}
                                            alt={product.title}
                                            className="h-48 w-full object-cover transition duration-200 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        <span className="absolute left-3 top-3 rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-xs font-medium text-orange-200">
                                            {product.category}
                                        </span>
                                    </div>

                                    <div className="flex flex-1 flex-col p-4">
                                        <div className="mb-3 flex items-center justify-between gap-2">
                                            <span className="truncate text-xs uppercase tracking-[0.18em] text-zinc-500">
                                                {product.brand}
                                            </span>
                                            <span className="rounded-full border border-zinc-700 bg-zinc-950/70 px-2.5 py-1 text-xs text-zinc-300">
                                                ⭐️ {product.rating}
                                            </span>
                                        </div>

                                        <h2 className="line-clamp-1 text-lg font-semibold text-white">
                                            {product.title}
                                        </h2>

                                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-300">
                                            {product.description}
                                        </p>

                                        <div className="mt-4">
                                            <p className="text-xl font-bold text-white">
                                                ${discountedPrice.toFixed(2)}
                                            </p>
                                            <div className="mt-1 flex items-center gap-2 text-xs">
                                                <span className="text-zinc-500 line-through">
                                                    ${product.price.toFixed(2)}
                                                </span>
                                                <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 font-medium text-orange-200">
                                                    -
                                                    {product.discountPercentage.toFixed(
                                                        2,
                                                    )}
                                                    %
                                                </span>
                                            </div>
                                        </div>

                                        <p className="mt-auto pt-4 text-sm text-zinc-400">
                                            In stock: {product.stock}
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
