import { useState, useEffect } from "react";
import axios from "axios";

import PageShell from "../components/PageShell";

const API_URL = "https://api.freeapi.app/api/v1/public/meals";

export default function MealsListing() {
    const [meals, setMeals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedMeal, setSelectedMeal] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        async function fetchMeals() {
            try {
                setIsLoading(true);
                setError("");

                const res = await axios.get(`${API_URL}?page=${page}`, {
                    signal: controller.signal,
                });

                if (res.data.success && res.data.data) {
                    setMeals(res.data.data.data);
                    setTotalPages(res.data.data.totalPages || 1);
                }
            } catch (err) {
                if (err.name === "CanceledError") return;

                setError(err.message || "Something went wrong");
            } finally {
                setIsLoading(false);
            }
        }

        fetchMeals();

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

    function getIngredients(meal) {
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            if (ingredient && ingredient.trim()) {
                ingredients.push({
                    name: ingredient,
                    measure: measure || "",
                });
            }
        }
        return ingredients;
    }

    function getTags(meal) {
        if (!meal.strTags) return [];
        return meal.strTags.split(",").map((tag) => tag.trim());
    }

    return (
        <PageShell title="Meals Listing">
            {isLoading ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 text-sm text-zinc-400">
                    Loading meals...
                </div>
            ) : error ? (
                <div className="rounded-2xl border border-orange-900/60 bg-orange-950/40 p-6 text-sm text-orange-200">
                    {error}
                </div>
            ) : (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {meals.map((meal) => (
                            <button
                                key={meal.idMeal}
                                onClick={() => setSelectedMeal(meal)}
                                className="group rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-lg transition duration-200 hover:-translate-y-1 hover:border-orange-500/40 hover:bg-zinc-900 text-left"
                            >
                                <div className="overflow-hidden rounded-xl">
                                    <img
                                        src={meal.strMealThumb}
                                        alt={meal.strMeal}
                                        className="h-48 w-full object-cover transition duration-200 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                </div>

                                <h2 className="mt-4 line-clamp-2 text-lg font-semibold text-white">
                                    {meal.strMeal}
                                </h2>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-xs text-orange-200">
                                        {meal.strCategory}
                                    </span>
                                    <span className="rounded-full border border-zinc-700 bg-zinc-950/60 px-2.5 py-1 text-xs text-zinc-300">
                                        {meal.strArea}
                                    </span>
                                </div>

                                <div className="mt-3 flex flex-wrap gap-1">
                                    {getTags(meal).map((tag, idx) => (
                                        <span
                                            key={idx}
                                            className="text-xs text-orange-400/70"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </button>
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

            {selectedMeal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                    onClick={() => setSelectedMeal(null)}
                >
                    <div
                        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedMeal(null)}
                            className="absolute right-4 top-4 rounded-full border border-orange-500/50 bg-orange-500/10 p-2 text-orange-400 transition hover:border-orange-500 hover:bg-orange-500/20 hover:text-orange-300"
                        >
                            X
                        </button>

                        <img
                            src={selectedMeal.strMealThumb}
                            alt={selectedMeal.strMeal}
                            className="h-80 w-full rounded-xl object-cover"
                        />

                        <h1 className="mt-6 text-3xl font-bold text-white">
                            {selectedMeal.strMeal}
                        </h1>

                        <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-sm text-orange-200">
                                {selectedMeal.strCategory}
                            </span>
                            <span className="rounded-full border border-zinc-700 bg-zinc-950/60 px-3 py-1 text-sm text-zinc-300">
                                {selectedMeal.strArea}
                            </span>
                        </div>

                        <div className="mt-6 border-t border-zinc-800 pt-6">
                            <h2 className="text-lg font-semibold text-white">
                                Instructions
                            </h2>
                            <p className="mt-3 leading-relaxed text-zinc-300">
                                {selectedMeal.strInstructions}
                            </p>
                        </div>

                        <div className="mt-6 border-t border-zinc-800 pt-6">
                            <h2 className="text-lg font-semibold text-white">
                                Ingredients
                            </h2>
                            <div className="mt-4 space-y-2">
                                {getIngredients(selectedMeal).map(
                                    (ingredient, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-start gap-3 rounded-lg bg-zinc-950/60 p-3"
                                        >
                                            <span className="text-sm text-orange-400">
                                                •
                                            </span>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-white">
                                                    {ingredient.name}
                                                </p>
                                                <p className="text-xs text-zinc-400">
                                                    {ingredient.measure}
                                                </p>
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>

                        {selectedMeal.strYoutube && (
                            <div className="mt-6 border-t border-zinc-800 pt-6">
                                <a
                                    href={selectedMeal.strYoutube}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-full border border-orange-500/50 bg-orange-500/10 px-6 py-2 text-sm font-medium text-orange-200 transition hover:border-orange-500 hover:bg-orange-500/20"
                                >
                                    🎥 Watch on YouTube
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </PageShell>
    );
}
