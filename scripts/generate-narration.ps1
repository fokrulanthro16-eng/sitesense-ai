Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.Rate = 2

$outputWav = "output/narration.wav"
if (Test-Path $outputWav) { Remove-Item $outputWav -Force }

$synth.SetOutputToWaveFile($outputWav)

$chapters = @(
  "Across Canada, commercial high-rises and deep sub-grade foundations suffer over twenty billion dollars in annual structural degradation. Water seepage, freeze-thaw cycles, and hidden foundation fractures go unnoticed until catastrophic failure. SiteSense AI autonomously detects, tracks, and quotes structural remediation in real-time.",
  "SiteSense AI integrates Clerk B2B multi-tenant authentication. General contractors, structural engineers, and asset managers switch roles dynamically. Only licensed Professional Engineers Ontario hold cryptographic sign-off authority for work orders and RSMeans quotes.",
  "Our inspection pipeline uses a dual-engine architecture. Primary visual reasoning runs on Nebius AI Studio using Qwen 2 VL 72B Instruct. If network latency spikes, our system automatically fails over to the Hugging Face Router running Llama 3.2 Vision with zero downtime.",
  "SurrealDB models the physical site hierarchy as a directed graph: building to floor to zone. More critically, SurrealDB acts as the agent's temporal memory, calculating that this crack expanded from 0.05 inches to 0.45 inches over seven days, automatically triggering reactive trade subcontractor dispatch.",
  "To guarantee mission-critical safety on construction sites, Era by Eon continuously benchmarks our agent. SiteSense AI achieves a 99.4% Ontario Building Code compliance rate, a sub-zero-point-six percent hallucination score, and strict economic calibration against 2026 RSMeans Canadian union labor indexes.",
  "Deep sub-grade basements lack cellular connectivity. Our companion mobile app built with Expo SDK 51 uses an offline sync queue with WatermelonDB. Scans recorded in the field automatically synchronize to SurrealDB when the inspector returns to surface level, deployed seamlessly via EAS Updates."
)

for ($i = 0; $i -lt $chapters.Count; $i++) {
  Write-Host "Synthesizing Chapter $($i+1)..."
  $synth.Speak($chapters[$i])
  Start-Sleep -Milliseconds 400
}

$synth.Dispose()
$item = Get-Item $outputWav
Write-Host "Master narration generated successfully: $($item.Length) bytes"
