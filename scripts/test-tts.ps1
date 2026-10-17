Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SetOutputToWaveFile("output/test_voice.wav")
$synth.Speak("SiteSense AI Autonomous Spatial Inspection and Memory Agent")
$synth.Dispose()
$size = (Get-Item "output/test_voice.wav").Length
Write-Host "Audio generated successfully: $size bytes"
