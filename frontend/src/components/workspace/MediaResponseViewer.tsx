import { useEffect, useState } from 'react';

export interface MediaBody {
    body: string;
    body_encoding?: 'text' | 'base64';
    content_type?: string;
}

const mediaType = (contentType?: string) => (contentType ?? '').split(';', 1)[0].trim().toLowerCase();

export const isMediaResponse = (response: MediaBody) => {
    const type = mediaType(response.content_type);
    return response.body_encoding === 'base64' &&
        (type.startsWith('image/') || type.startsWith('video/') || type === 'application/pdf');
};

const extensionFor = (type: string) => {
    if (type === 'application/pdf') return 'pdf';
    if (type === 'image/jpeg') return 'jpg';
    if (type === 'image/svg+xml') return 'svg';
    return type.split('/')[1]?.replace(/[^a-z0-9]/g, '') || 'bin';
};

export const MediaResponseViewer = ({ response }: { response: MediaBody }) => {
    const [url, setUrl] = useState<string | null>(null);
    const [error, setError] = useState(false);
    const [playbackError, setPlaybackError] = useState(false);
    const type = mediaType(response.content_type);

    useEffect(() => {
        setUrl(null);
        setError(false);
        setPlaybackError(false);
        if (!isMediaResponse(response)) return;

        try {
            // Decode in chunks so large responses do not require one giant binary string.
            const chunks: Uint8Array<ArrayBuffer>[] = [];
            for (let offset = 0; offset < response.body.length; offset += 65536) {
                const decoded = atob(response.body.slice(offset, offset + 65536));
                const bytes = new Uint8Array(decoded.length);
                for (let i = 0; i < decoded.length; i++) bytes[i] = decoded.charCodeAt(i);
                chunks.push(bytes);
            }
            const objectUrl = URL.createObjectURL(new Blob(chunks, { type }));
            setUrl(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } catch {
            setError(true);
        }
    }, [response.body, response.body_encoding, type]);

    if (error) return <div className="flex h-full items-center justify-center text-sm text-red-600">Could not decode this media response.</div>;
    if (!url) return <div className="flex h-full items-center justify-center text-sm text-[#8a7e72]">Loading media…</div>;

    return (
        <div className="flex h-full min-h-0 flex-col gap-2">
            <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-[#ded7ce] bg-[#f6f2ec] dark:border-white/8 dark:bg-[#121316]">
                {type.startsWith('image/') ? (
                    <div className="flex min-h-full items-center justify-center p-4">
                        {playbackError ? <span className="text-sm text-[#8a7e72]">This image format cannot be displayed here.</span> :
                            <img src={url} alt="Response image" className="max-h-full max-w-full object-contain" onError={() => setPlaybackError(true)} />}
                    </div>
                ) : type.startsWith('video/') ? (
                    playbackError ? <div className="flex h-full items-center justify-center text-sm text-[#8a7e72]">This video codec cannot be played here.</div> :
                        <video src={url} controls preload="metadata" className="h-full w-full bg-black object-contain" onError={() => setPlaybackError(true)} />
                ) : (
                    <iframe src={url} title="Response PDF" className="h-full w-full border-0 bg-white" />
                )}
            </div>
            <a href={url} download={`response.${extensionFor(type)}`} className="self-end text-xs font-semibold text-[#0066ff] hover:underline">
                Save file
            </a>
        </div>
    );
};
