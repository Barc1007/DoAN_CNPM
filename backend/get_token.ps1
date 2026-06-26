$resp = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method Post -ContentType 'application/json' -Body (ConvertTo-Json @{username='testuser'; password='password123'})
Set-Content -Path token.txt -Value $resp.result.token
Write-Output "TOKEN_WRITTEN"
