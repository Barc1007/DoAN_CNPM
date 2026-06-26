$resp = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method Post -ContentType 'application/json' -Body (ConvertTo-Json @{username='testuser'; password='password123'})
$token = $resp.result.token
$del = Invoke-RestMethod -Uri 'http://localhost:5000/api/categories/35' -Method Delete -Headers @{Authorization = 'Bearer ' + $token}
$del | ConvertTo-Json -Depth 5
