import subprocess, sys

env_content = ''''''

result = subprocess.run(
    ['ssh', '-o', 'StrictHostKeyChecking=no', '-o', 'PasswordAuthentication=yes',
     '-o', 'BatchMode=no', '-p', '65002',
     'u203096280@45.90.229.210',
     'cat > ~/domains/smanegeri1babatlmg.sch.id/presensi-app/.env'],
    input=env_content,
    capture_output=True, text=True
)
print(result.stdout)
print(result.stderr, file=sys.stderr)
sys.exit(result.returncode)
