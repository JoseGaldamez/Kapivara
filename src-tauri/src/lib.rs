use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

use serde::Serialize;
use std::collections::HashMap;
use std::str::FromStr;
use std::time::Instant;

#[derive(Serialize)]
struct HttpResponse {
    status: u16,
    status_text: String,
    headers: HashMap<String, String>,
    body: String,
    time_ms: u128,
}

#[derive(serde::Deserialize)]
struct FormDataItem {
    key: String,
    value: String,
    #[serde(rename = "type")]
    item_type: String, // "text" | "file"
    is_active: u8,
}

// TODO: should I move this to other file?
#[tauri::command]
async fn make_http_request(
    method: String,
    url: String,
    headers: Option<HashMap<String, String>>,
    body: Option<String>,
    body_type: Option<String>,
) -> Result<HttpResponse, String> {
    let client = reqwest::Client::new();
    let method = reqwest::Method::from_str(&method.to_uppercase()).map_err(|e| e.to_string())?;

    let start = Instant::now();

    let mut actual_headers = headers.unwrap_or_default();

    // If body_type is form-data, we MUST strip any user-defined Content-Type
    // because reqwest::multipart generates its own boundary identifier.
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

    let mut request_builder = client.request(method, &url);

    for (k, v) in actual_headers {
        request_builder = request_builder.header(k, v);
    }

    if let Some(b) = body {
        if let Some(t) = body_type {
            if t == "form-data" {
                let items: Vec<FormDataItem> =
                    serde_json::from_str(&b).map_err(|e| e.to_string())?;
                let mut form = reqwest::multipart::Form::new();
                for item in items {
                    // Skip items without a key (trailing empty rows from the UI)
                    if item.key.is_empty() {
                        continue;
                    }
                    if item.is_active == 1 {
                        if item.item_type == "file" {
                            if item.value.is_empty() {
                                continue;
                            }
                            let file_bytes = std::fs::read(&item.value).map_err(|e| {
                                format!("Failed to read file {}: {}", item.value, e)
                            })?;
                            let file_name = std::path::Path::new(&item.value)
                                .file_name()
                                .and_then(|n| n.to_str())
                                .unwrap_or("file")
                                .to_string();
                            // Infer MIME type from the file extension so that
                            // server-side multipart parsers (e.g. multer) can
                            // correctly classify the uploaded file.
                            let mime_type = match std::path::Path::new(&item.value)
                                .extension()
                                .and_then(|e| e.to_str())
                                .map(|e| e.to_lowercase())
                                .as_deref()
                            {
                                Some("jpg") | Some("jpeg") => "image/jpeg",
                                Some("png") => "image/png",
                                Some("gif") => "image/gif",
                                Some("webp") => "image/webp",
                                Some("svg") => "image/svg+xml",
                                Some("pdf") => "application/pdf",
                                Some("mp4") => "video/mp4",
                                Some("mov") => "video/quicktime",
                                Some("mp3") => "audio/mpeg",
                                Some("json") => "application/json",
                                Some("txt") => "text/plain",
                                Some("csv") => "text/csv",
                                Some("zip") => "application/zip",
                                _ => "application/octet-stream",
                            };
                            let part = reqwest::multipart::Part::bytes(file_bytes)
                                .file_name(file_name)
                                .mime_str(mime_type)
                                .map_err(|e| e.to_string())?;
                            form = form.part(item.key, part);
                        } else {
                            form = form.text(item.key, item.value);
                        }
                    }
                }
                request_builder = request_builder.multipart(form);
            } else {
                request_builder = request_builder.body(b);
            }
        } else {
            request_builder = request_builder.body(b);
        }
    }

    let response = request_builder.send().await.map_err(|e| e.to_string())?;

    let time_ms = start.elapsed().as_millis();
    let status = response.status();
    let status_code = status.as_u16();
    let status_text = status.canonical_reason().unwrap_or("").to_string();

    let mut resp_headers = HashMap::new();
    for (k, v) in response.headers() {
        resp_headers.insert(k.to_string(), v.to_str().unwrap_or("").to_string());
    }

    let body_text = response.text().await.map_err(|e| e.to_string())?;

    Ok(HttpResponse {
        status: status_code,
        status_text,
        headers: resp_headers,
        body: body_text,
        time_ms,
    })
}

#[tauri::command]
async fn close_splashscreen(app: tauri::AppHandle) {
    // Show main window
    if let Some(main_window) = app.get_webview_window("main") {
        // We ignore the result of show/set_focus to prevent crashing if it fails
        let _ = main_window.show();
        let _ = main_window.set_focus();
    }
    // Close splashscreen
    if let Some(splashscreen) = app.get_webview_window("splashscreen") {
        let _ = splashscreen.close();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(
                    "sqlite:kapivara.db",
                    vec![
                        tauri_plugin_sql::Migration {
                            version: 1,
                            description: "create_projects_table",
                            sql: include_str!("../migrations/1_init.sql"),
                            kind: tauri_plugin_sql::MigrationKind::Up,
                        },
                        tauri_plugin_sql::Migration {
                            version: 2,
                            description: "create_core_tables",
                            sql: include_str!("../migrations/2_core_tables.sql"),
                            kind: tauri_plugin_sql::MigrationKind::Up,
                        },
                        tauri_plugin_sql::Migration {
                            version: 3,
                            description: "create_settings_table",
                            sql: include_str!("../migrations/3_settings_table.sql"),
                            kind: tauri_plugin_sql::MigrationKind::Up,
                        },
                        tauri_plugin_sql::Migration {
                            version: 4,
                            description: "add_description_to_params",
                            sql: include_str!("../migrations/4_add_description_to_params.sql"),
                            kind: tauri_plugin_sql::MigrationKind::Up,
                        },
                        tauri_plugin_sql::Migration {
                            version: 5,
                            description: "add_response_to_requests",
                            sql: include_str!("../migrations/5_add_response_to_requests.sql"),
                            kind: tauri_plugin_sql::MigrationKind::Up,
                        },
                    ],
                )
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_http::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            close_splashscreen,
            make_http_request
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
