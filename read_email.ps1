$ErrorActionPreference = 'Stop'
$navBody = '{"action":"navigate","args":{"url":"https://mail.google.com/mail/u/0/popoutver=pw6t6dmmsv0g&search=inbox&th=%23thread-f:1865910622489904565&cvid=1","newTab":true},"session":"hackathon"}'
Invoke-RestMethod -Uri "http://127.0.0.1:10086/command" -Method Post -Body $navBody -ContentType "application/json" | Out-Null
Start-Sleep -Seconds 5
$snapBody = '{"action":"snapshot","session":"hackathon"}'
$snapRes = Invoke-RestMethod -Uri "http://127.0.0.1:10086/command" -Method Post -Body $snapBody -ContentType "application/json"
$snapRes.tree | Out-File -FilePath "gmail_tree.txt" -Encoding utf8
