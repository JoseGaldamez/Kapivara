use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
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
                    vec![tauri_plugin_sql::Migration {
                        version: 1,
                        description: "create_projects_table",
                        sql: include_str!("../migrations/1_init.sql"),
                        kind: tauri_plugin_sql::MigrationKind::Up,
                    }],
                )
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, close_splashscreen])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
