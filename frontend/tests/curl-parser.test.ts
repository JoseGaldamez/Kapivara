import test from "node:test";
import assert from "node:assert/strict";
import { parseCurlCommand } from "../src/utils/curl-parser.ts";

test("imports URL parameters, headers, cookies and bearer auth", () => {
    const parsed = parseCurlCommand(`curl --location 'https://api.example.com/requests/18?expand=owner&tag=a&tag=b' \\
        --header 'X-App-Secret: local-secret' \\
        --header 'Cookie: session=local-cookie' \\
        --header 'Authorization: Bearer local-token'`);

    assert.equal(parsed.method, "GET");
    assert.equal(parsed.url, "https://api.example.com/requests/18");
    assert.deepEqual(parsed.params, [
        { key: "expand", value: "owner" },
        { key: "tag", value: "a" },
        { key: "tag", value: "b" },
    ]);
    assert.deepEqual(parsed.auth, { auth_type: "bearer", auth_data: { token: "local-token" } });
    assert.deepEqual(parsed.headers, [
        { key: "X-App-Secret", value: "local-secret" },
        { key: "Cookie", value: "session=local-cookie" },
    ]);
});

test("infers POST and JSON body", () => {
    const parsed = parseCurlCommand(`curl 'https://api.example.com/items' -H 'Content-Type: application/json' --data-raw '{"name":"Ana"}'`);
    assert.equal(parsed.method, "POST");
    assert.equal(parsed.bodyType, "json");
    assert.equal(parsed.body, '{"name":"Ana"}');
});

test("imports GET data as query parameters", () => {
    const parsed = parseCurlCommand(`curl -G 'https://api.example.com/search' --data-urlencode 'q=hello world' --data 'page=2'`);
    assert.equal(parsed.method, "GET");
    assert.deepEqual(parsed.params, [{ key: "page", value: "2" }, { key: "q", value: "hello world" }]);
    assert.equal(parsed.bodyType, "none");
});

test("imports multipart fields and file references", () => {
    const parsed = parseCurlCommand(`curl -F 'name=report' -F 'document=@C:/Temp/report.pdf' https://api.example.com/upload`);
    assert.equal(parsed.method, "POST");
    assert.equal(parsed.bodyType, "form-data");
    assert.deepEqual(JSON.parse(parsed.body), [
        { key: "name", value: "report", type: "text", is_active: 1 },
        { key: "document", value: "C:/Temp/report.pdf", type: "file", is_active: 1 },
    ]);
});

test("accepts a URL copied as a Markdown link", () => {
    const parsed = parseCurlCommand(`curl '[https://api.example.com/items](https://api.example.com/items)'`);
    assert.equal(parsed.url, "https://api.example.com/items");
});
