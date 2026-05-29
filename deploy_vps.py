import paramiko
import sys
import os
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
    client.connect(hostname, username=username, password=password, timeout=10)
    
    # Check if Elenx folder exists
    stdin, stdout, stderr = client.exec_command('if [ -d "Elenx" ]; then echo "Exists"; else echo "NotExists"; fi')
    status = stdout.read().decode('utf-8', errors='replace').strip()
    
    if status == "NotExists":
        print("Cloning repository...")
        client.exec_command('git clone https://github.com/shamuddin/Elenx.git')
    else:
        print("Pulling latest changes...")
        client.exec_command('cd Elenx && git pull')
    
    # We will upload the .env file now via SFTP
    print("Uploading .env file...")
    sftp = client.open_sftp()
    sftp.put('.env', 'Elenx/.env')
    sftp.close()

    # Now, find the Caddyfile on the VPS and update it
    print("Locating Caddyfile...")
    stdin, stdout, stderr = client.exec_command('find /home/deploy -name "Caddyfile" 2>/dev/null | grep -v "/." | head -n 1')
    caddyfile_path = stdout.read().decode('utf-8', errors='replace').strip()
    
    if not caddyfile_path:
        # Check standard locations
        caddyfile_path = '/home/deploy/blog/Caddyfile' # guessing from blog-caddy-1
        
    print(f"Caddyfile found at: {caddyfile_path}")
    
    # Prepare the Caddyfile addition
    caddy_snippet = """
elenx.aiproofofconcept.in {
    handle_path /memory* {
        reverse_proxy localhost:9001
    }
    
    handle_path /socket.io* {
        reverse_proxy localhost:4001
    }
    
    handle_path /api* {
        reverse_proxy localhost:4001
    }

    handle {
        reverse_proxy localhost:4003
    }
}
"""
    
    if caddyfile_path:
        # Check if already added
        stdin, stdout, stderr = client.exec_command(f'grep -q "elenx.aiproofofconcept.in" {caddyfile_path} && echo "Added" || echo "NotAdded"')
        if stdout.read().decode('utf-8', errors='replace').strip() == "NotAdded":
            print("Adding Elenx to Caddyfile...")
            client.exec_command(f'cat << "EOF" >> {caddyfile_path}\n{caddy_snippet}\nEOF')
            # Restart caddy
            print("Restarting Caddy...")
            client.exec_command('docker restart blog-caddy-1')
        else:
            print("Elenx domain already in Caddyfile. Updating ports...")
            client.exec_command(f'sed -i "s/localhost:8001/localhost:9001/g" {caddyfile_path}')
            client.exec_command(f'sed -i "s/localhost:3001/localhost:4001/g" {caddyfile_path}')
            client.exec_command(f'sed -i "s/localhost:3003/localhost:4003/g" {caddyfile_path}')
            print("Restarting Caddy...")
            client.exec_command('docker restart blog-caddy-1')
    
    print("Starting Docker Compose...")
    stdin, stdout, stderr = client.exec_command('cd Elenx && docker compose up -d --build')
    
    # Print the output in real-time or wait
    for line in stdout:
        print(line.encode('utf-8', errors='replace').decode('utf-8', errors='replace').strip())
        
    for line in stderr:
        print("ERROR:", line.encode('utf-8', errors='replace').decode('utf-8', errors='replace').strip())

    client.close()
except Exception as e:
    print(f"Error: {e}")
