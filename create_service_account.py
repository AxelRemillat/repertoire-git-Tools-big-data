import os
import subprocess
from shutil import which

project = "rise-connect-8407a"
service_name = "mini-api-sa"
service_email = f"{service_name}@{project}.iam.gserviceaccount.com"
key_path = os.path.join(os.getcwd(), "service-account.json")

# Locate gcloud
gcloud = which("gcloud.cmd") or which("gcloud")
if not gcloud:
    raise SystemExit("gcloud not found in PATH")

print("Using gcloud:", gcloud)
print("Project:", project)
print("Service account email:", service_email)
print("Key path:", key_path)

# Check existing service account
p = subprocess.run([gcloud, "iam", "service-accounts", "list", "--project", project, "--format=value(email)"], capture_output=True, text=True)
if p.returncode != 0:
    raise SystemExit(f"Failed to list service accounts: {p.stderr}")
emails = p.stdout.splitlines()
if service_email in emails:
    print("Service account already exists")
else:
    p2 = subprocess.run([gcloud, "iam", "service-accounts", "create", service_name, "--display-name", service_name, "--project", project], capture_output=True, text=True)
    if p2.returncode != 0:
        raise SystemExit(f"Failed to create service account: {p2.stderr}")
    print(p2.stdout)

# Create key
p3 = subprocess.run([gcloud, "iam", "service-accounts", "keys", "create", key_path, "--iam-account", service_email, "--project", project], capture_output=True, text=True)
if p3.returncode != 0:
    raise SystemExit(f"Failed to create key: {p3.stderr}")
print("Created key file:", key_path)

# Grant roles
roles = ["roles/storage.objectAdmin", "roles/aiplatform.user"]
for role in roles:
    p4 = subprocess.run([gcloud, "projects", "add-iam-policy-binding", project, "--member", f"serviceAccount:{service_email}", "--role", role], capture_output=True, text=True)
    if p4.returncode != 0:
        print(f"Warning: failed to bind role {role}: {p4.stderr}")
    else:
        print(f"Granted {role}")

print("Done.")
