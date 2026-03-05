# Userscript API Reference

## All Metadata Headers

| Header           | Required | Description                                                                           |
| ---------------- | -------- | ------------------------------------------------------------------------------------- |
| `@name`          | Yes      | Script display name, must be unique within namespace                                  |
| `@namespace`     | No       | Combines with @name to create unique identifier                                       |
| `@version`       | No       | Script version for update checking (semver recommended)                               |
| `@description`   | No       | Brief script summary                                                                  |
| `@author`        | No       | Script author name                                                                    |
| `@homepage`      | No       | URL to script homepage                                                                |
| `@homepageURL`   | No       | Alias for @homepage                                                                   |
| `@website`       | No       | Alias for @homepage                                                                   |
| `@source`        | No       | Alias for @homepage                                                                   |
| `@icon`          | No       | Script icon URL (use favicon service for site icons)                                  |
| `@iconURL`       | No       | Alias for @icon                                                                       |
| `@defaulticon`   | No       | Alias for @icon                                                                       |
| `@icon64`        | No       | 64x64 icon URL                                                                        |
| `@icon64URL`     | No       | Alias for @icon64                                                                     |
| `@updateURL`     | No       | URL for userscript metadata updates                                                   |
| `@downloadURL`   | No       | URL for script download on update                                                     |
| `@supportURL`    | No       | URL for user support                                                                  |
| `@include`       | No       | URL pattern (legacy, supports wildcards)                                              |
| `@match`         | No       | URL pattern (recommended, stricter than @include)                                     |
| `@exclude`       | No       | URL pattern to exclude                                                                |
| `@exclude-match` | No       | Strict URL pattern to exclude                                                         |
| `@require`       | No       | External script URL to load before execution                                          |
| `@resource`      | No       | Named resource: `@resource name URL`                                                  |
| `@connect`       | No       | Allowed domains for GM_xmlhttpRequest                                                 |
| `@run-at`        | No       | When to run: document-start, document-body, document-end, document-idle, context-menu |
| `@grant`         | No       | API permissions (none, or GM_* function names)                                        |
| `@noframes`      | No       | Run only in top-level document, not iframes                                           |
| `@unwrap`        | No       | Inject without wrapper (disables GM API)                                              |
| `@inject-into`   | No       | Context: page, content, auto                                                          |
| `@sandbox`       | No       | Sandbox mode for @inject-into page                                                    |

---

## @match Pattern Syntax

```
@match <scheme>://<host><path>

scheme: http, https, *, file, ftp, urn
host: *, *.example.com, example.com
path: /*, /path/*, /path/page.html
```

**Examples:**
```javascript
// @match https://example.com/*              // All pages on example.com
// @match https://*.example.com/*            // All subdomains
// @match *://example.com/*                  // HTTP and HTTPS
// @match https://example.com/path/*         // Specific path prefix
// @match https://example.com/page.html      // Exact page
```

---

## @run-at Values

| Value            | When                   | Use Case                          |
| ---------------- | ---------------------- | --------------------------------- |
| `document-start` | Before DOM exists      | CSS injection, intercept requests |
| `document-body`  | When `<body>` exists   | Early DOM access                  |
| `document-end`   | DOM ready, before load | Most DOM manipulation             |
| `document-idle`  | After load event       | Non-critical, heavy operations    |
| `context-menu`   | On context menu click  | Menu-triggered scripts            |

---

## GM_* API Reference

### Storage

**GM_getValue(key, defaultValue)**
```javascript
// @grant GM_getValue
const count = GM_getValue('visitCount', 0)
```

**GM_setValue(key, value)**
```javascript
// @grant GM_setValue
GM_setValue('visitCount', count + 1)
```

**GM_deleteValue(key)**
```javascript
// @grant GM_deleteValue
GM_deleteValue('visitCount')
```

**GM_listValues()**
```javascript
// @grant GM_listValues
const keys = GM_listValues() // ['key1', 'key2']
```

**GM_addValueChangeListener(key, callback)**
```javascript
// @grant GM_addValueChangeListener
const listenerId = GM_addValueChangeListener('key', (key, oldVal, newVal, remote) => {
  console.log(`${key} changed from ${oldVal} to ${newVal}`)
})
```

**GM_removeValueChangeListener(listenerId)**
```javascript
// @grant GM_removeValueChangeListener
GM_removeValueChangeListener(listenerId)
```

---

### DOM & Styling

**GM_addStyle(css)**
```javascript
// @grant GM_addStyle
GM_addStyle(`
  .element { color: red !important; }
`)
```

**GM_addElement(tagName, attributes)** or **GM_addElement(parentNode, tagName, attributes)**
```javascript
// @grant GM_addElement
// Bypasses Content-Security-Policy
GM_addElement('script', { src: 'https://example.com/lib.js' })
GM_addElement(document.body, 'div', { id: 'myDiv', textContent: 'Hello' })
```

---

### Network

**GM_xmlhttpRequest(details)**
```javascript
// @grant GM_xmlhttpRequest
// @connect api.example.com
GM_xmlhttpRequest({
  method: 'GET',
  url: 'https://api.example.com/data',
  headers: { 'Accept': 'application/json' },
  onload: response => {
    const data = JSON.parse(response.responseText)
    console.log(data)
  },
  onerror: error => console.error(error)
})
```

**POST with data:**
```javascript
GM_xmlhttpRequest({
  method: 'POST',
  url: 'https://api.example.com/submit',
  headers: { 'Content-Type': 'application/json' },
  data: JSON.stringify({ key: 'value' }),
  onload: response => console.log(response.responseText)
})
```

**GM_download(details)** or **GM_download(url, name)**
```javascript
// @grant GM_download
GM_download({
  url: 'https://example.com/file.pdf',
  name: 'downloaded.pdf',
  onload: () => console.log('Downloaded'),
  onerror: err => console.error(err)
})
```

---

### UI & Interaction

**GM_registerMenuCommand(name, callback, accessKey)**
```javascript
// @grant GM_registerMenuCommand
GM_registerMenuCommand('Toggle Feature', () => {
  enabled = !enabled
  console.log('Feature:', enabled ? 'ON' : 'OFF')
}, 't')
```

**GM_unregisterMenuCommand(menuCommandId)**
```javascript
// @grant GM_unregisterMenuCommand
const cmdId = GM_registerMenuCommand('Temp', () => {})
GM_unregisterMenuCommand(cmdId)
```

**GM_notification(details)** or **GM_notification(text, title, image, onclick)**
```javascript
// @grant GM_notification
GM_notification({
  title: 'Alert',
  text: 'Something happened!',
  image: 'https://example.com/icon.png',
  timeout: 5000,
  onclick: () => console.log('Notification clicked'),
  ondone: () => console.log('Notification closed')
})
```

**GM_setClipboard(text, type)**
```javascript
// @grant GM_setClipboard
GM_setClipboard('Copied text', 'text')
```

**GM_openInTab(url, options)**
```javascript
// @grant GM_openInTab
GM_openInTab('https://example.com', { active: true, insert: true })
// or simple: GM_openInTab('https://example.com', true) // active=true
```

---

### Utilities

**GM_info**
```javascript
// Always available (no @grant needed)
console.log(GM_info.script.name)        // Script name
console.log(GM_info.script.version)     // Script version
console.log(GM_info.scriptHandler)      // 'Tampermonkey', 'Violentmonkey', etc.
console.log(GM_info.version)            // Extension version
```

**GM_getResourceText(resourceName)**
```javascript
// @resource myCSS https://example.com/style.css
// @grant GM_getResourceText
const css = GM_getResourceText('myCSS')
GM_addStyle(css)
```

**GM_getResourceURL(resourceName)**
```javascript
// @resource myImage https://example.com/image.png
// @grant GM_getResourceURL
const imageUrl = GM_getResourceURL('myImage')
document.querySelector('img').src = imageUrl
```

**unsafeWindow**
```javascript
// @grant unsafeWindow
// Access page's JavaScript context (use carefully)
unsafeWindow.pageVariable = 'modified'
unsafeWindow.somePageFunction()
```

---

## Promise-based API (GM.*)

Modern alternative to callback-based GM_* functions:

```javascript
// @grant GM.getValue
// @grant GM.setValue
const count = await GM.getValue('count', 0)
await GM.setValue('count', count + 1)

// @grant GM.xmlHttpRequest
const response = await GM.xmlHttpRequest({
  method: 'GET',
  url: 'https://api.example.com/data'
})
console.log(response.responseText)
```

Available: `GM.getValue`, `GM.setValue`, `GM.deleteValue`, `GM.listValues`, `GM.xmlHttpRequest`, `GM.notification`, `GM.openInTab`, `GM.setClipboard`, `GM.getResourceUrl`
