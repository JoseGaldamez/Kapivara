export namespace httpclient {
	
	export class HttpResponse {
	    status: number;
	    status_text: string;
	    headers: Record<string, string>;
	    body: string;
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
	        this.time_ms = source["time_ms"];
	    }
	}

}

