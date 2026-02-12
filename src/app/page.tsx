import VideoUpload from '@/components/VideoUpload';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            SubForge
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            Professional Video Editing Suite
          </p>
        </div>

        <div className="flex justify-center">
          <VideoUpload />
        </div>
      </div>
    </main>
  );
}
