$mysql = "D:\xampp\mysql\bin\mysql.exe"
$schema = "d:\xampp\htdocs\Project\glamconnect-main\backend\database\schema.sql"

& $mysql -u root -e "CREATE DATABASE IF NOT EXISTS glam_app;"
Get-Content $schema | & $mysql -u root glam_app
