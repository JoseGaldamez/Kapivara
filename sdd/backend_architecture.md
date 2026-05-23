# Backend Architecture & Native Integration

Kapivara's backend is developed in **Rust** inside the `src-tauri` workspace, running within the **Tauri v2** framework. The backend manages local database migrations, exposes native commands via Tauri's inter-process communication (IPC) channel, and hosts a robust, low-level HTTP client to bypass standard web browser constraints (such as CORS policies or restricted file system access).

---

## 🏗️ Structural Topology

The backend consists of:
* `main.rs`: Entry point that triggers the shared library.
* `lib.rs`: Orchestrating core, commands, splashscreen control, and Tauri plugin configurations.
* `migrations/`: Holds standard raw SQL statements executed by the Tauri SQL driver.

---

## ⚡ Native IPC Tauri Commands

Tauri exposes custom Rust functions to the frontend via the `#[tauri::command]` macro. Kapivara implements three core commands:

### 1. `greet`
* **Signature**: `fn greet(name: &str) -> String`
* **Purpose**: A basic sanity check command to verify backend-frontend IPC transport is operating correctly.

### 2. `close_splashscreen`
* **Signature**: `async fn close_splashscreen(app: tauri::AppHandle)`
* **Purpose**: Manages app initialization UX. When called:
  1. It searches for the window named `"main"` and commands it to `.show()` and `.set_focus()`.
  2. It searches for the window named `"splashscreen"` and commands it to `.close()`.
  3. Uses defensive programming: silently ignores failures to avoid crashing if one of the windows was closed prematurely.

### 3. `make_http_request`
* **Signature**:
  ```rust
  async fn make_http_request(
      method: String,
      url: String,
      headers: Option<HashMap<String, String>>,
      body: Option<String>,
      body_type: Option<String>,
  ) -> Result<HttpResponse, String>
  ```
* **Purpose**: Bypasses browser sandboxes to perform high-performance HTTP requests using the `reqwest` crate.
* **Return Type**:
  ```rust
  struct HttpResponse {
      status: u16,
      status_text: String,
      headers: HashMap<String, String>,
      body: String,
      time_ms: u128,
  }
  ```

---

## 🛠️ The HTTP Request Engine Details

The `make_http_request` command handles several advanced web client capabilities:

### A. Automatic Headers Filtering (Boundary Collision Prevention)
When sending multipart form-data, reqwest must construct its own boundary string (e.g., `boundary=----TauriBoundary123`). If a frontend manually appends a standard `"Content-Type: multipart/form-data"` header, it breaks the connection because the boundaries mismatch. 
* **Rust Resolution**:
  ```rust
  if let Some(ref t) = body_type {
      if t == "form-data" {
          let keys: Vec<String> = actual_headers.keys().cloned().collect();
          for k in keys {
              if k.eq_ignore_ascii_case("content-type") {
                  actual_headers.remove(&k);
              }
          }
      }
  }
  ```

### B. High-Performance Multipart Form-Data Parser with Binary Support
The body string for `form-data` requests is received as a JSON string representing `FormDataItem` structures:
```rust
struct FormDataItem {
    key: String,
    value: String,
    #[serde(rename = "type")]
    item_type: String, // "text" | "file"
    is_active: u8,
}
```
If `item_type == "file"`, the backend reads the binary bytes directly from the user's local operating system using `std::fs::read(&item.value)`. It extracts the file name from the path and dynamically infers the standard **MIME Type** from the extension:

| File Extension | MIME Type |
| :--- | :--- |
| `jpg`, `jpeg` | `image/jpeg` |
| `png` | `image/png` |
| `gif` | `image/gif` |
| `webp` | `image/webp` |
| `svg` | `image/svg+xml` |
| `pdf` | `application/pdf` |
| `mp4` | `video/mp4` |
| `mov` | `video/quicktime` |
| `mp3` | `audio/mpeg` |
| `json` | `application/json` |
| `txt` | `text/plain` |
| `csv` | `text/csv` |
| `zip` | `application/zip` |
| *Others* | `application/octet-stream` |

This is critical because it ensures server-side parsers (like Multer in Node.js, or standard Python/Go multipart handlers) receive the correct content boundaries and MIME descriptors.

---

## 📦 Tauri v2 Plugins Configured

In `lib.rs`, the application builder configures several standard Tauri plugins:

1. **`tauri_plugin_sql`**:
   * Initialized with `"sqlite:kapivara.db"`.
   * Chains database migrations v1 to v7 in sequence via `include_str!` compile-time bindings.
2. **`tauri_plugin_opener`**:
   * Provides access to open system links and external browser processes.
3. **`tauri_plugin_dialog`**:
   * Opens native system dialogs for folder selection and file picking (used when selecting local files for file multipart payloads).
4. **`tauri_plugin_http`**:
   * Tauri's internal HTTP client handler.
