/**
 * NOTE: http.globalAgent only affects http.request() calls, NOT fetch()/undici.
 * The Medusa JS SDK uses fetch/undici internally. This file is kept as a
 * placeholder but provides no benefit for SDK fetch() calls.
 *
 * The actual TIME_WAIT fix is:
 *   1. middleware.ts → calls /api/regions (stops direct Edge→backend TCP flood)
 *   2. /api/regions/route.ts → uses rawRequest() with http.Agent keepAlive:true
 *   3. Windows: Set TcpTimedWaitDelay=30 in registry (run as Administrator):
 *      Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" `
 *        -Name "TcpTimedWaitDelay" -Value 30 -Type DWord
 */
