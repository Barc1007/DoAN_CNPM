$resp = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method Post -ContentType 'application/json' -Body (ConvertTo-Json @{username='testuser'; password='password123'})
$token = $resp.result.token
$cats = Invoke-RestMethod -Uri 'http://localhost:5000/api/categories?type=expense' -Method Get -Headers @{Authorization = 'Bearer ' + $token}
$cats | ConvertTo-Json -Depth 5
