import paramiko
import sys

hostname = '207.244.251.241'
username = 'deploy'
password = '$SUSE$1105'

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname, username=username, password=password, timeout=10)
    
    stdin, stdout, stderr = client.exec_command('docker ps; echo "---"; ls -la')
    print("STDOUT:", stdout.read().decode())
    print("STDERR:", stderr.read().decode())
    
    client.close()
except Exception as e:
    print(f"Error: {e}")
