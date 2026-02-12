'use client';

import React, { useState, useRef } from 'react';
import { VideoMeta } from '@/types/video';
import { useEditorStore } from '@/store/useEditorStore';
import SubtitleCanvas from './editor/SubtitleCanvas';

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const ALLOWED_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];

export default function VideoUpload() {
    const { setLines } = useEditorStore();
    const [currentTime, setCurrentTime] = useState(0);
    const [file, setFile] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [metadata, setMetadata] = useState<Partial<VideoMeta> | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        setError(null);
        setProgress(0);
        setMetadata(null);

        if (!selectedFile) return;

        if (!ALLOWED_TYPES.includes(selectedFile.type)) {
            setError('Only MP4, MOV, and WEBM are allowed.');
            return;
        }

        if (selectedFile.size > MAX_FILE_SIZE) {
            setError('File size must be less than 500MB.');
            return;
        }

        setFile(selectedFile);
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);

        // Metadata extraction
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = url;
        video.onloadedmetadata = () => {
            const meta = {
                filename: selectedFile.name,
                duration: video.duration,
                width: video.videoWidth,
                height: video.videoHeight,
                fps: 30, // Estimating FPS is complex in browser without libraries, defaulting to 30 for now
            };
            setMetadata(meta);
        };
    };

    const handleUpload = () => {
        if (!file || !metadata) return;

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('metadata', JSON.stringify(metadata));

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/upload-video', true);

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded / event.total) * 100);
                setProgress(percentComplete);
            }
        };

        xhr.onload = async () => {
            setIsUploading(false);
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                const { videoId, filename } = response.metadata;

                // Trigger audio extraction
                try {
                    const extractRes = await fetch('/api/extract-audio', {
                        method: 'POST',
                        body: JSON.stringify({ videoId, filename }),
                        headers: { 'Content-Type': 'application/json' },
                    });
                    const extractData = await extractRes.json();

                    if (extractData.success) {
                        // Trigger subtitle generation
                        try {
                            const subRes = await fetch('/api/generate-subtitles', {
                                method: 'POST',
                                body: JSON.stringify({
                                    videoId,
                                    audioPath: extractData.audioPath
                                }),
                                headers: { 'Content-Type': 'application/json' },
                            });
                            const subData = await subRes.json();

                            if (subData.subtitles) {
                                setLines(subData.subtitles);
                                alert(`Upload complete!\n1. Audio Extracted\n2. Subtitles Generated (${subData.subtitles.length} segments)`);
                                console.log('Subtitles:', subData);
                            } else {
                                alert(`Upload and Audio Extracted, but subtitle generation failed: ${subData.error || 'Unknown error'}`);
                            }
                        } catch (subErr) {
                            console.error('Subtitle trigger error:', subErr);
                            alert('Upload and Audio Extracted, but failed to start subtitle generation.');
                        }
                    } else {
                        alert(`Upload successful, but audio extraction failed: ${extractData.error}`);
                    }
                } catch (err) {
                    console.error('Extraction trigger error:', err);
                    alert('Upload successful, but failed to start audio extraction.');
                }
            } else {
                setError('Upload failed. Please try again.');
            }
        };

        xhr.onerror = () => {
            setIsUploading(false);
            setError('Network error during upload.');
        };

        xhr.send(formData);
    };

    return (
        <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Upload Video</h2>

            <div className="space-y-4">
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors cursor-pointer relative">
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".mp4,.mov,.webm"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="text-center">
                        <p className="text-gray-600">Drag & drop or click to select video</p>
                        <p className="text-sm text-gray-400 mt-1">MP4, MOV, WEBM (Max 500MB)</p>
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                {previewUrl && (
                    <div className="mt-4">
                        <p className="text-sm font-semibold mb-2 text-gray-700">Preview & Edit:</p>
                        <div className="relative w-full rounded-lg overflow-hidden bg-black aspect-video" style={{ maxHeight: '400px' }}>
                            <video
                                ref={videoRef}
                                src={previewUrl}
                                controls
                                className="w-full h-full"
                                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                            />
                            {metadata && metadata.width && metadata.height && (
                                <SubtitleCanvas
                                    currentTime={currentTime}
                                    stageWidth={videoRef.current?.clientWidth || 0}
                                    stageHeight={videoRef.current?.clientHeight || 0}
                                    videoWidth={metadata.width}
                                    videoHeight={metadata.height}
                                />
                            )}
                        </div>
                    </div>
                )}

                {metadata && (
                    <div className="bg-gray-50 p-3 rounded-md text-xs text-gray-600 grid grid-cols-2 gap-2">
                        <div>Duration: {metadata.duration?.toFixed(2)}s</div>
                        <div>Resolution: {metadata.width}x{metadata.height}</div>
                        <div>Filename: {metadata.filename}</div>
                        <div>Estimated FPS: {metadata.fps}</div>
                    </div>
                )}

                {isUploading && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                        <p className="text-right text-xs mt-1 text-gray-500">{progress}%</p>
                    </div>
                )}

                <button
                    onClick={handleUpload}
                    disabled={!file || isUploading || !!error}
                    className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${!file || isUploading || !!error
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                >
                    {isUploading ? 'Uploading...' : 'Upload Video'}
                </button>
            </div>
        </div>
    );
}
