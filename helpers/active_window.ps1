Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
using System.Text;
public class WinAPI {
    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll")]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);
}
"@

# Call GetForegroundWindow
$handle = [WinAPI]::GetForegroundWindow()
if ($handle -ne [IntPtr]::Zero) {
    $title = New-Object System.Text.StringBuilder 256
    [WinAPI]::GetWindowText($handle, $title, $title.Capacity) | Out-Null
    Write-Output $title.ToString()
} else {
    Write-Output "No active window"
}
