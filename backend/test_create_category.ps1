$resp = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method Post -ContentType 'application/json' -Body (ConvertTo-Json @{username='testuser'; password='password123'})
$token = $resp.result.token
$create = Invoke-RestMethod -Uri 'http://localhost:5000/api/categories' -Method Post -ContentType 'application/json' -Headers @{Authorization = 'Bearer ' + $token} -Body (ConvertTo-Json @{name='My New Category'; type='expense'})
$create | ConvertTo-Json -Depth 5
