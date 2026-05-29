import paramiko
import sys
import codecs

if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

hostname = '207.244.251.241'
username = 'deploy'
password = '$SUSE$1105'

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname, username=username, password=password)
    
    stdin, stdout, stderr = client.exec_command('docker logs elenx-api-1 --tail 50')
    for line in stdout:
        print(line.encode('utf-8', errors='replace').decode('utf-8', errors='replace').strip())
        
    for line in stderr:
        print("ERROR:", line.encode('utf-8', errors='replace').decode('utf-8', errors='replace').strip())

    print("\n--- CADDYFILE ---")
    stdin, stdout, stderr = client.exec_command('cat /home/deploy/blog/Caddyfile')
    for line in stdout:
        print(line.encode('utf-8', errors='replace').decode('utf-8', errors='replace').strip())

    client.close()
except Exception as e:
    print(f"Error: {e}")
