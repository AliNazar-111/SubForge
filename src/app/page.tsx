import VideoUpload from '@/components/VideoUpload';
import WordStylePanel from '@/components/editor/WordStylePanel';
import Timeline from '@/components/editor/Timeline';

export default function Home() {
    return (
        <main className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30 flex flex-col">
            <div className="flex-1 max-w-6xl mx-auto px-6 py-12 w-full overflow-y-auto pb-48">
                <header className="mb-12 text-center">
                    <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent mb-4">
                        SubForge
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Professional AI-powered subtitle editor. Upload your video and let Whisper handle the rest.
                    </p>
                </header>

                <div className="flex flex-col lg:flex-row gap-8 items-start mb-12">
                    <div className="flex-1 w-full space-y-8">
                        <VideoUpload />
                    </div>

                    <aside className="w-full lg:w-80">
                        <WordStylePanel />
                    </aside>
                </div>
            </div>

            <div className="fixed bottom-0 w-full z-40">
                <Timeline />
            </div>
        </main>
    );
}
