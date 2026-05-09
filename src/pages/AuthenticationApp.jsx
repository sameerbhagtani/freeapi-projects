import { useEffect, useState } from "react";
import axios from "axios";

import PageShell from "../components/PageShell";

const API_URL = "https://api.freeapi.app/api/v1/users";
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

const authClient = axios.create({ baseURL: API_URL });

export default function AuthenticationApp() {
    const [activeTab, setActiveTab] = useState("login");
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notice, setNotice] = useState("");
    const [error, setError] = useState("");
    const [loginForm, setLoginForm] = useState({
        username: "",
        password: "",
    });
    const [registerForm, setRegisterForm] = useState({
        username: "",
        email: "",
        password: "",
    });

    function clearAuthState() {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        setUser(null);
    }

    function storeTokens(accessToken, refreshToken) {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
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

    useEffect(() => {
        const client = authClient;

        const requestInterceptor = client.interceptors.request.use((config) => {
            const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

            if (accessToken) {
                config.headers = config.headers ?? {};
                config.headers.Authorization = `Bearer ${accessToken}`;
            }

            return config;
        });

        const responseInterceptor = client.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (error.response?.status !== 401 || originalRequest?._retry) {
                    return Promise.reject(error);
                }

                originalRequest._retry = true;

                const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

                if (!refreshToken) {
                    clearAuthState();
                    setError("Session expired. Please login again.");
                    return Promise.reject(error);
                }

                try {
                    const refreshResponse = await axios.post(
                        `${API_URL}/refresh-token`,
                        { refreshToken },
                    );

                    const refreshedTokens = refreshResponse.data?.data;

                    if (
                        !refreshedTokens?.accessToken ||
                        !refreshedTokens?.refreshToken
                    ) {
                        throw new Error("Unable to refresh session");
                    }

                    storeTokens(
                        refreshedTokens.accessToken,
                        refreshedTokens.refreshToken,
                    );

                    originalRequest.headers = originalRequest.headers ?? {};
                    originalRequest.headers.Authorization = `Bearer ${refreshedTokens.accessToken}`;

                    return client(originalRequest);
                } catch (refreshError) {
                    clearAuthState();
                    setUser(null);
                    setActiveTab("login");
                    setError("Session expired. Please login again.");
                    return Promise.reject(refreshError);
                }
            },
        );

        return () => {
            client.interceptors.request.eject(requestInterceptor);
            client.interceptors.response.eject(responseInterceptor);
        };
    }, []);

    useEffect(() => {
        const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

        if (!accessToken) {
            setIsLoading(false);
            return;
        }

        async function fetchCurrentUser() {
            try {
                setError("");

                const res = await authClient.get("/current-user");
                const currentUser = res.data?.data?.user ?? res.data?.data;

                if (currentUser) {
                    setUser(currentUser);
                }
            } catch {
                clearAuthState();
                setError("Session expired. Please login again.");
            } finally {
                setIsLoading(false);
            }
        }

        fetchCurrentUser();
    }, []);

    async function handleLoginSubmit(event) {
        event.preventDefault();
        setError("");
        setNotice("");

        try {
            const res = await authClient.post(`/login`, loginForm);

            if (res.data.success && res.data.data) {
                const {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                } = res.data.data;

                if (accessToken && refreshToken) {
                    storeTokens(accessToken, refreshToken);
                }

                setUser(loggedInUser ?? null);
            }
        } catch (err) {
            setError(
                err.response?.data?.message || err.message || "Login failed",
            );
        }
    }

    async function handleRegisterSubmit(event) {
        event.preventDefault();
        setError("");
        setNotice("");

        try {
            const res = await authClient.post(`/register`, {
                email: registerForm.email,
                username: registerForm.username,
                password: registerForm.password,
                role: "USER",
            });

            if (res.data.success) {
                setNotice("Registration successful! Please login.");
                setActiveTab("login");
                setLoginForm((prevForm) => ({
                    ...prevForm,
                    username: registerForm.username,
                    password: "",
                }));
                setRegisterForm({
                    username: "",
                    email: "",
                    password: "",
                });
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    err.message ||
                    "Registration failed",
            );
        }
    }

    async function handleLogout() {
        setError("");

        try {
            await authClient.post("/logout");
        } finally {
            clearAuthState();
            setUser(null);
            setActiveTab("login");
            setLoginForm({ username: "", password: "" });
            setRegisterForm({
                username: "",
                email: "",
                password: "",
            });
        }
    }

    if (isLoading) {
        return (
            <PageShell title="Authentication App">
                <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 px-6 py-5 text-sm text-zinc-400">
                        Restoring session...
                    </div>
                </div>
            </PageShell>
        );
    }

    return (
        <PageShell title="Authentication App">
            <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center">
                {user ? (
                    <section className="w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 shadow-lg shadow-black/20">
                        <div className="border-b border-zinc-800 bg-zinc-950/40 px-6 py-5">
                            <p className="text-xs uppercase tracking-[0.3em] text-orange-300/80">
                                Account
                            </p>
                            <h1 className="mt-2 text-3xl font-bold text-white">
                                Logged in successfully
                            </h1>
                        </div>

                        <div className="p-6 sm:p-8">
                            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-orange-500/30 bg-orange-500/10">
                                    <img
                                        src={
                                            user.avatar?.url ||
                                            "https://via.placeholder.com/200x200.png"
                                        }
                                        alt={user.username || "User avatar"}
                                        className="h-full w-full object-cover"
                                    />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h2 className="truncate text-2xl font-semibold text-white">
                                        {user.username}
                                    </h2>
                                    <p className="mt-1 text-sm text-zinc-400">
                                        {user.email}
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                        <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-orange-200">
                                            {user.role}
                                        </span>
                                        <span className="rounded-full border border-zinc-700 bg-zinc-950/60 px-3 py-1 text-zinc-300">
                                            {user.loginType}
                                        </span>
                                        <span className="rounded-full border border-zinc-700 bg-zinc-950/60 px-3 py-1 text-zinc-300">
                                            Verified:{" "}
                                            {user.isEmailVerified
                                                ? "Yes"
                                                : "No"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 grid gap-3 sm:grid-cols-2">
                                {[
                                    ["User ID", user._id],
                                    ["Created", formatDate(user.createdAt)],
                                    ["Updated", formatDate(user.updatedAt)],
                                    ["Email", user.email],
                                ].map(([label, value]) => (
                                    <div
                                        key={label}
                                        className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4"
                                    >
                                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                                            {label}
                                        </p>
                                        <p className="mt-2 break-words text-sm font-medium text-zinc-100">
                                            {value}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="mt-8 w-full rounded-full border border-zinc-700 bg-zinc-950/60 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:border-orange-500/50 hover:text-orange-200"
                            >
                                Logout
                            </button>
                        </div>
                    </section>
                ) : (
                    <section className="w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 shadow-lg shadow-black/20">
                        <div className="p-6 sm:p-8">
                            <div className="flex rounded-2xl border border-zinc-800 bg-zinc-950/60 p-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab("login");
                                        setError("");
                                        setNotice("");
                                    }}
                                    className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                        activeTab === "login"
                                            ? "bg-orange-500/15 text-orange-200"
                                            : "text-zinc-400 hover:text-zinc-200"
                                    }`}
                                >
                                    Login
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab("register");
                                        setError("");
                                        setNotice("");
                                    }}
                                    className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                        activeTab === "register"
                                            ? "bg-orange-500/15 text-orange-200"
                                            : "text-zinc-400 hover:text-zinc-200"
                                    }`}
                                >
                                    Register
                                </button>
                            </div>

                            {(notice || error) && (
                                <div
                                    className={`mt-4 rounded-2xl border p-4 text-sm ${
                                        error
                                            ? "border-orange-900/60 bg-orange-950/40 text-orange-200"
                                            : "border-orange-500/30 bg-orange-500/10 text-orange-100"
                                    }`}
                                >
                                    {error || notice}
                                </div>
                            )}

                            {activeTab === "login" ? (
                                <form
                                    className="mt-6 space-y-4"
                                    onSubmit={handleLoginSubmit}
                                >
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-zinc-300">
                                            Username
                                        </label>
                                        <input
                                            value={loginForm.username}
                                            onChange={(event) =>
                                                setLoginForm((prevForm) => ({
                                                    ...prevForm,
                                                    username:
                                                        event.target.value,
                                                }))
                                            }
                                            type="text"
                                            placeholder="Enter your username"
                                            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-orange-500/50"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-zinc-300">
                                            Password
                                        </label>
                                        <input
                                            value={loginForm.password}
                                            onChange={(event) =>
                                                setLoginForm((prevForm) => ({
                                                    ...prevForm,
                                                    password:
                                                        event.target.value,
                                                }))
                                            }
                                            type="password"
                                            placeholder="Enter your password"
                                            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-orange-500/50"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full rounded-full border border-zinc-700 bg-zinc-950/60 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:border-orange-500/50 hover:text-orange-200"
                                    >
                                        Login
                                    </button>
                                </form>
                            ) : (
                                <form
                                    className="mt-6 space-y-4"
                                    onSubmit={handleRegisterSubmit}
                                >
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-zinc-300">
                                            Username
                                        </label>
                                        <input
                                            value={registerForm.username}
                                            onChange={(event) =>
                                                setRegisterForm((prevForm) => ({
                                                    ...prevForm,
                                                    username:
                                                        event.target.value,
                                                }))
                                            }
                                            type="text"
                                            placeholder="Choose a username"
                                            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-orange-500/50"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-zinc-300">
                                            Email
                                        </label>
                                        <input
                                            value={registerForm.email}
                                            onChange={(event) =>
                                                setRegisterForm((prevForm) => ({
                                                    ...prevForm,
                                                    email: event.target.value,
                                                }))
                                            }
                                            type="email"
                                            placeholder="Enter your email"
                                            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-orange-500/50"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-zinc-300">
                                            Password
                                        </label>
                                        <input
                                            value={registerForm.password}
                                            onChange={(event) =>
                                                setRegisterForm((prevForm) => ({
                                                    ...prevForm,
                                                    password:
                                                        event.target.value,
                                                }))
                                            }
                                            type="password"
                                            placeholder="Create a password"
                                            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-orange-500/50"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full rounded-full border border-zinc-700 bg-zinc-950/60 px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:border-orange-500/50 hover:text-orange-200"
                                    >
                                        Register
                                    </button>
                                </form>
                            )}
                        </div>
                    </section>
                )}
            </div>
        </PageShell>
    );
}
