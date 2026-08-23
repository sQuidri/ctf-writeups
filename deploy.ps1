$ErrorActionPreference = "Stop"

$SSH_KEY = if ($env:SSH_KEY) { $env:SSH_KEY } else { "$HOME/.ssh/oci_ctf_vm" }
$VM_USER = if ($env:VM_USER) { $env:VM_USER } else { "opc" }
$VM_HOST = if ($env:VM_HOST) { $env:VM_HOST } else { "158.179.28.218" }

Set-Location $PSScriptRoot

Write-Host "==> Building Quartz site..." -ForegroundColor Cyan
node quartz/bootstrap-cli.mjs build

$tarball = "$env:TEMP\ctf-writeups.tar.gz"
Write-Host "==> Packaging public/ -> $tarball" -ForegroundColor Cyan
tar -C public -czf "$tarball" .

Write-Host "==> Uploading to ${VM_USER}@${VM_HOST}..." -ForegroundColor Cyan
scp -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new "$tarball" "${VM_USER}@${VM_HOST}:/tmp/ctf-writeups.tar.gz"
Remove-Item "$tarball"

Write-Host "==> Extracting and applying changes on VM..." -ForegroundColor Cyan
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new "${VM_USER}@${VM_HOST}" @"
sudo rm -rf /opt/ctf-writeups/public
sudo mkdir -p /opt/ctf-writeups/public
sudo tar -xzf /tmp/ctf-writeups.tar.gz -C /opt/ctf-writeups/public
sudo chown -R root:root /opt/ctf-writeups/public
sudo chcon -R -t httpd_sys_content_t /opt/ctf-writeups/public
sudo nginx -t
sudo systemctl reload nginx
rm -f /tmp/ctf-writeups.tar.gz
"@

Write-Host "==> Deployed successfully!" -ForegroundColor Green
Write-Host "    https://sigsev.site" -ForegroundColor Cyan
Write-Host "    https://sigsev.au" -ForegroundColor Cyan
Write-Host "    https://writeups.sigsegv-ctf.duckdns.org" -ForegroundColor Cyan
