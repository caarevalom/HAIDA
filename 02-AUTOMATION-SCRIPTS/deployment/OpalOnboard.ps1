<#
.SYNOPSIS
    Opal Onboarding Script - Automates setup for resources required for Opal.

.DESCRIPTION
    PowerShell script for onboarding to Opal that automates:
    - Creating Service Principals for required applications
    - Setting up a dynamic Azure AD device group
    - Configuring Windows Cloud Login service principal for remote desktop access
    - Creating and assigning Microsoft Edge configuration policies
    - Validating existing setup

.PARAMETER Mode
    Operation mode: 'Setup' to run onboarding, 'Validate' to check existing setup
    Default: Setup

.EXAMPLE
    .\OpalOnboard.ps1
    Runs setup mode to create all resources

.EXAMPLE
    .\OpalOnboard.ps1 -WhatIf
    Preview what would be created without making changes

.EXAMPLE
    .\OpalOnboard.ps1 -Mode Validate
    Validates that all resources exist and are configured correctly

.NOTES
    Prerequisites:
    - Permissions: Application.ReadWrite.All, DeviceManagementConfiguration.ReadWrite.All, Group.ReadWrite.All, Directory.ReadWrite.All

    The script automatically installs required Microsoft Graph modules:
    - Microsoft.Graph.Authentication
    - Microsoft.Graph.Beta.Applications
    - Microsoft.Graph.Beta.DeviceManagement
    - Microsoft.Graph.Beta.Groups

    Setup Mode:
    - Connects to Microsoft Graph (interactive authentication)
    - Creates 8 Service Principals for required applications
    - Creates dynamic device group with membership rule
    - Configures Windows Cloud Login service principal:
      * Enables remote desktop protocol if not already enabled
      * Adds the device group to target device groups
    - Creates Edge configuration policy
    - Assigns policy to the device group

    WhatIf Mode:
    - Preview operations without making changes
    - Does not connect to Microsoft Graph
    - Shows what would be created
    - Only available in Setup mode

    Validate Mode:
    - Uses read-only Graph scopes
    - Verifies all 8 Service Principals exist
    - Checks device group configuration
    - Validates Windows Cloud Login service principal configuration
    - Confirms policy exists and is assigned
#>

[CmdletBinding(SupportsShouldProcess = $true)]
param(
    # Mode: 'Setup' to run onboarding, 'Validate' to check existing setup
    [Parameter()][ValidateSet('Setup', 'Validate')][string]$Mode = 'Setup'
)

$DeviceGroupName = "Opal App Device Group"
$DeviceGroupRule = "Windows 365 Opal Device Pool"
$DeviceGroupDescription = "Device group for Opal Machines. This group has been configured by the Opal app. Any changes made to this group may cause the Opal app to not function as expected or break entirely."
$PolicyJsonURL ="https://res.cdn.office.net/s01-alps/prod/5mttl/devicePolicy.json"
$GraphScopes     = @(
    "Application.ReadWrite.All",
    "DeviceManagementConfiguration.ReadWrite.All",
    "Group.ReadWrite.All"
)

# App IDs for SP creation (idempotent ensure)
$AppIdsToEnsure = @(
    "03b184b5-8cb6-45d1-bef1-10db52790f06",  # Opal | Opal Primary App
    "90c719d1-2849-4e57-a1d1-0c9edb406be2",  # OpalNative | On Box Agent
    "0af06dc6-e4b5-4f28-818e-e78e62d137a5",  # CloudPC-MX | Windows 365
    "9cdead84-a844-4324-93f2-b2e6bb768d07",  # WVD | Azure Virtual Desktop
    "a85cf173-4192-42f8-81fa-777a763e6e2c",  # WindowsVirtualDesktopClient | Azure Virtual Desktop Client
    "50e95039-b200-4007-bc97-8d5790743a63",  # WVD-ARM | Azure Virtual Desktop ARM Provider
    "270efc09-cd0d-444b-a71f-39af4910ec45",  # WindowsCloudLogin | Windows Cloud Login
    "351add99-7ff7-4e1f-870f-f98b509209c2"   # CloudDevicePlatform | CloudDevicePlatform (Prod)
)

function Write-Info($msg) { Write-Host "[INFO]  $msg" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "[OK]    $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "[WARN]  $msg" -ForegroundColor Yellow }
function Write-Err($msg)  { Write-Host "[ERROR] $msg" -ForegroundColor Red }

function Write-ErrorDetails {
    <#
      Consolidated error message output with optional details
    #>
    param(
        [Parameter(Mandatory)][string]$Message,
        [Parameter()][System.Management.Automation.ErrorRecord]$ErrorRecord
    )
    
    Write-Err $Message
    if ($ErrorRecord) {
        if ($ErrorRecord.Exception -and $ErrorRecord.Exception.Message) {
            Write-Err $ErrorRecord.Exception.Message
        }
        if ($ErrorRecord.ErrorDetails -and $ErrorRecord.ErrorDetails.Message) {
            Write-Err ("Details: " + $ErrorRecord.ErrorDetails.Message)
        }
        # Also log the full error if there's additional context
        if ($ErrorRecord.FullyQualifiedErrorId) {
            Write-Host ("Error ID: {0}" -f $ErrorRecord.FullyQualifiedErrorId) -ForegroundColor DarkRed
        }
    } else {
        Write-Err "No error details available"
    }
}

function Invoke-WithErrorHandling {
    <#
      Wraps operation with standard error handling pattern
    #>
    param(
        [Parameter(Mandatory)][string]$OperationName,
        [Parameter(Mandatory)][scriptblock]$ScriptBlock
    )
    
    try {
        & $ScriptBlock
    }
    catch {
        Write-Err "$OperationName failed."
        Write-Err $_.Exception.Message
        if ($_.ScriptStackTrace) { 
            Write-Warn ("Stack: " + $_.ScriptStackTrace) 
        }
        throw
    }
}

function Ensure-Module {
    param(
        [Parameter(Mandatory)][string]$Name,
        [Parameter()][string]$MinVersion = "2.0.0"
    )
    
    Write-Host ("  Checking module: {0}..." -f $Name) -ForegroundColor Gray -NoNewline
    
    # Check if already imported first
    if (Get-Module -Name $Name) {
        Write-Host " LOADED" -ForegroundColor Green
        return
    }
    
    # Try to import (will install if missing)
    try {
        Import-Module -Name $Name -MinimumVersion $MinVersion -ErrorAction Stop
        Write-Host " IMPORTED" -ForegroundColor Green
    }
    catch {
        # Module not found - install it
        Write-Host " NOT FOUND" -ForegroundColor Yellow
        Write-Info ("  Installing module {0} (this may take a moment)..." -f $Name)
        
        Install-Module -Name $Name -Scope CurrentUser -Force -AllowClobber
        Import-Module -Name $Name -MinimumVersion $MinVersion
        Write-Ok ("  Successfully installed {0}" -f $Name)
    }
}

function Initialize-GraphModules {
    <#
      Ensures all required Microsoft Graph modules are installed and loaded.
      Shows step-by-step progress.
    #>
    [CmdletBinding()]
    param()

    Write-Host "`n[INFO] Preparing Microsoft Graph modules..." -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Gray
    
    $modules = @(
        @{ Name = "Microsoft.Graph.Authentication"; Description = "Authentication Module" }
        @{ Name = "Microsoft.Graph.Beta.Applications"; Description = "Applications Module" }
        @{ Name = "Microsoft.Graph.Beta.DeviceManagement"; Description = "Device Management Module" }
        @{ Name = "Microsoft.Graph.Beta.Groups"; Description = "Groups Module" }
    )
    
    $stepNum = 1
    $totalSteps = $modules.Count
    
    foreach ($module in $modules) {
        Write-Host "`nStep $stepNum/$totalSteps`: $($module.Description)" -ForegroundColor Cyan
        Ensure-Module -Name $module.Name
        $stepNum++
    }
    
    Write-Host "`n========================================" -ForegroundColor Gray
    Write-Ok "All modules ready!`n"
}

function Get-GraphResultWithPagination {
    <#
      Helper function to fetch Graph API results with pagination support.
      Optionally stops early if a matching item is found.
    #>
    param(
        [Parameter(Mandatory)][string]$Uri,
        [Parameter()][scriptblock]$StopCondition
    )
    
    $result = Invoke-MgGraphRequest -Method GET -Uri $Uri
    $allItems = @()
    
    do {
        $allItems += $result.value
        
        # Check stop condition on each page
        if ($StopCondition) {
            $foundItem = $result.value | Where-Object $StopCondition | Select-Object -First 1
            if ($foundItem) {
                return $foundItem
            }
        }
        
        # Get next page if available
        if ($result.'@odata.nextLink') {
            $result = Invoke-MgGraphRequest -Method GET -Uri $result.'@odata.nextLink'
        }
    } while ($result.'@odata.nextLink')
    
    # Return first item if no stop condition, or all items if nothing found
    if ($allItems.Count -gt 0) {
        return $allItems[0]
    }
    return $null
}

function Connect-ToMicrosoftGraph {
    [CmdletBinding()]
    param(
        [Parameter()][string[]]$Scopes
    )
    # Disconnect any existing session to ensure clean authentication
    try {
        Disconnect-MgGraph -ErrorAction SilentlyContinue
    }
    catch {
        # Ignore errors if not connected
    }
    
    Write-Info "Connecting to Microsoft Graph..."
    Connect-MgGraph -Scopes $Scopes
    $ctx = Get-MgContext
    Write-Ok ("Connected. Tenant: {0}, App: {1}, Scopes: {2}" -f $ctx.TenantId, $ctx.ClientId, ($ctx.Scopes -join ", "))
    
    # Verify that all required scopes are present
    $missingScopes = @()
    foreach ($requiredScope in $Scopes) {
        if ($ctx.Scopes -notcontains $requiredScope) {
            $missingScopes += $requiredScope
        }
    }
    
    if ($missingScopes.Count -gt 0) {
        Write-Err ("Missing required scopes: {0}" -f ($missingScopes -join ", "))
        Write-Err "Please re-authenticate with the required permissions."
        throw "Insufficient permissions: Missing scopes: $($missingScopes -join ', ')"
    }
    
    Write-Ok "All required scopes verified."
}

function Ensure-ServicePrincipals {
    <#
      Idempotently ensure Service Principals exist for a set of appIds.
      Creates only those that do not already exist in the tenant.
    #>
    [CmdletBinding(SupportsShouldProcess=$true)]
    param(
        [Parameter(Mandatory)][string[]]$AppIds
    )

    Write-Info ("Ensuring Service Principals exist for {0} appId(s)..." -f $AppIds.Count)

    foreach ($appId in $AppIds) {
        try {
            # Check existing (always perform read operations, even in WhatIf)
            $existing = $null
            if (-not $WhatIfPreference) {
                try {
                    $existing = Get-MgBetaServicePrincipal -Filter "appId eq '$appId'" -ConsistencyLevel eventual -CountVariable _
                }
                catch {
                    Write-ErrorDetails -Message ("Failed to query existing SP for appId {0}" -f $appId) -ErrorRecord $_
                    throw
                }
            }
            
            if ($existing) {
                Write-Ok ("SP already exists for appId {0} (objectId: {1})" -f $appId, $existing.Id)
                continue
            }

            if ($PSCmdlet.ShouldProcess(("appId {0}" -f $appId), "Create Service Principal")) {
                try {
                    $sp = New-MgBetaServicePrincipal -BodyParameter @{ appId = $appId }
                    Write-Ok ("Created Service Principal for appId {0} (objectId: {1})" -f $appId, $sp.Id)
                }
                catch {
                    Write-ErrorDetails -Message ("Failed to create SP for appId {0}" -f $appId) -ErrorRecord $_
                    throw
                }
            }
        }
        catch {
            # Always log full error details for outer catch
            Write-ErrorDetails -Message ("Service Principal operation failed for appId {0}" -f $appId) -ErrorRecord $_
            throw
        }
    }
}

function Ensure-DynamicDeviceGroup {
    <#
      Idempotently create (or reuse) a dynamic device group that matches enrollmentProfileName == $DeviceGroupName
      Returns the MgGroup object.
    #>
    [CmdletBinding(SupportsShouldProcess=$true)]
    param()

    $membershipRule = "(device.enrollmentProfileName -eq `"$DeviceGroupRule`")"

    Write-Info ("Ensuring dynamic device group '{0}' exists..." -f $DeviceGroupName)
    try {
        # Check existing (always perform read operations, even in WhatIf)
        $existing = $null
        if (-not $WhatIfPreference) {
            $existing = Get-MgBetaGroup -Filter "displayName eq '$DeviceGroupName'" -ConsistencyLevel eventual -CountVariable _
        }
        
        if ($existing) {
            Write-Ok ("Group already exists: {0} (id: {1})" -f $DeviceGroupName, $existing.Id)
            return $existing
        }

        if ($PSCmdlet.ShouldProcess($DeviceGroupName, "Create Dynamic Device Group")) {
            $group = New-MgBetaGroup `
                -DisplayName $DeviceGroupName `
                -Description $DeviceGroupDescription `
                -MailEnabled:$false `
                -MailNickName ("grp_" + ([System.Guid]::NewGuid().ToString("N").Substring(0,8))) `
                -MembershipRule $membershipRule `
                -MembershipRuleProcessingState 'On' `
                -GroupTypes @("DynamicMembership") `
                -SecurityEnabled

            Write-Ok ("Created dynamic device group (id: {0})" -f $group.Id)
            return $group
        }
        
        # Return null in WhatIf mode if group doesn't exist
        return $null
    }
    catch {
        Write-ErrorDetails -Message ("Error while ensuring dynamic group '{0}'" -f $DeviceGroupName) -ErrorRecord $_
        throw
    }
}

function Configure-WindowsCloudLoginSP {
    <#
      Configures the Windows Cloud Login service principal for remote desktop access.
      - Gets the service principal ID for Windows Cloud Login (270efc09-cd0d-444b-a71f-39af4910ec45)
      - Enables remote desktop protocol if not already enabled
      - Adds the device group to target device groups
      Returns the service principal object if successful.
    #>
    [CmdletBinding(SupportsShouldProcess=$true)]
    param(
        [Parameter(Mandatory)][string]$DeviceGroupId,
        [Parameter(Mandatory)][string]$DeviceGroupName
    )

    $windowsCloudLoginAppId = "270efc09-cd0d-444b-a71f-39af4910ec45"
    
    Write-Info ("Configuring Windows Cloud Login service principal for device group '{0}'..." -f $DeviceGroupName)
    
    try {
        # Get the service principal ID for Windows Cloud Login
        Write-Info ("Getting service principal for Windows Cloud Login (AppId: {0})..." -f $windowsCloudLoginAppId)
        
        if (-not $WhatIfPreference) {
            $servicePrincipal = Invoke-MgGraphRequest -Method GET `
                -Uri "https://graph.microsoft.com/v1.0/servicePrincipals?`$filter=AppId eq '$windowsCloudLoginAppId'"
            
            if (-not $servicePrincipal.value -or $servicePrincipal.value.Count -eq 0) {
                Write-Err ("Service principal for Windows Cloud Login not found. AppId: {0}" -f $windowsCloudLoginAppId)
                throw "Windows Cloud Login service principal not found"
            }
            
            $spId = $servicePrincipal.value[0].id
            Write-Ok ("Found Windows Cloud Login service principal (ID: {0})" -f $spId)
            
            # Get the remote desktop security configuration
            Write-Info "Getting remote desktop security configuration..."
            
            try {
                $rdpConfig = Invoke-MgGraphRequest -Method GET `
                    -Uri "https://graph.microsoft.com/v1.0/servicePrincipals/$spId/remoteDesktopSecurityConfiguration"
                
                Write-Info ("Current RDP enabled status: {0}" -f $rdpConfig.isRemoteDesktopProtocolEnabled)
                
                # Enable RDP if it's not already enabled
                if (-not $rdpConfig.isRemoteDesktopProtocolEnabled) {
                    if ($PSCmdlet.ShouldProcess("Windows Cloud Login SP", "Enable Remote Desktop Protocol")) {
                        Write-Info "Enabling remote desktop protocol..."
                        
                        $patchBody = @{
                            isRemoteDesktopProtocolEnabled = $true
                        } | ConvertTo-Json
                        
                        Invoke-MgGraphRequest -Method PATCH `
                            -Uri "https://graph.microsoft.com/v1.0/servicePrincipals/$spId/remoteDesktopSecurityConfiguration" `
                            -ContentType "application/json" `
                            -Body $patchBody
                        
                        Write-Ok "Remote desktop protocol enabled successfully"
                    }
                } else {
                    Write-Ok "Remote desktop protocol is already enabled"
                }
                
                # Add the device group to target device groups
                if ($PSCmdlet.ShouldProcess("Windows Cloud Login SP", "Add device group to Windows Cloud Login targetted device groups")) {
                    Write-Info ("Adding device group '{0}' to target device groups..." -f $DeviceGroupName)
                    
                    # Check if group is already added (optional - we could just add it idempotently)
                    try {
                        $existingGroups = Invoke-MgGraphRequest -Method GET `
                            -Uri "https://graph.microsoft.com/v1.0/servicePrincipals/$spId/remoteDesktopSecurityConfiguration/targetDeviceGroups"
                        
                        $alreadyExists = $false
                        if ($existingGroups.value) {
                            foreach ($group in $existingGroups.value) {
                                if ($group.id -eq $DeviceGroupId) {
                                    $alreadyExists = $true
                                    Write-Ok ("Device group '{0}' is already in target device groups" -f $DeviceGroupName)
                                    break
                                }
                            }
                        }
                        
                        if (-not $alreadyExists) {
                            $deviceGroupBody = @{
                                '@odata.type' = '#microsoft.graph.targetDeviceGroup'
                                id = $DeviceGroupId
                                displayName = $DeviceGroupName
                            } | ConvertTo-Json
                            
                            Invoke-MgGraphRequest -Method POST `
                                -Uri "https://graph.microsoft.com/v1.0/servicePrincipals/$spId/remoteDesktopSecurityConfiguration/targetDeviceGroups" `
                                -ContentType "application/json" `
                                -Body $deviceGroupBody
                            
                            Write-Ok ("Successfully added device group '{0}' to Windows Cloud Login target device groups" -f $DeviceGroupName)
                        }
                    }
                    catch {
                        Write-ErrorDetails -Message "Failed to add device group to target device groups" -ErrorRecord $_
                        throw
                    }
                }
                
                return $servicePrincipal.value[0]
                
            }
            catch {
                Write-ErrorDetails -Message "Failed to configure remote desktop security configuration" -ErrorRecord $_
                throw
            }
        } else {
            Write-Host ("What if: Would configure Windows Cloud Login SP for device group '{0}'" -f $DeviceGroupName) -ForegroundColor Cyan
            return $null
        }
    }
    catch {
        Write-ErrorDetails -Message "Error configuring Windows Cloud Login service principal" -ErrorRecord $_
        throw
    }
}

function New-PolicyFromJson {
    <#
      Creates a device policy via raw REST using Invoke-MgGraphRequest.
      Expects the JSON to match the beta /deviceManagement/configurationPolicies schema exactly.
      Returns the created policy object (as PSCustomObject).
      If a policy with the same name already exists, returns the existing policy instead.
    #>
    [CmdletBinding(SupportsShouldProcess=$true)]
    param()

    Write-Info ("Downloading policy JSON from '{0}'..." -f $PolicyJsonURL)
    
    try {
        $jsonRaw = Invoke-RestMethod -Uri $PolicyJsonURL -Method Get -ErrorAction Stop
        # Convert to string if it's an object
        if ($jsonRaw -is [PSCustomObject] -or $jsonRaw -is [hashtable]) {
            $jsonRaw = $jsonRaw | ConvertTo-Json -Depth 100
        }
    }
    catch {
        Write-ErrorDetails -Message ("Failed to download policy JSON from URL: {0}" -f $PolicyJsonURL) -ErrorRecord $_
        throw
    }
    
    if (-not $jsonRaw -or -not $jsonRaw.ToString().Trim()) {
        throw ("Policy JSON downloaded from URL is empty: {0}" -f $PolicyJsonURL)
    }

    # Optional: lightweight validation just to help catch obvious shape issues early.
    try {
        $jsonObj = $jsonRaw | ConvertFrom-Json
        foreach ($required in @("name","description","platforms","technologies","settings")) {
            if (-not $jsonObj.PSObject.Properties.Name -contains $required) {
                Write-Warn ("JSON missing top-level '{0}'. Ensure it matches the Settings Catalog policy schema." -f $required)
            }
        }
    } catch {
        throw ("Invalid JSON: {0}" -f $_.Exception.Message)
    }

    # Check if a policy with this name already exists
    $policyName = $jsonObj.name
    Write-Info ("Checking if policy '{0}' already exists..." -f $policyName)
    
    # Check existing (skip Graph API calls in WhatIf mode)
    if (-not $WhatIfPreference) {
        try {
            $uri = "https://graph.microsoft.com/beta/deviceManagement/configurationPolicies?`$filter=name eq '$policyName'"
            $existing = Get-GraphResultWithPagination -Uri $uri -StopCondition { $_.name -eq $policyName }
            
            if ($existing) {
                Write-Ok ("Policy already exists: id: {0}, name: {1}" -f $existing.id, $existing.name)
                return $existing
            }
        }
        catch {
            Write-Warn ("Could not check for existing policy: {0}" -f $_.Exception.Message)
            # Continue to create if check fails
        }
    }

    if ($PSCmdlet.ShouldProcess(("Configuration Policy: {0}" -f $policyName), "Create via REST (Invoke-MgGraphRequest)")) {
        try {
            $resp = Invoke-MgGraphRequest -Method POST `
                -Uri "https://graph.microsoft.com/beta/deviceManagement/configurationPolicies" `
                -ContentType "application/json" `
                -Body $jsonRaw

            if ($resp -and $resp.id) {
                Write-Ok ("Created device configuration policy, id: {0}, name: {1}" -f $resp.id, $resp.name)
            } else {
                Write-Warn "Policy created but response did not include an 'id'."
            }
            return $resp
        }
        catch {
            Write-ErrorDetails -Message "Create policy (REST) failed" -ErrorRecord $_
            throw
        }
    }
    
    # Return null in WhatIf mode
    return $null
}

function Assign-PolicyToGroup {
    <#
      Assigns a configuration policy to a group.
    #>
    [CmdletBinding(SupportsShouldProcess=$true)]
    param(
        [Parameter(Mandatory)][string]$PolicyId,
        [Parameter(Mandatory)][string]$GroupId
    )

    $body = @{
        assignments = @(
            @{
                target = @{
                    '@odata.type' = '#microsoft.graph.groupAssignmentTarget'
                    groupId       = $GroupId
                }
            }
        )
    }

    if ($PSCmdlet.ShouldProcess(("Policy {0}" -f $PolicyId), ("Assign to group {0}" -f $GroupId))) {
        try {
            Invoke-MgGraphRequest -Method POST `
                -Uri ("https://graph.microsoft.com/beta/deviceManagement/configurationPolicies/{0}/assign" -f $PolicyId) `
                -ContentType "application/json" `
                -Body ($body | ConvertTo-Json -Depth 10)

            Write-Ok "Policy assignment completed."
        }
        catch {
            Write-ErrorDetails -Message "Assignment failed" -ErrorRecord $_
            throw
        }
    }
}

function Write-ResourceSummary {
    <#
      Displays a consistent summary of Device Group, Policy, and Assignment
    #>
    param(
        [Parameter(Mandatory)][object]$DeviceGroup,
        [Parameter(Mandatory)][object]$Policy,
        [Parameter()][int]$ServicePrincipalCount = 0
    )

    Write-Host "`n1. Device Group:" -ForegroundColor Yellow
    Write-Host ("     Name: {0}" -f $DeviceGroup.DisplayName) -ForegroundColor White
    Write-Host ("     Group ID: {0}" -f $DeviceGroup.Id) -ForegroundColor Gray
    Write-Host ("     Description: {0}" -f $DeviceGroup.Description) -ForegroundColor Gray
    Write-Host ("     Group Types: {0}" -f ($DeviceGroup.GroupTypes -join ", ")) -ForegroundColor Gray
    Write-Host ("     Membership Rule: {0}" -f $DeviceGroup.MembershipRule) -ForegroundColor Gray
    Write-Host ("     Membership Processing State: {0}`n" -f $DeviceGroup.MembershipRuleProcessingState) -ForegroundColor Gray

    Write-Host "2. Configuration Policy:" -ForegroundColor Yellow
    Write-Host ("     Name: {0}" -f $Policy.name) -ForegroundColor White
    Write-Host ("     Policy ID: {0}" -f $Policy.id) -ForegroundColor Gray
    Write-Host ("     Description: {0}" -f $Policy.description) -ForegroundColor Gray
    Write-Host ("     Platforms: {0}" -f $Policy.platforms) -ForegroundColor Gray
    Write-Host ("     Technologies: {0}" -f $Policy.technologies) -ForegroundColor Gray
    Write-Host ("     Settings Count: {0}`n" -f $Policy.settingCount) -ForegroundColor Gray

    Write-Host "3. Policy Assignment:" -ForegroundColor Yellow
    Write-Host ("     Status: Assigned") -ForegroundColor White
    Write-Host ("     Policy '{0}' -> Group '{1}'`n" -f $Policy.name, $DeviceGroup.DisplayName) -ForegroundColor Gray

    if ($ServicePrincipalCount -gt 0) {
        Write-Host "4. Service Principals:" -ForegroundColor Yellow
        Write-Host ("     {0} Service Principals ensured`n" -f $ServicePrincipalCount) -ForegroundColor White
    }
}

function Validate-Setup {
    <#
      Validates that the onboarding setup has been completed correctly.
      Checks for Service Principals, Device Group, and Policy.
      Returns a summary report.
    #>
    [CmdletBinding()]
    param()

    Write-Host "`n========================================" -ForegroundColor Magenta
    Write-Host "  VALIDATION REPORT" -ForegroundColor Magenta
    Write-Host "========================================`n" -ForegroundColor Magenta

    $validationResults = @{
        ServicePrincipals = @()
        DeviceGroup = $null
        Policy = $null
        PolicyAssignment = $null
        WindowsCloudLogin = $null
        AllChecksPass = $true
    }

    # 1. Check Service Principals
    Write-Host "1. Checking Service Principals..." -ForegroundColor Cyan
    Write-Host ("   Expected {0} Service Principals`n" -f $AppIdsToEnsure.Count) -ForegroundColor Gray
    
    foreach ($appId in $AppIdsToEnsure) {
        try {
            $sp = Get-MgBetaServicePrincipal -Filter "appId eq '$appId'" -ConsistencyLevel eventual -CountVariable _
            if ($sp) {
                Write-Ok ("   [OK] SP exists for appId: {0}" -f $appId)
                Write-Host ("     Object ID: {0}" -f $sp.Id) -ForegroundColor Gray
                Write-Host ("     Display Name: {0}`n" -f $sp.DisplayName) -ForegroundColor Gray
                $validationResults.ServicePrincipals += @{
                    AppId = $appId
                    ObjectId = $sp.Id
                    DisplayName = $sp.DisplayName
                    Status = "Found"
                }
            } else {
                Write-Err ("   [X] SP NOT FOUND for appId: {0}`n" -f $appId)
                $validationResults.ServicePrincipals += @{
                    AppId = $appId
                    Status = "Missing"
                }
                $validationResults.AllChecksPass = $false
            }
        }
        catch {
            Write-ErrorDetails -Message ("Error checking SP for appId {0}" -f $appId) -ErrorRecord $_
            $validationResults.AllChecksPass = $false
        }
    }

    # 2. Check Device Group
    Write-Host "`n2. Checking Device Group..." -ForegroundColor Cyan
    Write-Host ("   Expected Group Name: {0}`n" -f $DeviceGroupName) -ForegroundColor Gray
    
    try {
        $group = Get-MgBetaGroup -Filter "displayName eq '$DeviceGroupName'" -ConsistencyLevel eventual -CountVariable _
        if ($group) {
            Write-Ok ("   [OK] Device Group exists: {0}" -f $DeviceGroupName)
            $validationResults.DeviceGroup = @{
                Id = $group.Id
                DisplayName = $group.DisplayName
                Description = $group.Description
                MembershipRule = $group.MembershipRule
                GroupTypes = $group.GroupTypes
                MembershipRuleProcessingState = $group.MembershipRuleProcessingState
                Status = "Found"
            }
        } else {
            Write-Err ("   [X] Device Group NOT FOUND: {0}`n" -f $DeviceGroupName)
            $validationResults.AllChecksPass = $false
        }
    }
    catch {
        Write-ErrorDetails -Message "Error checking device group" -ErrorRecord $_
        $validationResults.AllChecksPass = $false
    }

    # 3. Check Policy
    Write-Host "`n3. Checking Configuration Policy..." -ForegroundColor Cyan
    
    try {
        # Load policy name from URL
        Write-Host ("   Downloading policy definition from: {0}`n" -f $PolicyJsonURL) -ForegroundColor Gray
        
        try {
            $jsonRaw = Invoke-RestMethod -Uri $PolicyJsonURL -Method Get
            # Convert to string if it's an object
            if ($jsonRaw -is [PSCustomObject] -or $jsonRaw -is [hashtable]) {
                $jsonRaw = $jsonRaw | ConvertTo-Json -Depth 100
            }
            $jsonObj = $jsonRaw | ConvertFrom-Json
            $policyName = $jsonObj.name
            
            Write-Host ("   Expected Policy Name: {0}`n" -f $policyName) -ForegroundColor Gray
            
            $uri = "https://graph.microsoft.com/beta/deviceManagement/configurationPolicies?`$filter=name eq '$policyName'"
            $policy = Get-GraphResultWithPagination -Uri $uri -StopCondition { $_.name -eq $policyName }
            
            if ($policy) {
                Write-Ok ("   [OK] Configuration Policy exists: {0}" -f $policy.name)
                
                $validationResults.Policy = @{
                    id = $policy.id
                    name = $policy.name
                    description = $policy.description
                    platforms = $policy.platforms
                    technologies = $policy.technologies
                    settingCount = $policy.settingCount
                    Status = "Found"
                }

                # 4. Check Policy Assignment
                if ($group -and $policy) {
                    Write-Host "`n4. Checking Policy Assignment..." -ForegroundColor Cyan
                    
                    try {
                        $assignments = Invoke-MgGraphRequest -Method GET `
                            -Uri ("https://graph.microsoft.com/beta/deviceManagement/configurationPolicies/{0}/assignments" -f $policy.id)
                        
                        $assignedToGroup = $false
                        if ($assignments.value) {
                            foreach ($assignment in $assignments.value) {
                                if ($assignment.target.groupId -eq $group.Id) {
                                    $assignedToGroup = $true
                                    Write-Ok ("   [OK] Policy is assigned to group: {0}" -f $DeviceGroupName)
                                    break
                                }
                            }
                        }
                        
                        if (-not $assignedToGroup) {
                            Write-Err ("   [X] Policy is NOT assigned to group: {0}`n" -f $DeviceGroupName)
                            $validationResults.AllChecksPass = $false
                        }
                        
                        $validationResults.PolicyAssignment = @{
                            IsAssigned = $assignedToGroup
                            Status = if ($assignedToGroup) { "Found" } else { "Missing" }
                        }
                    }
                    catch {
                        Write-ErrorDetails -Message "Error checking policy assignment" -ErrorRecord $_
                        $validationResults.AllChecksPass = $false
                    }
                }
            } else {
                Write-Err ("   [X] Configuration Policy NOT FOUND: {0}`n" -f $policyName)
                $validationResults.AllChecksPass = $false
            }
        }
        catch {
            Write-ErrorDetails -Message "Failed to download policy JSON from URL" -ErrorRecord $_
            $validationResults.AllChecksPass = $false
        }
    }
    catch {
        Write-ErrorDetails -Message "Error checking policy" -ErrorRecord $_
        $validationResults.AllChecksPass = $false
    }
    
    # 5. Check Windows Cloud Login Configuration
    Write-Host "`n5. Checking Windows Cloud Login Configuration..." -ForegroundColor Cyan
    
    $windowsCloudLoginAppId = "270efc09-cd0d-444b-a71f-39af4910ec45"
    $validationResults.WindowsCloudLogin = @{
        ServicePrincipal = $null
        RdpEnabled = $false
        DeviceGroupAssigned = $false
        Status = "NotConfigured"
    }
    
    try {
        # Get Windows Cloud Login service principal
        $windowsCloudLoginSP = Invoke-MgGraphRequest -Method GET `
            -Uri "https://graph.microsoft.com/v1.0/servicePrincipals?`$filter=AppId eq '$windowsCloudLoginAppId'"
        
        if ($windowsCloudLoginSP.value -and $windowsCloudLoginSP.value.Count -gt 0) {
            $spId = $windowsCloudLoginSP.value[0].id
            Write-Ok ("   [OK] Windows Cloud Login SP found (ID: {0})" -f $spId)
            
            $validationResults.WindowsCloudLogin.ServicePrincipal = @{
                Id = $spId
                DisplayName = $windowsCloudLoginSP.value[0].displayName
            }
            
            # Check RDP configuration
            try {
                $rdpConfig = Invoke-MgGraphRequest -Method GET `
                    -Uri "https://graph.microsoft.com/v1.0/servicePrincipals/$spId/remoteDesktopSecurityConfiguration"
                
                if ($rdpConfig.isRemoteDesktopProtocolEnabled) {
                    Write-Ok ("   [OK] Remote Desktop Protocol is enabled")
                    $validationResults.WindowsCloudLogin.RdpEnabled = $true
                } else {
                    Write-Err ("   [X] Remote Desktop Protocol is NOT enabled")
                    $validationResults.AllChecksPass = $false
                }
                
                # Check if device group is in target device groups
                if ($group) {
                    try {
                        $targetGroups = Invoke-MgGraphRequest -Method GET `
                            -Uri "https://graph.microsoft.com/v1.0/servicePrincipals/$spId/remoteDesktopSecurityConfiguration/targetDeviceGroups"
                        
                        $groupFound = $false
                        if ($targetGroups.value) {
                            foreach ($targetGroup in $targetGroups.value) {
                                if ($targetGroup.id -eq $group.Id) {
                                    $groupFound = $true
                                    Write-Ok ("   [OK] Device group '{0}' is assigned to Windows Cloud Login" -f $DeviceGroupName)
                                    break
                                }
                            }
                        }
                        
                        if ($groupFound) {
                            $validationResults.WindowsCloudLogin.DeviceGroupAssigned = $true
                            $validationResults.WindowsCloudLogin.Status = "Configured"
                        } else {
                            Write-Err ("   [X] Device group '{0}' is NOT assigned to Windows Cloud Login" -f $DeviceGroupName)
                            $validationResults.AllChecksPass = $false
                        }
                    }
                    catch {
                        Write-ErrorDetails -Message "Error checking target device groups" -ErrorRecord $_
                        $validationResults.AllChecksPass = $false
                    }
                } else {
                    Write-Warn ("   [SKIP] Cannot check device group assignment - device group not found")
                }
            }
            catch {
                Write-ErrorDetails -Message "Error checking RDP configuration" -ErrorRecord $_
                $validationResults.AllChecksPass = $false
            }
        } else {
            Write-Err ("   [X] Windows Cloud Login service principal NOT FOUND (AppId: {0})" -f $windowsCloudLoginAppId)
            $validationResults.AllChecksPass = $false
        }
    }
    catch {
        Write-ErrorDetails -Message "Error checking Windows Cloud Login" -ErrorRecord $_
        $validationResults.AllChecksPass = $false
    }

    # Display summary if all resources were found
    if ($validationResults.DeviceGroup -and $validationResults.Policy -and $validationResults.PolicyAssignment.IsAssigned) {
        Write-Host "`nResource Details:`n" -ForegroundColor Cyan
        Write-ResourceSummary -DeviceGroup $validationResults.DeviceGroup -Policy $validationResults.Policy -ServicePrincipalCount $AppIdsToEnsure.Count
    }

    # Summary
    Write-Host "`n========================================" -ForegroundColor Magenta
    if ($validationResults.AllChecksPass) {
        Write-Host "  [OK] ALL CHECKS PASSED" -ForegroundColor Green
    } else {
        Write-Host "  [X] SOME CHECKS FAILED" -ForegroundColor Red
    }
    Write-Host "========================================`n" -ForegroundColor Magenta

    return $validationResults
}

function Onboard {
    [CmdletBinding(SupportsShouldProcess=$true)]
    param()

    Invoke-WithErrorHandling -OperationName "Onboarding" -ScriptBlock {
        Initialize-GraphModules
        
        # Connect to Graph (skip in WhatIf mode)
        if (-not $WhatIfPreference) {
            Connect-ToMicrosoftGraph -Scopes $GraphScopes
        } else {
            Write-Host "What if: Connecting to Microsoft Graph with scopes: $($GraphScopes -join ', ')" -ForegroundColor Cyan
        }

        Ensure-ServicePrincipals -AppIds $AppIdsToEnsure -WhatIf:$WhatIfPreference -Confirm:$ConfirmPreference
        $deviceGroup = Ensure-DynamicDeviceGroup -WhatIf:$WhatIfPreference -Confirm:$ConfirmPreference
        
        # Configure Windows Cloud Login service principal after device group is created
        if ($deviceGroup) {
            Configure-WindowsCloudLoginSP -DeviceGroupId $deviceGroup.Id -DeviceGroupName $deviceGroup.DisplayName -WhatIf:$WhatIfPreference -Confirm:$ConfirmPreference
        }
        
        $policy = New-PolicyFromJson -WhatIf:$WhatIfPreference -Confirm:$ConfirmPreference
        
        if ($policy -and $deviceGroup) {
            Assign-PolicyToGroup -PolicyId $policy.Id -GroupId $deviceGroup.Id -WhatIf:$WhatIfPreference -Confirm:$ConfirmPreference
        }

        # Display summary of created resources (skip in WhatIf mode)
        if (-not $WhatIfPreference) {
            Write-Host "`n========================================" -ForegroundColor Green
            Write-Host "  SETUP COMPLETED SUCCESSFULLY" -ForegroundColor Green
            Write-Host "========================================`n" -ForegroundColor Green

            Write-Host "Created/Verified Resources:`n" -ForegroundColor Cyan
            
            if ($deviceGroup -and $policy) {
                Write-ResourceSummary -DeviceGroup $deviceGroup -Policy $policy -ServicePrincipalCount $AppIdsToEnsure.Count
            }

            Write-Host "========================================`n" -ForegroundColor Green
            Write-Ok "Onboarding flow completed."
        } else {
            Write-Host "`n========================================" -ForegroundColor Cyan
            Write-Host "  WHATIF: No changes were made" -ForegroundColor Cyan
            Write-Host "========================================`n" -ForegroundColor Cyan
        }
    }
}

function Run-Validation {
    [CmdletBinding()]
    param()

    Invoke-WithErrorHandling -OperationName "Validation" -ScriptBlock {
        Initialize-GraphModules
        
        # Use read-only scopes for validation (principle of least privilege)
        $readScopes = @(
            "Application.Read.All",
            "DeviceManagementConfiguration.Read.All",
            "Group.Read.All"
        )
        Connect-ToMicrosoftGraph -Scopes $readScopes

        $results = Validate-Setup
        
        if ($results.AllChecksPass) {
            Write-Ok "Validation completed successfully - all resources found."
            exit 0
        } else {
            Write-Warn "Validation completed with issues - some resources are missing."
            exit 1
        }
    }
}
function Write-ModeHeader {
    param([string]$ModeName)
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  RUNNING $ModeName MODE" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
}

switch ($Mode) {
    'Setup' {
        Write-ModeHeader -ModeName "SETUP"
        Onboard
    }
    'Validate' {
        # Validate mode is read-only, WhatIf doesn't apply
        if ($WhatIfPreference) {
            Write-Warn "WhatIf parameter is not applicable in Validate mode (read-only operations only)."
            return
        }
        
        Write-ModeHeader -ModeName "VALIDATION"
        Run-Validation
    }
}

# SIG # Begin signature block
# MIIoVQYJKoZIhvcNAQcCoIIoRjCCKEICAQExDzANBglghkgBZQMEAgEFADB5Bgor
# BgEEAYI3AgEEoGswaTA0BgorBgEEAYI3AgEeMCYCAwEAAAQQH8w7YFlLCE63JNLG
# KX7zUQIBAAIBAAIBAAIBAAIBADAxMA0GCWCGSAFlAwQCAQUABCAtUD/O36xSF9sF
# V0TD2JeRBoxqHnMKEq/1/v6bV1rjiqCCDYUwggYDMIID66ADAgECAhMzAAAEhJji
# EuB4ozFdAAAAAASEMA0GCSqGSIb3DQEBCwUAMH4xCzAJBgNVBAYTAlVTMRMwEQYD
# VQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNy
# b3NvZnQgQ29ycG9yYXRpb24xKDAmBgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25p
# bmcgUENBIDIwMTEwHhcNMjUwNjE5MTgyMTM1WhcNMjYwNjE3MTgyMTM1WjB0MQsw
# CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
# ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMR4wHAYDVQQDExVNaWNy
# b3NvZnQgQ29ycG9yYXRpb24wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIB
# AQDtekqMKDnzfsyc1T1QpHfFtr+rkir8ldzLPKmMXbRDouVXAsvBfd6E82tPj4Yz
# aSluGDQoX3NpMKooKeVFjjNRq37yyT/h1QTLMB8dpmsZ/70UM+U/sYxvt1PWWxLj
# MNIXqzB8PjG6i7H2YFgk4YOhfGSekvnzW13dLAtfjD0wiwREPvCNlilRz7XoFde5
# KO01eFiWeteh48qUOqUaAkIznC4XB3sFd1LWUmupXHK05QfJSmnei9qZJBYTt8Zh
# ArGDh7nQn+Y1jOA3oBiCUJ4n1CMaWdDhrgdMuu026oWAbfC3prqkUn8LWp28H+2S
# LetNG5KQZZwvy3Zcn7+PQGl5AgMBAAGjggGCMIIBfjAfBgNVHSUEGDAWBgorBgEE
# AYI3TAgBBggrBgEFBQcDAzAdBgNVHQ4EFgQUBN/0b6Fh6nMdE4FAxYG9kWCpbYUw
# VAYDVR0RBE0wS6RJMEcxLTArBgNVBAsTJE1pY3Jvc29mdCBJcmVsYW5kIE9wZXJh
# dGlvbnMgTGltaXRlZDEWMBQGA1UEBRMNMjMwMDEyKzUwNTM2MjAfBgNVHSMEGDAW
# gBRIbmTlUAXTgqoXNzcitW2oynUClTBUBgNVHR8ETTBLMEmgR6BFhkNodHRwOi8v
# d3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NybC9NaWNDb2RTaWdQQ0EyMDExXzIw
# MTEtMDctMDguY3JsMGEGCCsGAQUFBwEBBFUwUzBRBggrBgEFBQcwAoZFaHR0cDov
# L3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9jZXJ0cy9NaWNDb2RTaWdQQ0EyMDEx
# XzIwMTEtMDctMDguY3J0MAwGA1UdEwEB/wQCMAAwDQYJKoZIhvcNAQELBQADggIB
# AGLQps1XU4RTcoDIDLP6QG3NnRE3p/WSMp61Cs8Z+JUv3xJWGtBzYmCINmHVFv6i
# 8pYF/e79FNK6P1oKjduxqHSicBdg8Mj0k8kDFA/0eU26bPBRQUIaiWrhsDOrXWdL
# m7Zmu516oQoUWcINs4jBfjDEVV4bmgQYfe+4/MUJwQJ9h6mfE+kcCP4HlP4ChIQB
# UHoSymakcTBvZw+Qst7sbdt5KnQKkSEN01CzPG1awClCI6zLKf/vKIwnqHw/+Wvc
# Ar7gwKlWNmLwTNi807r9rWsXQep1Q8YMkIuGmZ0a1qCd3GuOkSRznz2/0ojeZVYh
# ZyohCQi1Bs+xfRkv/fy0HfV3mNyO22dFUvHzBZgqE5FbGjmUnrSr1x8lCrK+s4A+
# bOGp2IejOphWoZEPGOco/HEznZ5Lk6w6W+E2Jy3PHoFE0Y8TtkSE4/80Y2lBJhLj
# 27d8ueJ8IdQhSpL/WzTjjnuYH7Dx5o9pWdIGSaFNYuSqOYxrVW7N4AEQVRDZeqDc
# fqPG3O6r5SNsxXbd71DCIQURtUKss53ON+vrlV0rjiKBIdwvMNLQ9zK0jy77owDy
# XXoYkQxakN2uFIBO1UNAvCYXjs4rw3SRmBX9qiZ5ENxcn/pLMkiyb68QdwHUXz+1
# fI6ea3/jjpNPz6Dlc/RMcXIWeMMkhup/XEbwu73U+uz/MIIHejCCBWKgAwIBAgIK
# YQ6Q0gAAAAAAAzANBgkqhkiG9w0BAQsFADCBiDELMAkGA1UEBhMCVVMxEzARBgNV
# BAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
# c29mdCBDb3Jwb3JhdGlvbjEyMDAGA1UEAxMpTWljcm9zb2Z0IFJvb3QgQ2VydGlm
# aWNhdGUgQXV0aG9yaXR5IDIwMTEwHhcNMTEwNzA4MjA1OTA5WhcNMjYwNzA4MjEw
# OTA5WjB+MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
# BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSgwJgYD
# VQQDEx9NaWNyb3NvZnQgQ29kZSBTaWduaW5nIFBDQSAyMDExMIICIjANBgkqhkiG
# 9w0BAQEFAAOCAg8AMIICCgKCAgEAq/D6chAcLq3YbqqCEE00uvK2WCGfQhsqa+la
# UKq4BjgaBEm6f8MMHt03a8YS2AvwOMKZBrDIOdUBFDFC04kNeWSHfpRgJGyvnkmc
# 6Whe0t+bU7IKLMOv2akrrnoJr9eWWcpgGgXpZnboMlImEi/nqwhQz7NEt13YxC4D
# dato88tt8zpcoRb0RrrgOGSsbmQ1eKagYw8t00CT+OPeBw3VXHmlSSnnDb6gE3e+
# lD3v++MrWhAfTVYoonpy4BI6t0le2O3tQ5GD2Xuye4Yb2T6xjF3oiU+EGvKhL1nk
# kDstrjNYxbc+/jLTswM9sbKvkjh+0p2ALPVOVpEhNSXDOW5kf1O6nA+tGSOEy/S6
# A4aN91/w0FK/jJSHvMAhdCVfGCi2zCcoOCWYOUo2z3yxkq4cI6epZuxhH2rhKEmd
# X4jiJV3TIUs+UsS1Vz8kA/DRelsv1SPjcF0PUUZ3s/gA4bysAoJf28AVs70b1FVL
# 5zmhD+kjSbwYuER8ReTBw3J64HLnJN+/RpnF78IcV9uDjexNSTCnq47f7Fufr/zd
# sGbiwZeBe+3W7UvnSSmnEyimp31ngOaKYnhfsi+E11ecXL93KCjx7W3DKI8sj0A3
# T8HhhUSJxAlMxdSlQy90lfdu+HggWCwTXWCVmj5PM4TasIgX3p5O9JawvEagbJjS
# 4NaIjAsCAwEAAaOCAe0wggHpMBAGCSsGAQQBgjcVAQQDAgEAMB0GA1UdDgQWBBRI
# bmTlUAXTgqoXNzcitW2oynUClTAZBgkrBgEEAYI3FAIEDB4KAFMAdQBiAEMAQTAL
# BgNVHQ8EBAMCAYYwDwYDVR0TAQH/BAUwAwEB/zAfBgNVHSMEGDAWgBRyLToCMZBD
# uRQFTuHqp8cx0SOJNDBaBgNVHR8EUzBRME+gTaBLhklodHRwOi8vY3JsLm1pY3Jv
# c29mdC5jb20vcGtpL2NybC9wcm9kdWN0cy9NaWNSb29DZXJBdXQyMDExXzIwMTFf
# MDNfMjIuY3JsMF4GCCsGAQUFBwEBBFIwUDBOBggrBgEFBQcwAoZCaHR0cDovL3d3
# dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNSb29DZXJBdXQyMDExXzIwMTFf
# MDNfMjIuY3J0MIGfBgNVHSAEgZcwgZQwgZEGCSsGAQQBgjcuAzCBgzA/BggrBgEF
# BQcCARYzaHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9kb2NzL3ByaW1h
# cnljcHMuaHRtMEAGCCsGAQUFBwICMDQeMiAdAEwAZQBnAGEAbABfAHAAbwBsAGkA
# YwB5AF8AcwB0AGEAdABlAG0AZQBuAHQALiAdMA0GCSqGSIb3DQEBCwUAA4ICAQBn
# 8oalmOBUeRou09h0ZyKbC5YR4WOSmUKWfdJ5DJDBZV8uLD74w3LRbYP+vj/oCso7
# v0epo/Np22O/IjWll11lhJB9i0ZQVdgMknzSGksc8zxCi1LQsP1r4z4HLimb5j0b
# pdS1HXeUOeLpZMlEPXh6I/MTfaaQdION9MsmAkYqwooQu6SpBQyb7Wj6aC6VoCo/
# KmtYSWMfCWluWpiW5IP0wI/zRive/DvQvTXvbiWu5a8n7dDd8w6vmSiXmE0OPQvy
# CInWH8MyGOLwxS3OW560STkKxgrCxq2u5bLZ2xWIUUVYODJxJxp/sfQn+N4sOiBp
# mLJZiWhub6e3dMNABQamASooPoI/E01mC8CzTfXhj38cbxV9Rad25UAqZaPDXVJi
# hsMdYzaXht/a8/jyFqGaJ+HNpZfQ7l1jQeNbB5yHPgZ3BtEGsXUfFL5hYbXw3MYb
# BL7fQccOKO7eZS/sl/ahXJbYANahRr1Z85elCUtIEJmAH9AAKcWxm6U/RXceNcbS
# oqKfenoi+kiVH6v7RyOA9Z74v2u3S5fi63V4GuzqN5l5GEv/1rMjaHXmr/r8i+sL
# gOppO6/8MO0ETI7f33VtY5E90Z1WTk+/gFcioXgRMiF670EKsT/7qMykXcGhiJtX
# cVZOSEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGiYwghoiAgEBMIGVMH4x
# CzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
# b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAmBgNVBAMTH01p
# Y3Jvc29mdCBDb2RlIFNpZ25pbmcgUENBIDIwMTECEzMAAASEmOIS4HijMV0AAAAA
# BIQwDQYJYIZIAWUDBAIBBQCgga4wGQYJKoZIhvcNAQkDMQwGCisGAQQBgjcCAQQw
# HAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcCARUwLwYJKoZIhvcNAQkEMSIEIEXn
# rOa/CULU6N+EniH1fwHdWG6rcjEo/bGy07gIVJbzMEIGCisGAQQBgjcCAQwxNDAy
# oBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRwOi8vd3d3Lm1pY3Jvc29mdC5j
# b20wDQYJKoZIhvcNAQEBBQAEggEAV0zZ6BmnGmrpBSztaqfYWj0XQBwugYJdqNTy
# COHqz78PNu8sviDEYJb7i5dqwGeTFyoJoxEmN4ARc/Xao2lJ1AGuPNNWYketc2XU
# bW9k87k1RKR7F7DZnmq51HBCl5fWUb0DzFeTCav05PNP4h6EzOxPoIcWeCU//g7V
# E9WUkrAZ2jp39cgSLClcG372FMlaLPh8kMPYxRteeCJq1qg2W+WqWSMlnQCgS168
# ZT66gjXFHTiTUgHL297pZzbY2CP8OrpZSZpLo8zPPezNPiic1vYj9FUHwG3T74GR
# jU9+lw1e8OpxQDkFXCTt3cxZfpYIxOlxcpfc0fPx9NlFnpDiFqGCF7AwghesBgor
# BgEEAYI3AwMBMYIXnDCCF5gGCSqGSIb3DQEHAqCCF4kwgheFAgEDMQ8wDQYJYIZI
# AWUDBAIBBQAwggFaBgsqhkiG9w0BCRABBKCCAUkEggFFMIIBQQIBAQYKKwYBBAGE
# WQoDATAxMA0GCWCGSAFlAwQCAQUABCC9RgQrQJ+bKBeU3II1u88P3nabzHv1PvM5
# uMGspgzcuAIGaSTohIGUGBMyMDI1MTIwOTIxMjMzNy45NDFaMASAAgH0oIHZpIHW
# MIHTMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
# UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMS0wKwYDVQQL
# EyRNaWNyb3NvZnQgSXJlbGFuZCBPcGVyYXRpb25zIExpbWl0ZWQxJzAlBgNVBAsT
# Hm5TaGllbGQgVFNTIEVTTjoyQTFBLTA1RTAtRDk0NzElMCMGA1UEAxMcTWljcm9z
# b2Z0IFRpbWUtU3RhbXAgU2VydmljZaCCEf4wggcoMIIFEKADAgECAhMzAAACEKvN
# 5BYY7zmwAAEAAAIQMA0GCSqGSIb3DQEBCwUAMHwxCzAJBgNVBAYTAlVTMRMwEQYD
# VQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNy
# b3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1w
# IFBDQSAyMDEwMB4XDTI1MDgxNDE4NDgxMloXDTI2MTExMzE4NDgxMlowgdMxCzAJ
# BgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25k
# MR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xLTArBgNVBAsTJE1pY3Jv
# c29mdCBJcmVsYW5kIE9wZXJhdGlvbnMgTGltaXRlZDEnMCUGA1UECxMeblNoaWVs
# ZCBUU1MgRVNOOjJBMUEtMDVFMC1EOTQ3MSUwIwYDVQQDExxNaWNyb3NvZnQgVGlt
# ZS1TdGFtcCBTZXJ2aWNlMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA
# jcc4q057ZwIgpKu4pTXWLejvYEduRf+1mIpbiJEMFWWmU2xpip+zK7xFxKGB1Ccl
# UXBU0/ZQZ6LG8H0gI7yvosrsPEI1DPB/XccGCvswKbAKckngOuGTEPGk7K/vEZa9
# h0Xt02b7m2n9MdIjkLrFl0pDriKyz0QHGpdh93X6+NApfE1TL24Vo0xkeoFGpL3r
# X9gXhIOF59EMnTd2o45FW/oxMgY9q0y0jGO0HrCLTCZr50e7TZRSNYAy2lyKbvKI
# 2MKlN1wLzJvZbbc//L3s1q3J6KhS0KC2VNEImYdFgVkJej4zZqHfScTbx9hjFgFp
# VkJl4xH5VJ8tyJdXE9+vU0k9AaT2QP1Zm3WQmXedSoLjjI7LWznuHwnoGIXLiJMQ
# zPqKqRIFL3wzcrDrZeWgtAdBPbipglZ5CQns6Baj5Mb6a/EZC9G3faJYK5QVHeE6
# eLoSEwp1dz5WurLXNPsp0VWplpl/FJb8jrRT/jOoHu85qRcdYpgByU9W7IWPdrth
# myfqeAw0omVWN5JxcogYbLo2pANJHlsMdWnxIpN5YwHbGEPCuosBHPk2Xd9+E/pZ
# PQUR6v+D85eEN5A/ZM/xiPpxa8dJZ87BpTvui7/2uflUMJf2Yc9ZLPgEdhQQo0Lw
# MDSTDT48y3sV7Pdo+g5q+MqnJztN/6qt1cgUTe9u+ykCAwEAAaOCAUkwggFFMB0G
# A1UdDgQWBBSe42+FrpdF2avbUhlk86BLSH5kejAfBgNVHSMEGDAWgBSfpxVdAF5i
# XYP05dJlpxtTNRnpcjBfBgNVHR8EWDBWMFSgUqBQhk5odHRwOi8vd3d3Lm1pY3Jv
# c29mdC5jb20vcGtpb3BzL2NybC9NaWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIwUENB
# JTIwMjAxMCgxKS5jcmwwbAYIKwYBBQUHAQEEYDBeMFwGCCsGAQUFBzAChlBodHRw
# Oi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NlcnRzL01pY3Jvc29mdCUyMFRp
# bWUtU3RhbXAlMjBQQ0ElMjAyMDEwKDEpLmNydDAMBgNVHRMBAf8EAjAAMBYGA1Ud
# JQEB/wQMMAoGCCsGAQUFBwMIMA4GA1UdDwEB/wQEAwIHgDANBgkqhkiG9w0BAQsF
# AAOCAgEAvs4rO3oo8czOrxPqnnSEkUVq718QzlrIiy7/EW7JmQXsJoFxHWUF0Ux0
# PDyKFDRXPJVv29F7kpJkBJJmcQg5HQV7blUXIMWQ1qX0KdtFQXI/MRL77Z+pK5x1
# jX+tbRkA7a5Ft7vWuRoAEi02HpFH5m/Akh/dfsbx8wOpecJbYvuHuy4aG0/tGzOW
# FCxMMNhGAIJ4qdV87JnY/uMBmiodlm+Gz357XWW5tg3HrtNZXuQ0tWUv26ud4nGK
# Jo/oLZHP75p4Rpt7dMdYKUF9AuVFBwxYZYpvgk12tfK+/yOwq84/fjXVCdM83Qna
# wtbenbk/lnbc9KsZom+GnvA4itAMUpSXFWrcRkqdUQLN+JrG6fPBoV8+D8U2Q2F4
# XkiCR6EU9JzYKwTuvL6t3nFuxnkLdNjbTg2/yv2j3WaDuCK5lSPgsndIiH6Bku2U
# i3A0aUo6D9z9v+XEuBs9ioVJaOjf/z+Urqg7ESnxG0/T1dKci7vLQ2XNgWFYO+/O
# lDjtGoma1ijX4m14N9qgrXTuWEGwgC7hhBgp3id/LAOf9BSTWA5lBrilsEoexXBr
# On/1wM3rjG0hIsxvF5/YOK78mVRGY6Y7zYJ+uXt4OTOFBwadPv8MklreQZLPnQPt
# iwop4rlLUYaPCiD4YUqRNbLp8Sgyo9g0iAcZYznTuc+8Q8ZIrgwwggdxMIIFWaAD
# AgECAhMzAAAAFcXna54Cm0mZAAAAAAAVMA0GCSqGSIb3DQEBCwUAMIGIMQswCQYD
# VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEe
# MBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMTIwMAYDVQQDEylNaWNyb3Nv
# ZnQgUm9vdCBDZXJ0aWZpY2F0ZSBBdXRob3JpdHkgMjAxMDAeFw0yMTA5MzAxODIy
# MjVaFw0zMDA5MzAxODMyMjVaMHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNo
# aW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
# cG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEw
# MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA5OGmTOe0ciELeaLL1yR5
# vQ7VgtP97pwHB9KpbE51yMo1V/YBf2xK4OK9uT4XYDP/XE/HZveVU3Fa4n5KWv64
# NmeFRiMMtY0Tz3cywBAY6GB9alKDRLemjkZrBxTzxXb1hlDcwUTIcVxRMTegCjhu
# je3XD9gmU3w5YQJ6xKr9cmmvHaus9ja+NSZk2pg7uhp7M62AW36MEBydUv626GIl
# 3GoPz130/o5Tz9bshVZN7928jaTjkY+yOSxRnOlwaQ3KNi1wjjHINSi947SHJMPg
# yY9+tVSP3PoFVZhtaDuaRr3tpK56KTesy+uDRedGbsoy1cCGMFxPLOJiss254o2I
# 5JasAUq7vnGpF1tnYN74kpEeHT39IM9zfUGaRnXNxF803RKJ1v2lIH1+/NmeRd+2
# ci/bfV+AutuqfjbsNkz2K26oElHovwUDo9Fzpk03dJQcNIIP8BDyt0cY7afomXw/
# TNuvXsLz1dhzPUNOwTM5TI4CvEJoLhDqhFFG4tG9ahhaYQFzymeiXtcodgLiMxhy
# 16cg8ML6EgrXY28MyTZki1ugpoMhXV8wdJGUlNi5UPkLiWHzNgY1GIRH29wb0f2y
# 1BzFa/ZcUlFdEtsluq9QBXpsxREdcu+N+VLEhReTwDwV2xo3xwgVGD94q0W29R6H
# XtqPnhZyacaue7e3PmriLq0CAwEAAaOCAd0wggHZMBIGCSsGAQQBgjcVAQQFAgMB
# AAEwIwYJKwYBBAGCNxUCBBYEFCqnUv5kxJq+gpE8RjUpzxD/LwTuMB0GA1UdDgQW
# BBSfpxVdAF5iXYP05dJlpxtTNRnpcjBcBgNVHSAEVTBTMFEGDCsGAQQBgjdMg30B
# ATBBMD8GCCsGAQUFBwIBFjNodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3Bz
# L0RvY3MvUmVwb3NpdG9yeS5odG0wEwYDVR0lBAwwCgYIKwYBBQUHAwgwGQYJKwYB
# BAGCNxQCBAweCgBTAHUAYgBDAEEwCwYDVR0PBAQDAgGGMA8GA1UdEwEB/wQFMAMB
# Af8wHwYDVR0jBBgwFoAU1fZWy4/oolxiaNE9lJBb186aGMQwVgYDVR0fBE8wTTBL
# oEmgR4ZFaHR0cDovL2NybC5taWNyb3NvZnQuY29tL3BraS9jcmwvcHJvZHVjdHMv
# TWljUm9vQ2VyQXV0XzIwMTAtMDYtMjMuY3JsMFoGCCsGAQUFBwEBBE4wTDBKBggr
# BgEFBQcwAoY+aHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNS
# b29DZXJBdXRfMjAxMC0wNi0yMy5jcnQwDQYJKoZIhvcNAQELBQADggIBAJ1Vffwq
# reEsH2cBMSRb4Z5yS/ypb+pcFLY+TkdkeLEGk5c9MTO1OdfCcTY/2mRsfNB1OW27
# DzHkwo/7bNGhlBgi7ulmZzpTTd2YurYeeNg2LpypglYAA7AFvonoaeC6Ce5732pv
# vinLbtg/SHUB2RjebYIM9W0jVOR4U3UkV7ndn/OOPcbzaN9l9qRWqveVtihVJ9Ak
# vUCgvxm2EhIRXT0n4ECWOKz3+SmJw7wXsFSFQrP8DJ6LGYnn8AtqgcKBGUIZUnWK
# NsIdw2FzLixre24/LAl4FOmRsqlb30mjdAy87JGA0j3mSj5mO0+7hvoyGtmW9I/2
# kQH2zsZ0/fZMcm8Qq3UwxTSwethQ/gpY3UA8x1RtnWN0SCyxTkctwRQEcb9k+SS+
# c23Kjgm9swFXSVRk2XPXfx5bRAGOWhmRaw2fpCjcZxkoJLo4S5pu+yFUa2pFEUep
# 8beuyOiJXk+d0tBMdrVXVAmxaQFEfnyhYWxz/gq77EFmPWn9y8FBSX5+k77L+Dvk
# txW/tM4+pTFRhLy/AsGConsXHRWJjXD+57XQKBqJC4822rpM+Zv/Cuk0+CQ1Zyvg
# DbjmjJnW4SLq8CdCPSWU5nR0W2rRnj7tfqAxM328y+l7vzhwRNGQ8cirOoo6CGJ/
# 2XBjU02N7oJtpQUQwXEGahC0HVUzWLOhcGbyoYIDWTCCAkECAQEwggEBoYHZpIHW
# MIHTMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
# UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMS0wKwYDVQQL
# EyRNaWNyb3NvZnQgSXJlbGFuZCBPcGVyYXRpb25zIExpbWl0ZWQxJzAlBgNVBAsT
# Hm5TaGllbGQgVFNTIEVTTjoyQTFBLTA1RTAtRDk0NzElMCMGA1UEAxMcTWljcm9z
# b2Z0IFRpbWUtU3RhbXAgU2VydmljZaIjCgEBMAcGBSsOAwIaAxUAOsyf2b6riPKn
# nXlIgIL2f53PUsKggYMwgYCkfjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
# aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
# cnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAx
# MDANBgkqhkiG9w0BAQsFAAIFAOzig90wIhgPMjAyNTEyMDkxMTE3NDlaGA8yMDI1
# MTIxMDExMTc0OVowdzA9BgorBgEEAYRZCgQBMS8wLTAKAgUA7OKD3QIBADAKAgEA
# AgIYbwIB/zAHAgEAAgIUWTAKAgUA7OPVXQIBADA2BgorBgEEAYRZCgQCMSgwJjAM
# BgorBgEEAYRZCgMCoAowCAIBAAIDB6EgoQowCAIBAAIDAYagMA0GCSqGSIb3DQEB
# CwUAA4IBAQA6v6muR7BTiWLZC4Qx5zx6wwgIwbGts0lsJdaEBhW8PfSnxjm2b5WF
# N3KYBE+VSJ7uQZG5fnZpwY3IliiEqGEl6aoZ83/ICLtW27WgZ7CCR+VSz9dxsVhg
# 6IAkmvVjE5SDoo/HMdrttcyIUc9hN2jKhOAfr7NK13ERuJczsBNhV7wmT1SrCxhE
# pAikR9wNYl3cecI1J/mpeIDvA1OwhHe5nGcEbUtybIPNEZ0QcnuZ0/1dxXrnisiV
# ZPiTq61BiihuBVkZvimKgtPADVq4dcxtScMK86/DQCCFjI9JhSqqWlnqGD2CXEfR
# QAUAyuKpUaoNON4J/OYWomOrxOhrVq46MYIEDTCCBAkCAQEwgZMwfDELMAkGA1UE
# BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
# BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0
# IFRpbWUtU3RhbXAgUENBIDIwMTACEzMAAAIQq83kFhjvObAAAQAAAhAwDQYJYIZI
# AWUDBAIBBQCgggFKMBoGCSqGSIb3DQEJAzENBgsqhkiG9w0BCRABBDAvBgkqhkiG
# 9w0BCQQxIgQg/goM+SmhF5esroe45AF6A0npqYQERtxzVMdEHCcGvGIwgfoGCyqG
# SIb3DQEJEAIvMYHqMIHnMIHkMIG9BCDD1SHufsjzY59S1iHUQY9hnsKSrJPg5a9M
# c4YnGmPHxjCBmDCBgKR+MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
# dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9y
# YXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwAhMz
# AAACEKvN5BYY7zmwAAEAAAIQMCIEIFcyP3HutiZ8xZU6yJSMVoXEs2L+uxXK8SYY
# 1mC+ML12MA0GCSqGSIb3DQEBCwUABIICAGPcApMe/myG2zLeYhfaW3HQR8PY2B8/
# DU9j5xryKIA3p0HBQjIwTYYKaaqWKck933BEPi2GEka7vbnm6wUNCg83UbhjJ8uy
# OInDgFlFLfEu5qSNTpuzkBKCXrQAQGE/O5rWiMWHM+9Ep96AiW7NRwJyJM0jCSiI
# R3cukG1mtfbfLoN7Jr4LPPGl0HSLrOblXRUAH3yUW7kFSlRPaKHOHj3smZRrY89n
# Lvu/YZpsKTGtTqkMkHIC44mIWx3elh+SNf2v+hc/MJz7KKRP1h17xgqVECaQbCe8
# TOX1LAYQlkWHLgjX9YSzihnmuyiFQb2HaeY3z6wM3T25W/u2t49qF3ahYzEJxH23
# yjSSA7aI+cmZkqeIpJ4fKr0FeX66oXLo9FvOpIZ4Rt1kKv+GNPRZSt500nWw9DH5
# wpecyooual/4ilAnPIPVorK+hugEJ2Osq7/TMXBHN4NF3MDDpQADi2tAPsMi20GN
# VHZVUOxUsIB2RKftTMPC0FtOzEfvRGqfEkf5mJVJFCHWZyCufhiifBbRvF/gkcwm
# B5OHV1Cjt+AfAnFnVcwVTtd+dI6Leort196XDvwTzKYZOwWtHyrfiFM4F07/+RXA
# Whln44eLC6popYA0zrqghDx8HqrhGCbmzg6B3dNOLHp0A1uaAvAYTzNY2GF3Hn6X
# 30MNWbXox9P8
# SIG # End signature block