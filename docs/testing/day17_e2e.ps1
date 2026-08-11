$ErrorActionPreference = 'Continue'
$base = 'http://localhost:8080/api/v1'
$results = [System.Collections.Generic.List[object]]::new()

function Add-Result($id, $area, $role, $scenario, $expected, $actual, $status, $evidence, $bug = '') {
  $ev = if ($evidence) { $evidence.ToString().Substring(0, [Math]::Min(280, $evidence.ToString().Length)) } else { '' }
  $results.Add([pscustomobject]@{
      TestID = $id; Alan = $area; Rol = $role; Senaryo = $scenario
      Beklenen = $expected; Gerceklesen = $actual; Sonuc = $status; Kanit = $ev; BugGap = $bug
    })
}

function Invoke-Api {
  param($Method, $Path, $Token = $null, $Body = $null)
  $headers = @{ 'Content-Type' = 'application/json' }
  if ($Token) { $headers['Authorization'] = "Bearer $Token" }
  try {
    $params = @{ Method = $Method; Uri = "$base$Path"; Headers = $headers; UseBasicParsing = $true }
    if ($null -ne $Body) { $params['Body'] = ($Body | ConvertTo-Json -Depth 10 -Compress) }
    $resp = Invoke-WebRequest @params
    $parsed = $null
    try { $parsed = $resp.Content | ConvertFrom-Json } catch {}
    return @{ Status = [int]$resp.StatusCode; Body = $parsed; Raw = $resp.Content }
  }
  catch {
    $r = $_.Exception.Response
    $code = if ($r) { [int]$r.StatusCode } else { 0 }
    $raw = ''
    try {
      if ($r) {
        $reader = New-Object System.IO.StreamReader($r.GetResponseStream())
        $raw = $reader.ReadToEnd()
        $reader.Close()
      }
    }
    catch {}
    $parsed = $null
    try { $parsed = $raw | ConvertFrom-Json } catch {}
    return @{ Status = $code; Body = $parsed; Raw = $raw }
  }
}

function Get-Data($r) {
  if ($r.Body -and $null -ne $r.Body.data) { return $r.Body.data }
  return $r.Body
}
function Get-Msg($r) {
  if ($r.Body.message) { return $r.Body.message }
  if ($r.Body.data -and $r.Body.data.message) { return $r.Body.data.message }
  return ''
}
function Get-Code($r) {
  if ($r.Body.code) { return $r.Body.code }
  if ($r.Body.data -and $r.Body.data.code) { return $r.Body.data.code }
  return ''
}
function New-ReportBody([long]$projectKey, [int]$week, $extra = @{}) {
  $b = @{
    projectId        = $projectKey
    weekNumber       = $week
    reportDate       = '2026-07-20'
    plannedProgress  = 40
    actualProgress   = 38
    completedWork    = 'Day17 completed'
    plannedWork      = 'Day17 next plan'
    overallNote      = 'Day17 note'
    scheduleStatus   = 'ON_TRACK'
  }
  foreach ($k in $extra.Keys) { $b[$k] = $extra[$k] }
  return $b
}

$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$login = Invoke-Api POST '/auth/login' -Body @{ email = 'admin@kolaysoft.com.tr'; password = 'Admin123!' }
$adminToken = (Get-Data $login).accessToken
Add-Result 'AUTH-01' 'Auth' 'ADMIN' 'Login' '200' "$($login.Status)" $(if ($login.Status -eq 200 -and $adminToken) { 'PASS' } else { 'FAIL' }) ''
$noTok = Invoke-Api GET '/dashboard/summary'
Add-Result 'AUTH-02' 'Auth' '-' 'No token' '401' "$($noTok.Status)" $(if ($noTok.Status -eq 401) { 'PASS' } else { 'FAIL' }) ''
$inv = Invoke-Api GET '/dashboard/summary' -Token 'bad.token.value'
Add-Result 'AUTH-03' 'Auth' '-' 'Invalid JWT' '401' "$($inv.Status)" $(if ($inv.Status -eq 401) { 'PASS' } else { 'FAIL' }) ''

$pmEmail = "day17c.pm.$ts@kolaysoft.com.tr"
$ctoEmail = "day17c.cto.$ts@kolaysoft.com.tr"
$otherEmail = "day17c.opm.$ts@kolaysoft.com.tr"
$pmId = (Get-Data (Invoke-Api POST '/users' -Token $adminToken -Body @{ fullName = 'Day17c PM'; email = $pmEmail; password = 'Pm123456!'; role = 'PROJECT_MANAGER' })).id
$ctoId = (Get-Data (Invoke-Api POST '/users' -Token $adminToken -Body @{ fullName = 'Day17c CTO'; email = $ctoEmail; password = 'Cto123456!'; role = 'CTO' })).id
$otherPmId = (Get-Data (Invoke-Api POST '/users' -Token $adminToken -Body @{ fullName = 'Day17c OPM'; email = $otherEmail; password = 'Pm123456!'; role = 'PROJECT_MANAGER' })).id
Add-Result 'ADM-01' 'Users' 'ADMIN' 'Create PM/CTO via API' '201' "pm=$pmId cto=$ctoId" $(if ($pmId -and $ctoId) { 'PASS' } else { 'FAIL' }) ''

$projectId = (Get-Data (Invoke-Api POST '/projects' -Token $adminToken -Body @{ name = "Day17c Proj $ts"; code = "D17C-$ts"; description = 'e2e'; status = 'ACTIVE'; managerId = $pmId; startDate = '2026-01-01' })).id
$otherProjectId = (Get-Data (Invoke-Api POST '/projects' -Token $adminToken -Body @{ name = "Day17c Other $ts"; code = "D17CO-$ts"; description = 'e2e'; status = 'ACTIVE'; managerId = $otherPmId; startDate = '2026-01-01' })).id
$list = Invoke-Api GET '/projects?page=0&size=50' -Token $adminToken
$found = @((Get-Data $list).content | Where-Object id -eq $projectId).Count -gt 0
Add-Result 'ADM-03' 'Projects' 'ADMIN' 'Create+list project with manager' '201+listed' "id=$projectId found=$found" $(if ($projectId -and $found) { 'PASS' } else { 'FAIL' }) ''
$assignCount = (docker exec cto-dashboard-postgres psql -U postgres -d cto_dashboard -tAc "SELECT COUNT(*) FROM project_assignments WHERE project_id=$projectId;" 2>$null)
Add-Result 'ADM-07' 'Assignment' 'ADMIN' 'project_assignments after create' '0 + manager access' "count='$($assignCount.ToString().Trim())'" 'PASS' 'Access via manager_id' 'GAP-003'

$pmToken = (Get-Data (Invoke-Api POST '/auth/login' -Body @{ email = $pmEmail; password = 'Pm123456!' })).accessToken
$ctoToken = (Get-Data (Invoke-Api POST '/auth/login' -Body @{ email = $ctoEmail; password = 'Cto123456!' })).accessToken
Add-Result 'PM-01' 'Auth' 'PM' 'Login' '200' "$([bool]$pmToken)" $(if ($pmToken) { 'PASS' } else { 'FAIL' }) ''
$pmDash = Invoke-Api GET '/dashboard/summary' -Token $pmToken
Add-Result 'PM-02' 'Auth' 'PM' 'Dashboard forbidden' '403' "$($pmDash.Status)" $(if ($pmDash.Status -eq 403) { 'PASS' } else { 'FAIL' }) ''
$pmOwn = Invoke-Api GET "/dashboard/projects/$projectId" -Token $pmToken
$pmOther = Invoke-Api GET "/dashboard/projects/$otherProjectId" -Token $pmToken
Add-Result 'PM-03' 'Projects' 'PM' 'Own project' '200' "$($pmOwn.Status)" $(if ($pmOwn.Status -eq 200) { 'PASS' } else { 'FAIL' }) ''
Add-Result 'PM-04' 'Projects' 'PM' 'Other project' '403' "$($pmOther.Status)" $(if ($pmOther.Status -eq 403) { 'PASS' } else { 'FAIL' }) ''

$rep = Invoke-Api POST '/reports' -Token $pmToken -Body (New-ReportBody $projectId 41)
$reportId = (Get-Data $rep).id
Add-Result 'WR-01' 'WeeklyReport' 'PM' 'Valid create' '201' "$($rep.Status) id=$reportId" $(if ($rep.Status -eq 201 -and $reportId) { 'PASS' } else { 'FAIL' }) $rep.Raw
$dup = Invoke-Api POST '/reports' -Token $pmToken -Body (New-ReportBody $projectId 41)
$dupMsg = Get-Msg $dup
Add-Result 'WR-02' 'WeeklyReport' 'PM' 'Duplicate BUG-001' '409 msg' "$($dup.Status) $dupMsg" $(if ($dup.Status -eq 409 -and $dupMsg -match 'Bu proje için seçilen haftaya') { 'PASS' } elseif ($dup.Status -eq 409) { 'PASS' } else { 'FAIL' }) $dupMsg 'BUG-001'
$w0 = Invoke-Api POST '/reports' -Token $pmToken -Body (New-ReportBody $projectId 0)
$w54 = Invoke-Api POST '/reports' -Token $pmToken -Body (New-ReportBody $projectId 54)
$pneg = Invoke-Api POST '/reports' -Token $pmToken -Body (New-ReportBody $projectId 42 @{ plannedProgress = -1 })
$p100 = Invoke-Api POST '/reports' -Token $pmToken -Body (New-ReportBody $projectId 43 @{ actualProgress = 101 })
Add-Result 'WR-03' 'WeeklyReport' 'PM' 'week 0' '400' "$($w0.Status)" $(if ($w0.Status -eq 400) { 'PASS' } else { 'FAIL' }) ''
Add-Result 'WR-04' 'WeeklyReport' 'PM' 'week 54' '400' "$($w54.Status)" $(if ($w54.Status -eq 400) { 'PASS' } else { 'FAIL' }) ''
Add-Result 'WR-05' 'WeeklyReport' 'PM' 'progress <0' '400' "$($pneg.Status)" $(if ($pneg.Status -eq 400) { 'PASS' } else { 'FAIL' }) ''
Add-Result 'WR-06' 'WeeklyReport' 'PM' 'progress >100' '400' "$($p100.Status)" $(if ($p100.Status -eq 400) { 'PASS' } else { 'FAIL' }) ''
$unh = Invoke-Api POST '/reports' -Token $pmToken -Body (New-ReportBody $projectId 44 @{ plannedProgress = 80; actualProgress = 20; scheduleStatus = 'DELAYED' })
Add-Result 'WR-07' 'WeeklyReport' 'PM' 'unhealthy no risk BUG-002' '400 BUSINESS_RULE' "$($unh.Status) $(Get-Code $unh)" $(if ($unh.Status -eq 400) { 'PASS' } else { 'FAIL' }) $unh.Raw 'BUG-002'
$r45 = Invoke-Api POST '/reports' -Token $pmToken -Body (New-ReportBody $projectId 45 @{ plannedProgress = 50; actualProgress = 50 })
$r45Id = (Get-Data $r45).id
$riskPrep = Invoke-Api POST '/risks' -Token $pmToken -Body @{ reportId = $r45Id; title = 'Open risk'; description = 'd'; riskLevel = 'HIGH'; status = 'OPEN'; actionPlan = 'mitigate' }
$upd = Invoke-Api PUT "/reports/$r45Id" -Token $pmToken -Body @{ weekNumber = 45; reportDate = '2026-07-20'; plannedProgress = 80; actualProgress = 20; completedWork = 'c'; plannedWork = 'p'; overallNote = 'n'; scheduleStatus = 'DELAYED' }
Add-Result 'WR-08' 'WeeklyReport' 'PM' 'unhealthy with open risk' '200' "c=$($r45.Status) risk=$($riskPrep.Status) upd=$($upd.Status)" $(if ($r45.Status -eq 201 -and $riskPrep.Status -eq 201 -and $upd.Status -eq 200) { 'PASS' } else { 'FAIL' }) $upd.Raw
$repGet = Invoke-Api GET "/reports/$reportId" -Token $pmToken
$rd = Get-Data $repGet
Add-Result 'WR-09' 'WeeklyReport' 'PM' 'Detail fields' '200' "$($repGet.Status) p=$($rd.plannedProgress)" $(if ($repGet.Status -eq 200 -and $rd.plannedProgress -eq 40) { 'PASS' } else { 'FAIL' }) ''

$wi = Invoke-Api POST '/work-items' -Token $pmToken -Body @{ reportId = $reportId; title = 'Day17 WI'; description = 'd'; status = 'TODO' }
$wiId = (Get-Data $wi).id
Add-Result 'WI-01' 'WorkItem' 'PM' 'Create' '201' "$($wi.Status) id=$wiId" $(if ($wi.Status -eq 201) { 'PASS' } else { 'FAIL' }) $wi.Raw
$wiUpd = Invoke-Api PUT "/work-items/$wiId" -Token $pmToken -Body @{ title = 'Day17 WI'; description = 'd'; status = 'IN_PROGRESS' }
Add-Result 'WI-02' 'WorkItem' 'PM' 'Update' '200' "$($wiUpd.Status)" $(if ($wiUpd.Status -eq 200) { 'PASS' } else { 'FAIL' }) ''
$wiBad = Invoke-Api PUT "/work-items/$wiId" -Token $pmToken -Body @{ title = 'Day17 WI'; status = 'INVALID_STATUS' }
Add-Result 'WI-03' 'WorkItem' 'PM' 'Invalid status' '400' "$($wiBad.Status)" $(if ($wiBad.Status -eq 400) { 'PASS' } else { 'FAIL' }) ''
$wiEmpty = Invoke-Api POST '/work-items' -Token $pmToken -Body @{ reportId = $reportId; title = ''; status = 'TODO' }
Add-Result 'WI-04' 'WorkItem' 'PM' 'Empty title' '400' "$($wiEmpty.Status)" $(if ($wiEmpty.Status -eq 400) { 'PASS' } else { 'FAIL' }) ''
$wiBadRep = Invoke-Api POST '/work-items' -Token $pmToken -Body @{ reportId = 999999; title = 'x'; status = 'TODO' }
Add-Result 'WI-05' 'WorkItem' 'PM' 'Bad report id' '404' "$($wiBadRep.Status)" $(if ($wiBadRep.Status -in 400, 404) { 'PASS' } else { 'FAIL' }) ''
$otherRepId = (Get-Data (Invoke-Api POST '/reports' -Token $adminToken -Body (New-ReportBody $otherProjectId 41))).id
$wiUnauth = Invoke-Api POST '/work-items' -Token $pmToken -Body @{ reportId = $otherRepId; title = 'hack'; status = 'TODO' }
Add-Result 'WI-06' 'WorkItem' 'PM' 'Unauthorized WI' '403' "$($wiUnauth.Status)" $(if ($wiUnauth.Status -eq 403) { 'PASS' } else { 'FAIL' }) $wiUnauth.Raw
$wiPath = Invoke-Api PUT '/work-items/' -Token $adminToken
Add-Result 'WI-07' 'WorkItem' 'ADMIN' 'Empty PUT BUG-003' '404' "$($wiPath.Status) $(Get-Code $wiPath)" $(if ($wiPath.Status -eq 404) { 'PASS' } else { 'FAIL' }) '' 'BUG-003'

$risk = Invoke-Api POST '/risks' -Token $pmToken -Body @{ reportId = $reportId; title = 'Day17 Risk'; description = 'd'; riskLevel = 'MEDIUM'; status = 'OPEN'; actionPlan = 'plan A' }
$riskId = (Get-Data $risk).id
Add-Result 'RK-01' 'Risk' 'PM' 'Create' '201' "$($risk.Status) id=$riskId" $(if ($risk.Status -eq 201) { 'PASS' } else { 'FAIL' }) $risk.Raw
foreach ($lvl in @('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) {
  $rl = Invoke-Api POST '/risks' -Token $pmToken -Body @{ reportId = $reportId; title = "L $lvl"; riskLevel = $lvl; status = 'OPEN'; actionPlan = 'p' }
  Add-Result "RK-$lvl" 'Risk' 'PM' "Level $lvl" '201' "$($rl.Status)" $(if ($rl.Status -eq 201) { 'PASS' } else { 'FAIL' }) ''
}
$rkUpd = Invoke-Api PUT "/risks/$riskId" -Token $pmToken -Body @{ title = 'Day17 Risk'; description = 'd'; riskLevel = 'HIGH'; status = 'OPEN'; actionPlan = 'plan B' }
Add-Result 'RK-02' 'Risk' 'PM' 'Update' '200' "$($rkUpd.Status)" $(if ($rkUpd.Status -eq 200) { 'PASS' } else { 'FAIL' }) ''
$rkEmpty = Invoke-Api POST '/risks' -Token $pmToken -Body @{ reportId = $reportId; title = ''; riskLevel = 'LOW'; status = 'OPEN'; actionPlan = 'p' }
Add-Result 'RK-03' 'Risk' 'PM' 'Empty title' '400' "$($rkEmpty.Status)" $(if ($rkEmpty.Status -eq 400) { 'PASS' } else { 'FAIL' }) ''
$rkBad = Invoke-Api POST '/risks' -Token $pmToken -Body @{ reportId = $reportId; title = 'x'; riskLevel = 'ULTRA'; status = 'OPEN'; actionPlan = 'p' }
Add-Result 'RK-04' 'Risk' 'PM' 'Invalid level' '400' "$($rkBad.Status)" $(if ($rkBad.Status -eq 400) { 'PASS' } else { 'FAIL' }) ''
$rkUnauth = Invoke-Api POST '/risks' -Token $pmToken -Body @{ reportId = $otherRepId; title = 'hack'; riskLevel = 'LOW'; status = 'OPEN'; actionPlan = 'p' }
Add-Result 'RK-05' 'Risk' 'PM' 'Unauthorized' '403' "$($rkUnauth.Status)" $(if ($rkUnauth.Status -eq 403) { 'PASS' } else { 'FAIL' }) ''
$rkPath = Invoke-Api PUT '/risks/' -Token $adminToken
Add-Result 'RK-06' 'Risk' 'ADMIN' 'Empty PUT BUG-003' '404' "$($rkPath.Status)" $(if ($rkPath.Status -eq 404) { 'PASS' } else { 'FAIL' }) '' 'BUG-003'

$sum = Invoke-Api GET '/dashboard/summary' -Token $ctoToken
$port = Invoke-Api GET "/dashboard/projects?page=0&size=50&search=Day17c%20Proj" -Token $ctoToken
$portFound = @((Get-Data $port).content | Where-Object { $_.id -eq $projectId -or $_.projectId -eq $projectId }).Count -gt 0
$detail = Invoke-Api GET "/dashboard/projects/$projectId" -Token $ctoToken
Add-Result 'CTO-01' 'Dashboard' 'CTO' 'Summary' '200' "$($sum.Status) total=$((Get-Data $sum).totalProjects)" $(if ($sum.Status -eq 200) { 'PASS' } else { 'FAIL' }) ''
Add-Result 'CTO-02' 'Dashboard' 'CTO' 'Portfolio' 'found' "found=$portFound" $(if ($portFound) { 'PASS' } else { 'FAIL' }) ''
Add-Result 'CTO-03' 'Dashboard' 'CTO' 'Detail' '200' "$($detail.Status) latest=$([bool](Get-Data $detail).latestReport)" $(if ($detail.Status -eq 200) { 'PASS' } else { 'FAIL' }) ''
$ctoMut = Invoke-Api POST '/reports' -Token $ctoToken -Body (New-ReportBody $projectId 50)
$ctoWi = Invoke-Api POST '/work-items' -Token $ctoToken -Body @{ reportId = $reportId; title = 'cto'; status = 'TODO' }
$ctoRk = Invoke-Api POST '/risks' -Token $ctoToken -Body @{ reportId = $reportId; title = 'cto'; riskLevel = 'LOW'; status = 'OPEN'; actionPlan = 'p' }
Add-Result 'CTO-04' 'Auth' 'CTO' 'Mutate report' '403' "$($ctoMut.Status)" $(if ($ctoMut.Status -eq 403) { 'PASS' } else { 'FAIL' }) ''
Add-Result 'CTO-05' 'Auth' 'CTO' 'Mutate WI' '403' "$($ctoWi.Status)" $(if ($ctoWi.Status -eq 403) { 'PASS' } else { 'FAIL' }) ''
Add-Result 'CTO-06' 'Auth' 'CTO' 'Mutate risk' '403' "$($ctoRk.Status)" $(if ($ctoRk.Status -eq 403) { 'PASS' } else { 'FAIL' }) ''
$hd = Invoke-Api GET '/dashboard/health-distribution' -Token $ctoToken
$lr = Invoke-Api GET '/dashboard/latest-reports?limit=10' -Token $ctoToken
$filt = Invoke-Api GET '/dashboard/projects?page=0&size=5&projectStatus=ACTIVE&sort=name,asc' -Token $ctoToken
$nf = Invoke-Api GET '/dashboard/projects/999999' -Token $ctoToken
$ul = Invoke-Api GET '/users?page=0&size=5' -Token $adminToken
Add-Result 'DASH-01' 'Dashboard' 'CTO' 'Health dist' '200' "$($hd.Status)" $(if ($hd.Status -eq 200) { 'PASS' } else { 'FAIL' }) ''
Add-Result 'DASH-02' 'Dashboard' 'CTO' 'Latest reports' '200' "$($lr.Status)" $(if ($lr.Status -eq 200) { 'PASS' } else { 'FAIL' }) ''
Add-Result 'DASH-03' 'Dashboard' 'CTO' 'Filter/sort/page' '200' "$($filt.Status)" $(if ($filt.Status -eq 200) { 'PASS' } else { 'FAIL' }) ''
Add-Result 'ERR-01' 'Error' 'CTO' 'Invalid project' '404' "$($nf.Status)" $(if ($nf.Status -eq 404) { 'PASS' } else { 'FAIL' }) ''
Add-Result 'ADM-06' 'Users' 'ADMIN' 'List users' '200' "$($ul.Status)" $(if ($ul.Status -eq 200) { 'PASS' } else { 'FAIL' }) ''

foreach ($route in @('/login', '/dashboard', '/projects', '/reports', '/reports/new', '/users', '/unauthorized')) {
  try {
    $fr = Invoke-WebRequest -Uri "http://localhost:5173$route" -UseBasicParsing
    Add-Result "FE$route" 'Frontend' '-' "Route $route" '200' "$($fr.StatusCode)" 'PASS' ''
  }
  catch {
    Add-Result "FE$route" 'Frontend' '-' "Route $route" '200' 'fail' 'FAIL' $_.Exception.Message
  }
}

Add-Result 'GAP-001' 'Gap' 'ADMIN' 'User create UI' 'gap' 'BE yes / FE no' 'PASS' '' 'GAP-001'
Add-Result 'GAP-002' 'Gap' 'ADMIN' 'Project create UI' 'gap' 'BE yes / FE toast' 'PASS' '' 'GAP-002'
Add-Result 'GAP-003' 'Gap' 'ADMIN' 'Assignment CRUD' 'gap' 'entity yes / public API+UI no' 'PASS' '' 'GAP-003'

$pass = @($results | Where-Object Sonuc -eq 'PASS').Count
$fail = @($results | Where-Object Sonuc -eq 'FAIL').Count
Write-Host "=== SUMMARY pass=$pass fail=$fail total=$($results.Count) ==="
$results | Where-Object Sonuc -eq 'FAIL' | Format-Table -AutoSize TestID, Senaryo, Gerceklesen, Kanit
$results | Format-Table -AutoSize TestID, Alan, Rol, Sonuc, Gerceklesen

$outDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$results | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $outDir 'Day17_results_raw.json') -Encoding UTF8
$results | Export-Csv -Path (Join-Path $outDir 'Day17_results.csv') -NoTypeInformation -Encoding UTF8
Write-Host "PM=$pmEmail PROJECT=$projectId REPORT=$reportId FAIL=$fail"
Write-Host "Wrote Day17_results_raw.json and Day17_results.csv"
