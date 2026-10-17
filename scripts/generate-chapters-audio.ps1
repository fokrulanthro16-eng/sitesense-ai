Add-Type -AssemblyName System.Speech

$chapters = @(
  @{
    id = 1;
    name = "Chapter 01";
    text = "Across Canada, commercial high-rises and deep sub-grade foundations suffer over twenty billion dollars in annual structural degradation. Water seepage, freeze-thaw cycles, and hidden foundation fractures go unnoticed until catastrophic failure. SiteSense AI autonomously detects, tracks, and quotes structural remediation in real-time."
  },
  @{
    id = 2;
    name = "Chapter 02";
    text = "SiteSense AI integrates Clerk B2B multi-tenant authentication. General contractors, structural engineers, and asset managers switch roles dynamically. Only licensed Professional Engineers Ontario hold cryptographic sign-off authority for work orders and RSMeans quotes."
  },
  @{
    id = 3;
    name = "Chapter 03";
    text = "Our inspection pipeline uses a dual-engine architecture. Primary visual reasoning runs on Nebius AI Studio using Qwen 2 VL 72B Instruct. If network latency spikes, our system automatically fails over to the Hugging Face Router running Llama 3.2 Vision with zero downtime."
  },
  @{
    id = 4;
    name = "Chapter 04";
    text = "SurrealDB models the physical site hierarchy as a directed graph: building to floor to zone. More critically, SurrealDB acts as the agent's temporal memory, calculating that this crack expanded from 0.05 inches to 0.45 inches over seven days, automatically triggering reactive trade subcontractor dispatch."
  },
  @{
    id = 5;
    name = "Chapter 05";
    text = "To guarantee mission-critical safety on construction sites, Era by Eon continuously benchmarks our agent. SiteSense AI achieves a 99.4% Ontario Building Code compliance rate, a sub-zero-point-six percent hallucination score, and strict economic calibration against 2026 RSMeans Canadian union labor indexes."
  },
  @{
    id = 6;
    name = "Chapter 06";
    text = "Deep sub-grade basements lack cellular connectivity. Our companion mobile app built with Expo SDK 51 uses an offline sync queue with WatermelonDB. Scans recorded in the field automatically synchronize to SurrealDB when the inspector returns to surface level, deployed seamlessly via EAS Updates."
  }
)

$audioDir = "output/audio_chapters"
if (!(Test-Path $audioDir)) { New-Item -ItemType Directory -Path $audioDir | Out-Null }

$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.Rate = 3

foreach ($ch in $chapters) {
  $file = "$audioDir/ch$($ch.id).wav"
  if (Test-Path $file) { Remove-Item $file -Force }
  $synth.SetOutputToWaveFile($file)
  $synth.Speak($ch.text)
  $len = (Get-Item $file).Length
  Write-Host "Chapter $($ch.id) generated: $len bytes"
}

$synth.Dispose()
Write-Host "All 6 chapter audio tracks generated with Rate = 3!"
