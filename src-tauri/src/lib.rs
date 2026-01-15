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

// TODO: should I move this to other file?
#[tauri::command]
async fn make_http_request(
    method: String,
    url: String,
    headers: Option<HashMap<String, String>>,
    body: Option<String>,
) -> Result<HttpResponse, String> {
    let client = reqwest::Client::new();
    let method = reqwest::Method::from_str(&method.to_uppercase()).map_err(|e| e.to_string())?;

    let start = Instant::now();

    let mut request_builder = client.request(method, &url);

    if let Some(h) = headers {
        for (k, v) in h {
            request_builder = request_builder.header(k, v);
        }
    }

    if let Some(b) = body {
        request_builder = request_builder.body(b);
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
                    ],
                )
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_http::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            close_splashscreen,
            make_http_request
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
