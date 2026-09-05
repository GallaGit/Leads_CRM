$ErrorActionPreference = "Stop"
$outDir = Join-Path (Split-Path $PSScriptRoot -Parent) "certs"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$outFile = Join-Path $outDir "avast-web-mail-shield-root.pem"

$cert = Get-ChildItem Cert:\LocalMachine\Root |
  Where-Object { $_.Subject -like "*Avast Web/Mail Shield Root*" } |
  Select-Object -First 1

if (-not $cert) {
  Write-Error "Avast Web/Mail Shield Root not found in LocalMachine\Root"
}

$bytes = $cert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert)
$b64 = [Convert]::ToBase64String($bytes, "InsertLineBreaks")
$pem = "-----BEGIN CERTIFICATE-----`n$b64`n-----END CERTIFICATE-----`n"
[IO.File]::WriteAllText($outFile, $pem)
Write-Output "Exported $($cert.Thumbprint) -> $outFile"
