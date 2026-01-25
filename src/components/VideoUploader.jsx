import { useEffect, useState } from 'react';
import { IoVideocam, IoTrashOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/mpeg', 'video/webm'];
const DEFAULT_MAX_VIDEOS = 3;
const DEFAULT_MAX_SIZE_MB = 80;

const formatFileSize = (bytes = 0) => {
    if (!bytes) return '0 Bytes';
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round((bytes / Math.pow(1024, i)) * 100) / 100} ${sizes[i]}`;
};

function VideoUploader({ selectedVideos = [], onChange, maxVideos = DEFAULT_MAX_VIDEOS, maxSizeMB = DEFAULT_MAX_SIZE_MB }) {
    const [previews, setPreviews] = useState([]);

    useEffect(() => {
        const nextPreviews = selectedVideos.map((file) => ({
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file)
        }));

        setPreviews(nextPreviews);

        return () => {
            nextPreviews.forEach((preview) => {
                if (preview.url) {
                    URL.revokeObjectURL(preview.url);
                }
            });
        };
    }, [selectedVideos]);

    const handleSelect = (event) => {
        const files = Array.from(event.target.files || []);
        event.target.value = '';
        if (!files.length) return;

        const availableSlots = maxVideos - selectedVideos.length;
        if (availableSlots <= 0) {
            toast.error(`You can only attach up to ${maxVideos} videos`);
            return;
        }

        const trimmed = files.slice(0, availableSlots);

        const invalidType = trimmed.find((file) => !ALLOWED_VIDEO_TYPES.includes(file.type));
        if (invalidType) {
            toast.error('Only MP4, MOV, AVI, MPEG or WebM files are allowed');
            return;
        }

        const oversized = trimmed.find((file) => file.size > maxSizeMB * 1024 * 1024);
        if (oversized) {
            toast.error(`Each video must be smaller than ${maxSizeMB}MB`);
            return;
        }

        onChange([...selectedVideos, ...trimmed]);
    };

    const removeVideo = (index) => {
        const updated = selectedVideos.filter((_, idx) => idx !== index);
        onChange(updated);
    };

    return (
        <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center">
                <IoVideocam className="mx-auto text-5xl text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 mb-3">
                    Upload walkthrough videos (MP4, MOV, AVI, MPEG or WebM)
                </p>
                <label className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-semibold text-white bg-[var(--gold-accent)] hover:bg-[var(--charcoal)] cursor-pointer transition-colors">
                    <input
                        type="file"
                        accept="video/mp4,video/quicktime,video/x-msvideo,video/mpeg,video/webm"
                        multiple
                        className="hidden"
                        onChange={handleSelect}
                        disabled={selectedVideos.length >= maxVideos}
                    />
                    Select videos
                </label>
                <p className="text-xs text-gray-500 mt-2">
                    Up to {maxVideos} videos • Max {maxSizeMB}MB per file
                </p>
            </div>

            {previews.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {previews.map((preview, index) => (
                        <div key={`${preview.name}-${index}`} className="border border-gray-200 rounded-2xl p-4 shadow-sm bg-gray-50">
                            <div className="aspect-video bg-black rounded-xl overflow-hidden mb-3">
                                <video
                                    controls
                                    src={preview.url}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 truncate" title={preview.name}>
                                        {preview.name}
                                    </p>
                                    <p className="text-xs text-gray-500">{formatFileSize(preview.size)}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeVideo(index)}
                                    className="text-red-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50"
                                    aria-label="Remove video"
                                >
                                    <IoTrashOutline size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default VideoUploader;
