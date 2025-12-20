# --- 設定帳號密碼 ---
$email = "test1@example.com"
$password = "123456"

# --- 後端 API URL ---
$baseUrl = "http://localhost:3000"

Write-Host "=== Supabase Demo API 測試 ===`n"

try {
    # --- Step 1: 呼叫 /login 取得 token ---
    Write-Host "Step 1: 登入..."
    $loginResponse = Invoke-RestMethod `
        -Uri "$baseUrl/login" `
        -Method POST `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body (@{ email = $email; password = $password } | ConvertTo-Json)

    $token = $loginResponse.access_token

    if (-not $token) {
        Write-Host "登入失敗！未取得 token" -ForegroundColor Red
        exit
    }

    Write-Host "登入成功！Token 前 20 字: $($token.Substring(0,20))..." -ForegroundColor Green

    # --- Step 2: 呼叫 /me 驗證 token ---
    Write-Host "`nStep 2: 驗證 /me..."
    $meResponse = Invoke-RestMethod `
        -Uri "$baseUrl/me" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $token" }

    Write-Host "驗證成功！使用者資料：" -ForegroundColor Green
    $meResponse | Format-List

} catch {
    Write-Host "`n發生錯誤：" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
