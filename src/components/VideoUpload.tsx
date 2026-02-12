'use client';

import React, { useState, useRef, useEffect } from 'react';
import { VideoMeta } from '@/types/video';
import { useEditorStore } from '@/store/useEditorStore';
import SubtitleCanvas from './editor/SubtitleCanvas';

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const ALLOWED_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];

export default function VideoUpload() {
    const { setLines, setCurrentTime, setDuration, setVideoUrl, currentTime: storeTime } = useEditorStore();
    const [file, setFile] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [metadata, setMetadata] = useState<Partial<VideoMeta> | null>(null);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcriptionStatus, setTranscriptionStatus] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const requestRef = useRef<number>(null);

    const updatePlayhead = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
        requestRef.current = requestAnimationFrame(updatePlayhead);
    };

    const handlePlay = () => {
        requestRef.current = requestAnimationFrame(updatePlayhead);
    };

    const handlePause = () => {
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
        }
    };

    // Sync playhead from store to video element (for seeking via timeline)
    useEffect(() => {
        if (videoRef.current && Math.abs(videoRef.current.currentTime - storeTime) > 0.15) {
            videoRef.current.currentTime = storeTime;
        }
    }, [storeTime]);

    const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        setDuration(e.currentTarget.duration);
    };

    useEffect(() => {
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

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
        setVideoUrl(url);

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
        setTranscriptionStatus('Uploading video...');

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

                // Update store with the server-side accessible URL
                setVideoUrl(`/uploads/videos/${filename}`);

                // Trigger audio extraction
                setIsTranscribing(true);
                setTranscriptionStatus('Extracting audio...');
                try {
                    const extractRes = await fetch('/api/extract-audio', {
                        method: 'POST',
                        body: JSON.stringify({ videoId, filename }),
                        headers: { 'Content-Type': 'application/json' },
                    });
                    const extractData = await extractRes.json();

                    if (extractData.success) {
                        setTranscriptionStatus('Generating subtitles (AI)...');
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
                                setTranscriptionStatus('Success!');
                                setTimeout(() => {
                                    setTranscriptionStatus(null);
                                    setIsTranscribing(false);
                                }, 3000);
                            } else {
                                setError(`Subtitle generation failed: ${subData.error || 'Unknown error'}`);
                                setIsTranscribing(false);
                                setTranscriptionStatus(null);
                            }
                        } catch (subErr) {
                            setError('Failed to start subtitle generation.');
                            setIsTranscribing(false);
                            setTranscriptionStatus(null);
                        }
                    } else {
                        setError(`Audio extraction failed: ${extractData.error}`);
                        setIsTranscribing(false);
                        setTranscriptionStatus(null);
                    }
                } catch (err) {
                    setError('Failed to start audio extraction.');
                    setIsTranscribing(false);
                    setTranscriptionStatus(null);
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
                        <div className="relative w-full rounded-lg overflow-hidden bg-black flex items-center justify-center" style={{ maxHeight: '500px' }}>
                            <video
                                ref={videoRef}
                                src={previewUrl}
                                controls
                                className="max-w-full max-h-[500px]"
                                onPlay={handlePlay}
                                onPause={handlePause}
                                onEnded={handlePause}
                                onLoadedMetadata={handleLoadedMetadata}
                            />
                            {metadata && metadata.width && metadata.height && (
                                <SubtitleCanvas
                                    currentTime={storeTime}
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
                    disabled={!file || isUploading || isTranscribing || !!error}
                    className={`relative w-full py-3 rounded-lg font-semibold text-white transition-colors flex items-center justify-center gap-2 ${!file || isUploading || isTranscribing || !!error
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                >
                    {(isUploading || isTranscribing) && (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    {isUploading ? `Uploading ${progress}%` : isTranscribing ? transcriptionStatus : 'Upload & Generate Subtitles'}
                </button>

                {transcriptionStatus && !isUploading && (
                    <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                        <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                        {transcriptionStatus}
                    </div>
                )}
            </div>
        </div>
    );
}
