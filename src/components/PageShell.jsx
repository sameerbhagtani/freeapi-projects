export default function PageShell({ title, children }) {
    return (
        <main className="min-h-screen bg-[#0f1115] px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    {title}
                </h1>

                <div className="mt-8">{children}</div>
            </div>
        </main>
    );
}
