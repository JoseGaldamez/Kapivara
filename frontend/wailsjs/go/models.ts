export namespace httpclient {
	
	export class HttpResponse {
	    status: number;
	    status_text: string;
	    headers: Record<string, string>;
	    body: string;
	    body_encoding: string;
	    content_type: string;
	    response_url: string;
	    size_bytes: number;
	    time_ms: number;
	
	    static createFrom(source: any = {}) {
	        return new HttpResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.status = source["status"];
	        this.status_text = source["status_text"];
	        this.headers = source["headers"];
	        this.body = source["body"];
	        this.body_encoding = source["body_encoding"];
	        this.content_type = source["content_type"];
	        this.response_url = source["response_url"];
	        this.size_bytes = source["size_bytes"];
	        this.time_ms = source["time_ms"];
	    }
	}

}

