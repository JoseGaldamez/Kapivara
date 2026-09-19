import { useMemo } from 'react';
import type { RequestResponse } from '@/types';
import { buildPreviewDocument } from '@/utils/html-preview';

export const SafeHtmlPreview = ({ response, title }: { response: RequestResponse; title: string }) => {
    const html = useMemo(
        () => buildPreviewDocument(response.body, response.response_url),
        [response.body, response.response_url],
    );

    return (
        <iframe
            srcDoc={html}
            sandbox=""
            referrerPolicy="no-referrer"
            title={title}
            className="h-full w-full border-0 bg-white"
        />
    );
};
