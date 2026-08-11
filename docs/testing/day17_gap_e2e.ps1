$ErrorActionPreference = 'Continue'
$base = 'http://localhost:8080/api/v1'
function Invoke-Api($Method, $Path, $Token = $null, $Body = $null) {
  $headers = @{ 'Content-Type' = 'application/json' }
  if ($Token) { $headers['Authorization'] = "Bearer $Token" }
  try {
    $params = @{ Method = $Method; Uri = "$base$Path"; Headers = $headers; UseBasicParsing = $true }
    if ($null -ne $Body) { $params['Body'] = ($Body | ConvertTo-Json -Depth 8 -Compress) }
    $resp = Invoke-WebRequest @params
    return @{ Status = [int]$resp.StatusCode; Body = ($resp.Content | ConvertFrom-Json); Raw = $resp.Content }
  }
  catch {
    $r = $_.Exception.Response; $code = if ($r) { [int]$r.StatusCode } else { 0 }; $raw = ''
    try { if ($r) { $reader = New-Object IO.StreamReader($r.GetResponseStream()); $raw = $reader.ReadToEnd() } } catch {}
    $parsed = $null; try { $parsed = $raw | ConvertFrom-Json } catch {}
    return @{ Status = $code; Body = $parsed; Raw = $raw }
  }
}
function D($r) { if ($r.Body.data) { $r.Body.data } else { $r.Body } }

$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$admin = D (Invoke-Api POST '/auth/login' @{ email = 'admin@kolaysoft.com.tr'; password = 'Admin123!' })
$adminToken = $admin.accessToken
$pmEmail = "gap.pm.$ts@kolaysoft.com.tr"
$ctoEmail = "gap.cto.$ts@kolaysoft.com.tr"
$extraEmail = "gap.extra.$ts@kolaysoft.com.tr"

$pm = D (Invoke-Api POST '/users' $adminToken @{ fullName = 'Gap PM'; email = $pmEmail; password = 'Pm123456!'; role = 'PROJECT_MANAGER' })
$cto = D (Invoke-Api POST '/users' $adminToken @{ fullName = 'Gap CTO'; email = $ctoEmail; password = 'Cto123456!'; role = 'CTO' })
$extra = D (Invoke-Api POST '/users' $adminToken @{ fullName = 'Gap Extra'; email = $extraEmail; password = 'Pm123456!'; role = 'PROJECT_MANAGER' })
Write-Host "USERS pm=$($pm.id) cto=$($cto.id) extra=$($extra.id)"

$proj = D (Invoke-Api POST '/projects' $adminToken @{
    name = "Gap Proj $ts"; code = "GAP-$ts"; description = 'gap e2e'; status = 'ACTIVE'; managerId = $pm.id; startDate = '2026-01-01'
  })
Write-Host "PROJECT id=$($proj.id) mgr=$($proj.managerId)"

$assignList = Invoke-Api GET "/projects/$($proj.id)/assignments" $adminToken
Write-Host "ASSIGN list status=$($assignList.Status) count=$((D $assignList).Count)"

$assignExtra = Invoke-Api POST "/projects/$($proj.id)/assignments" $adminToken @{ userId = $extra.id; assignmentRole = 'MEMBER' }
Write-Host "ASSIGN extra status=$($assignExtra.Status)"

$dup = Invoke-Api POST "/projects/$($proj.id)/assignments" $adminToken @{ userId = $extra.id }
Write-Host "ASSIGN dup status=$($dup.Status) (expect 409)"

$ctoTok = (D (Invoke-Api POST '/auth/login' @{ email = $ctoEmail; password = 'Cto123456!' })).accessToken
$ctoWrite = Invoke-Api POST "/projects/$($proj.id)/assignments" $ctoTok @{ userId = $pm.id }
Write-Host "CTO assign status=$($ctoWrite.Status) (expect 403)"
$ctoRead = Invoke-Api GET "/projects/$($proj.id)/assignments" $ctoTok
Write-Host "CTO list status=$($ctoRead.Status) (expect 200)"

$pmTok = (D (Invoke-Api POST '/auth/login' @{ email = $pmEmail; password = 'Pm123456!' })).accessToken
$pmOwn = Invoke-Api GET "/dashboard/projects/$($proj.id)" $pmTok
$pmListAssign = Invoke-Api GET "/projects/$($proj.id)/assignments" $pmTok
$pmWrite = Invoke-Api POST "/projects/$($proj.id)/assignments" $pmTok @{ userId = $cto.id }
Write-Host "PM own=$($pmOwn.Status) listAssign=$($pmListAssign.Status) write=$($pmWrite.Status) (expect 200/200/403)"

$rep = Invoke-Api POST '/reports' $pmTok @{
    projectId = $proj.id; weekNumber = 20; reportDate = '2026-05-11'
    plannedProgress = 10; actualProgress = 10; completedWork = 'a'; plannedWork = 'b'; overallNote = 'c'; scheduleStatus = 'ON_TRACK'
  }
Write-Host "PM report status=$($rep.Status) id=$((D $rep).id)"

$ctoSum = Invoke-Api GET '/dashboard/summary' $ctoTok
$port = Invoke-Api GET "/dashboard/projects?search=Gap%20Proj" $ctoTok
Write-Host "CTO summary=$($ctoSum.Status) portfolio=$($port.Status) found=$(@((D $port).content | Where-Object { $_.id -eq $proj.id -or $_.projectId -eq $proj.id }).Count)"

# inactive assignment
$inactive = D (Invoke-Api POST '/users' $adminToken @{ fullName = 'Inactive'; email = "gap.in.$ts@kolaysoft.com.tr"; password = 'Pm123456!'; role = 'PROJECT_MANAGER' })
Invoke-Api PATCH "/users/$($inactive.id)/status" $adminToken @{ active = $false } | Out-Null
$inAssign = Invoke-Api POST "/projects/$($proj.id)/assignments" $adminToken @{ userId = $inactive.id }
Write-Host "Inactive assign status=$($inAssign.Status) (expect 400)"

Write-Host "DONE"
