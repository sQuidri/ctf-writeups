set -euo pipefail

SSH_KEY="${SSH_KEY:-$HOME/.ssh/oci_ctf_vm}"
VM_USER="${VM_USER:-opc}"
VM_HOST="${VM_HOST:-158.179.28.218}"
REMOTE_DIR="${REMOTE_DIR:-/opt/ctf-writeups/public}"
SSH_OPTS=(-i "$SSH_KEY" -o StrictHostKeyChecking=accept-new)

cd "$(dirname "$0")"

echo "==> Building Quartz site"
node quartz/bootstrap-cli.mjs build

STAMP="$(date +%Y%m%d-%H%M%S)"
TARBALL="${TMPDIR:-/tmp}/ctf-writeups-${STAMP}.tar.gz"

echo "==> Packaging public/ -> $(basename "$TARBALL")"
tar -C public -czf "$TARBALL" .

echo "==> Uploading to ${VM_USER}@${VM_HOST}"
scp "${SSH_OPTS[@]}" "$TARBALL" "${VM_USER}@${VM_HOST}:/tmp/ctf-writeups.tar.gz"

echo "==> Extracting and fixing SELinux context"
ssh "${SSH_OPTS[@]}" "${VM_USER}@${VM_HOST}" bash -s <<'REMOTE'
set -euo pipefail
sudo rm -rf /opt/ctf-writeups/public
sudo mkdir -p /opt/ctf-writeups/public
sudo tar -xzf /tmp/ctf-writeups.tar.gz -C /opt/ctf-writeups/public
sudo chown -R root:root /opt/ctf-writeups/public
sudo chcon -R -t httpd_sys_content_t /opt/ctf-writeups/public
sudo nginx -t
sudo systemctl reload nginx
rm -f /tmp/ctf-writeups.tar.gz
REMOTE

rm -f "$TARBALL"

echo "==> Deployed successfully"
echo "    https://writeups.wis-ctf.duckdns.org"
echo "    https://writeups.sigsegv-ctf.duckdns.org"
