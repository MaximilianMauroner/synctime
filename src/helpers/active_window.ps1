if (-not ([System.Management.Automation.PSTypeName]'WinAPI').Type) {
    Add-Type -TypeDefinition @"
    using System;
    using System.Runtime.InteropServices;
    using System.Text;
    public class WinAPI {
        [DllImport("user32.dll")]
        public static extern IntPtr GetForegroundWindow();

        [DllImport("user32.dll")]
        public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);

        [DllImport("user32.dll", SetLastError=true)]
        public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);
    }
"@
}

$handle = [WinAPI]::GetForegroundWindow()
if ($handle -ne [IntPtr]::Zero) {
    $title = New-Object System.Text.StringBuilder 256
    [WinAPI]::GetWindowText($handle, $title, $title.Capacity) | Out-Null
    
    $processId = 0
    [WinAPI]::GetWindowThreadProcessId($handle, [ref]$processId) | Out-Null
    
    $processName = ""
    try {
        # Method 1: Direct process ID
        if ($processId -ne 0) {
            $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
            if ($process) {
                $processName = $process.ProcessName
            }
        }
        
        # Method 2: Window handle
        if ([string]::IsNullOrEmpty($processName)) {
            $process = Get-Process | Where-Object { $_.MainWindowHandle -eq $handle } | Select-Object -First 1
            if ($process) {
                $processName = $process.ProcessName
            }
        }

        # Method 3: Find any visible window process
        if ([string]::IsNullOrEmpty($processName)) {
            $allProcesses = Get-Process | Where-Object { $_.MainWindowTitle }
            foreach ($proc in $allProcesses) {
                if ($proc.MainWindowHandle -eq $handle) {
                    $processName = $proc.ProcessName
                    break
                }
            }
        }
    }
    catch {
        Write-Error "Error getting process info: $_"
    }
    
    # Only output if we have a valid process name and title
    if (-not [string]::IsNullOrEmpty($processName) -and -not [string]::IsNullOrEmpty($title.ToString())) {
        $result = @{
            "application" = $processName
            "title" = $title.ToString()
        } | ConvertTo-Json

        Write-Output $result
    }
}
