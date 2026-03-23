# SCCA (Secure Compact Chat Architecture) Setup Guide

## Overview

SCCA is a secure messaging architecture that provides end-to-end encryption for chat communications and vault operations. It supports multiple platforms including Next.js, Nuxt.js, React Native, Flutter, iOS (Swift), and Android (Kotlin).

## Environment Variables

Add the following to your `.env` file:

```env
# SCCA Master Key (generate with: openssl rand -hex 32)
SCCA_MASTER_KEY=your_scca_master_key_here

# API Key for Vault API access (optional - for backend services)
SCCA_API_KEY=your_scca_api_key_here

# Public API URL (client-side)
NUXT_PUBLIC_SCCA_API_URL=/api/scca

# SCCA Server URL (if using external instance)
# SCCA_SERVER_URL=https://your-scca-instance.com
```

## Quick Start

### 1. Setup Environment

```bash
# Generate a master key
openssl rand -hex 32

# Add to .env
SCCA_MASTER_KEY=your_generated_key_here
NUXT_PUBLIC_SCCA_API_URL=/api/scca
```

### 2. Use the Composable (Nuxt.js)

```vue
<template>
  <div>
    <div v-for="msg in messages" :key="msg.id">
      {{ msg.content }}
    </div>
    <input v-model="input" @keydown.enter="send" />
    <button @click="send">Send</button>
  </div>
</template>

<script setup>
const scca = useSCCA()
const messages = ref([])
const input = ref('')

async function send() {
  // Create conversation if needed
  const conv = await scca.createConversation('My Chat')
  
  // Stream AI response
  for await (const event of scca.sendMessageStream(conv.id, input.value)) {
    if (event.token) {
      // Append token to message
      console.log(event.token)
    }
  }
}
</script>
```

## SDK Examples by Platform

### Nuxt.js 3 (This Project)

The project includes a built-in `useSCCA` composable:

```typescript
const scca = useSCCA()

// Vault Operations
const encrypted = await scca.encrypt('sensitive data', 'user-123-pii')
const decrypted = await scca.decrypt(encrypted.tokens, 'user-123-pii')
const verified = await scca.verify(encrypted.tokens, encrypted.merkleRoot, 'user-123-pii')

// Chat Operations
const conv = await scca.createConversation('My Chat')
const conversations = await scca.listConversations()
const messages = await scca.getMessages(conv.id)

// Streaming chat
for await (const event of scca.sendMessageStream(conv.id, 'Hello')) {
  if (event.token) console.log(event.token)
  if (event.done) console.log('Complete')
}
```

### Next.js (App Router)

```typescript
// lib/scca-client.ts
const SCCA_BASE_URL = process.env.NEXT_PUBLIC_SCCA_API_URL || 
  "https://your-scca-instance.com";

export class SCCAClient {
  private baseUrl: string;

  constructor(config?: { baseUrl?: string }) {
    this.baseUrl = config?.baseUrl || SCCA_BASE_URL;
  }

  async encrypt(data: string | string[], context: string) {
    const res = await fetch(`${this.baseUrl}/api/scca/vault/encrypt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ data, context }),
    });
    if (!res.ok) throw new Error(`Encrypt failed: ${res.status}`);
    return res.json();
  }

  async decrypt(tokens: string[], context: string) {
    const res = await fetch(`${this.baseUrl}/api/scca/vault/decrypt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ tokens, context }),
    });
    if (!res.ok) throw new Error(`Decrypt failed: ${res.status}`);
    return res.json();
  }

  async createConversation(title?: string) {
    const res = await fetch(`${this.baseUrl}/api/scca/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ title: title || "New Chat" }),
    });
    if (!res.ok) throw new Error(`Create failed: ${res.status}`);
    return res.json();
  }

  async *sendMessageStream(
    conversationId: string,
    content: string,
    options?: { temperature?: number; max_tokens?: number }
  ): AsyncGenerator<{ token?: string; done?: boolean; error?: string }> {
    const res = await fetch(
      `${this.baseUrl}/api/scca/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          content,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.max_tokens ?? 4096,
        }),
      }
    );

    if (!res.ok) {
      yield { error: `HTTP ${res.status}` };
      return;
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const data = JSON.parse(line.slice(6));
          yield data;
        } catch {
          // Ignore parse errors
        }
      }
    }
  }
}

export const scca = new SCCAClient();
```

### React Native

```typescript
// lib/scca-native.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const SCCA_BASE_URL = 'https://your-scca-instance.com';

export class SCCANativeClient {
  private baseUrl: string;

  constructor(baseUrl: string = SCCA_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async setSessionCookie(cookie: string) {
    await AsyncStorage.setItem('@scca_session', cookie);
  }

  async getSessionCookie(): Promise<string | null> {
    return await AsyncStorage.getItem('@scca_session');
  }

  async clearSession() {
    await AsyncStorage.removeItem('@scca_session');
  }

  async encrypt(data: string | string[], context: string) {
    const res = await fetch(`${this.baseUrl}/api/scca/vault/encrypt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, context }),
    });
    if (!res.ok) throw new Error(`Encrypt failed: ${res.status}`);
    return res.json();
  }

  async decrypt(tokens: string[], context: string) {
    const res = await fetch(`${this.baseUrl}/api/scca/vault/decrypt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokens, context }),
    });
    if (!res.ok) throw new Error(`Decrypt failed: ${res.status}`);
    return res.json();
  }

  async createConversation(title?: string) {
    const res = await fetch(`${this.baseUrl}/api/scca/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title || 'New Chat' }),
    });
    if (!res.ok) throw new Error(`Create failed: ${res.status}`);
    return res.json();
  }

  async *sendMessageStream(
    conversationId: string,
    content: string
  ): AsyncGenerator<{ token?: string; done?: boolean }> {
    const res = await fetch(
      `${this.baseUrl}/api/scca/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, temperature: 0.7 }),
      }
    );

    if (!res.ok) throw new Error(`Send failed: ${res.status}`);

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const data = JSON.parse(line.slice(6));
          yield data;
        } catch {
          // Ignore parse errors
        }
      }
    }
  }
}

export const sccaNative = new SCCANativeClient();
```

### Flutter

```dart
// lib/services/scca_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class SCCAService {
  final String baseUrl;
  late final SharedPreferences _prefs;

  SCCAService({required this.baseUrl});

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  Future<void> setSessionCookie(String cookie) async {
    await _prefs.setString('scca_session', cookie);
  }

  String? getSessionCookie() {
    return _prefs.getString('scca_session');
  }

  Future<Map<String, dynamic>> encrypt(dynamic data, String context) async {
    final res = await http.post(
      Uri.parse('$baseUrl/api/scca/vault/encrypt'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'data': data, 'context': context}),
    );
    if (res.statusCode != 200) throw Exception('Encrypt failed: ${res.statusCode}');
    return jsonDecode(res.body);
  }

  Future<Map<String, dynamic>> decrypt(List<String> tokens, String context) async {
    final res = await http.post(
      Uri.parse('$baseUrl/api/scca/vault/decrypt'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'tokens': tokens, 'context': context}),
    );
    if (res.statusCode != 200) throw Exception('Decrypt failed: ${res.statusCode}');
    return jsonDecode(res.body);
  }

  Future<Map<String, dynamic>> createConversation({String? title}) async {
    final res = await http.post(
      Uri.parse('$baseUrl/api/scca/conversations'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'title': title ?? 'New Chat'}),
    );
    if (res.statusCode != 201) throw Exception('Create failed: ${res.statusCode}');
    return jsonDecode(res.body);
  }

  Stream<Map<String, dynamic>> sendMessageStream(String conversationId, String content) async* {
    final request = http.Request('POST', 
      Uri.parse('$baseUrl/api/scca/conversations/$conversationId/messages'));
    request.headers['Content-Type'] = 'application/json';
    request.body = jsonEncode({'content': content, 'temperature': 0.7});

    final streamedRes = await request.send();
    await for (final chunk in streamedRes.stream.transform(utf8.decoder)) {
      final lines = chunk.split('\n');
      for (final line in lines) {
        if (line.startsWith('data: ')) {
          try {
            final data = jsonDecode(line.substring(6));
            yield data;
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }
  }
}
```

### iOS (Swift)

```swift
// SCCAClient.swift
import Foundation

class SCCAClient {
    let baseURL: URL
    
    init(baseURL: String) {
        self.baseURL = URL(string: baseURL)!
    }
    
    func encrypt(data: [String], context: String) async throws -> [String: Any] {
        let url = baseURL.appendingPathComponent("/api/scca/vault/encrypt")
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body: [String: Any] = ["data": data, "context": context]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        let (data, _) = try await URLSession.shared.data(for: request)
        guard let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            throw SCCAError.invalidResponse
        }
        return json
    }
    
    func decrypt(tokens: [String], context: String) async throws -> [String: Any] {
        let url = baseURL.appendingPathComponent("/api/scca/vault/decrypt")
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body: [String: Any] = ["tokens": tokens, "context": context]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        let (data, _) = try await URLSession.shared.data(for: request)
        guard let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            throw SCCAError.invalidResponse
        }
        return json
    }
    
    func sendMessageStream(
        conversationId: String,
        content: String,
        onToken: @escaping (String) -> Void,
        onComplete: @escaping () -> Void
    ) {
        let url = baseURL.appendingPathComponent("/api/scca/conversations/\(conversationId)/messages")
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body: [String: Any] = ["content": content, "temperature": 0.7]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            guard let data = data else { return }
            
            let text = String(data: data, encoding: .utf8) ?? ""
            let lines = text.components(separatedBy: "\n")
            
            for line in lines {
                if line.hasPrefix("data: ") {
                    let jsonStr = String(line.dropFirst(6))
                    if let jsonData = jsonStr.data(using: .utf8),
                       let json = try? JSONSerialization.jsonObject(with: jsonData) as? [String: Any] {
                        if let token = json["token"] as? String {
                            DispatchQueue.main.async { onToken(token) }
                        }
                        if json["done"] as? Bool == true {
                            DispatchQueue.main.async { onComplete() }
                        }
                    }
                }
            }
        }
        
        task.resume()
    }
}

enum SCCAError: Error {
    case invalidResponse
}
```

### Android (Kotlin)

```kotlin
// SCCAClient.kt
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject

class SCCAClient(private val baseUrl: String) {
    private val client = OkHttpClient()
    private val JSON = "application/json; charset=utf-8".toMediaType()
    
    fun encrypt(data: List<String>, context: String): Result<JSONObject> {
        return try {
            val body = JSONObject().apply {
                put("data", JSONArray(data))
                put("context", context)
            }
            
            val request = Request.Builder()
                .url("$baseUrl/api/scca/vault/encrypt")
                .post(body.toString().toRequestBody(JSON))
                .build()
            
            val response = client.newCall(request).execute()
            
            if (response.isSuccessful) {
                Result.success(JSONObject(response.body?.string() ?: "{}"))
            } else {
                Result.failure(Exception("Encrypt failed: ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    fun decrypt(tokens: List<String>, context: String): Result<JSONObject> {
        return try {
            val body = JSONObject().apply {
                put("tokens", JSONArray(tokens))
                put("context", context)
            }
            
            val request = Request.Builder()
                .url("$baseUrl/api/scca/vault/decrypt")
                .post(body.toString().toRequestBody(JSON))
                .build()
            
            val response = client.newCall(request).execute()
            
            if (response.isSuccessful) {
                Result.success(JSONObject(response.body?.string() ?: "{}"))
            } else {
                Result.failure(Exception("Decrypt failed: ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
```

## API Endpoints

### Vault API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/scca/vault/encrypt` | POST | Encrypt data |
| `/api/scca/vault/decrypt` | POST | Decrypt tokens |
| `/api/scca/vault/verify` | POST | Verify integrity |

### Chat API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/scca/conversations` | GET | List conversations |
| `/api/scca/conversations` | POST | Create conversation |
| `/api/scca/conversations/:id` | DELETE | Delete conversation |
| `/api/scca/conversations/:id/messages` | GET | Get messages |
| `/api/scca/conversations/:id/messages` | POST | Send message |

## Security Features

1. **AES-256-GCM Encryption**: All data encrypted with industry-standard algorithm
2. **HKDF-SHA256 Key Derivation**: Secure key derivation from master key
3. **Merkle Tree Integrity**: Tamper-proof verification of encrypted data
4. **Context Isolation**: Data encrypted under different contexts cannot be cross-decrypted
5. **Session-based Auth**: Secure session management with cookie-based authentication

## Usage Examples

### Encrypt User PII

```typescript
const scca = useSCCA()

async function storeUserPII(userId: string, ssn: string, creditCard: string) {
  const result = await scca.encrypt(
    [`SSN: ${ssn}`, `CC: ${creditCard}`],
    `user-${userId}-pii`
  )
  
  // Store in your database
  await db.users.update({
    where: { id: userId },
    data: {
      encryptedPII: result.tokens,
      piiMerkleRoot: result.merkleRoot
    }
  })
}
```

### Decrypt and Verify

```typescript
async function retrieveUserPII(userId: string) {
  const user = await db.users.findUnique({ where: { id: userId } })
  
  // Verify integrity first
  const check = await scca.verify(
    user.encryptedPII,
    user.piiMerkleRoot,
    `user-${userId}-pii`
  )
  
  if (!check.valid) {
    throw new Error('Data has been tampered with!')
  }
  
  // Decrypt
  const result = await scca.decrypt(
    user.encryptedPII,
    `user-${userId}-pii`
  )
  
  return result.data.map(d => d.content)
}
```

### Streaming Chat

```typescript
async function chatWithAI(conversationId: string, message: string) {
  const scca = useSCCA()
  let response = ''
  
  for await (const event of scca.sendMessageStream(conversationId, message)) {
    if (event.token) {
      response += event.token
      // Update UI with streaming content
      updateMessageUI(response)
    }
    if (event.done) {
      console.log('Response complete')
    }
  }
}
```

## Demo Page

A demo page is available at `/scca-chat` that demonstrates:
- Secure chat with AI
- Vault encryption/decryption
- Context management
- Real-time streaming

## Troubleshooting

### "SCCA Master Key not configured"
- Ensure `SCCA_MASTER_KEY` is set in your `.env` file
- Restart your application after adding the variable

### "Session creation failed"
- Check that the `/api/scca/session` endpoint is accessible
- Verify HTTPS is enabled in production

### "Message decryption failed"
- Ensure the session hasn't expired
- Check that the same context is used for decryption

### "Integrity check failed"
- Data may have been tampered with
- Verify the Merkle root matches the stored value

## Additional Resources

- [Security Best Practices](./docs/security.md)
- [API Reference](./docs/api.md)
- [Mobile App Integration](./docs/mobile.md)
