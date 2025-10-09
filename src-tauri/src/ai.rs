use futures_util::StreamExt;
use serde::{Deserialize, Serialize};
use tauri::Emitter;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatRequest {
    pub model: String,
    pub messages: Vec<ChatMessage>,
    pub stream: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatResponseChunk {
    pub choices: Vec<StreamChoice>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StreamChoice {
    pub delta: DeltaMessage,
    pub index: u32,
    pub finish_reason: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DeltaMessage {
    pub content: Option<String>,
    pub role: Option<String>,
}

#[tauri::command]
pub async fn call_deepseek_api_stream(
    messages: Vec<ChatMessage>,
    window: tauri::Window,
) -> Result<(), String> {
    dotenv::dotenv().ok();
    let api_key = std::env::var("DEEPSEEK_API_KEY").map_err(|_| "API密钥未设置".to_string())?;
    let client = reqwest::Client::new();

    let request_body = ChatRequest {
        model: "deepseek-chat".to_string(),
        messages,
        stream: true,
    };

    let response = client
        .post("https://api.deepseek.com/chat/completions")
        .header("Content-Type", "application/json")
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&request_body)
        .send()
        .await
        .map_err(|e| format!("请求失败: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let error_text = response.text().await.unwrap_or_default();
        return Err(format!("API 错误 {}: {}", status, error_text));
    }

    let mut stream = response.bytes_stream();
    let mut buffer = String::new();

    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| format!("读取流数据失败: {}", e))?;
        let chunk_str = String::from_utf8_lossy(&chunk);
        buffer.push_str(&chunk_str);

        while let Some(line_end) = buffer.find('\n') {
            let line = buffer[..line_end].trim().to_string();
            buffer = buffer[line_end + 1..].to_string();

            if line.starts_with("data: ") {
                let data = &line[6..];

                if data == "[DONE]" {
                    if !buffer.trim().is_empty() {
                        window
                            .emit("ai_stream_chunk", &buffer)
                            .map_err(|e| e.to_string())?;
                    }
                    window
                        .emit("ai_stream_end", "")
                        .map_err(|e| e.to_string())?;
                    return Ok(());
                }

                if !data.trim().is_empty() {
                    match serde_json::from_str::<ChatResponseChunk>(data) {
                        Ok(chunk_data) => {
                            if let Some(choice) = chunk_data.choices.first() {
                                if let Some(content) = &choice.delta.content {
                                    window
                                        .emit("ai_stream_chunk", content)
                                        .map_err(|e| e.to_string())?;
                                }
                            }
                        }
                        Err(e) => {
                            eprintln!("解析错误: {} - 数据: {}", e, data);
                            continue;
                        }
                    }
                }
            }
        }
    }

    window
        .emit("ai_stream_end", "")
        .map_err(|e| e.to_string())?;
    Ok(())
}
