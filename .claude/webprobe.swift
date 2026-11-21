// webprobe: opens a URL in an offscreen WKWebView of the given width (the same engine as Safari),
// waits 1.5 s after the load (3.2 s with an instrument), runs the JS and prints JSON.stringify of its result (a promise is awaited).
// Exit code 1 if the page does not load or the JS throws. Used by .claude/check-czerepaha.rb.
// Optional 5th argument: JS that runs at the start of the document, before the page's own scripts
// (for instruments such as a loop that watches the main thread during the load); then a blank
// page is loaded first and the URL 0.7 s later, so the view's own start-up stall is not measured.
// Usage: webprobe <url> <width> <height> <js> [<js at document start>]
import Cocoa
import WebKit

let a = CommandLine.arguments
guard a.count >= 5, let url = URL(string: a[1]), let w = Double(a[2]), let h = Double(a[3]) else {
  FileHandle.standardError.write("usage: webprobe <url> <width> <height> <js>\n".data(using: .utf8)!)
  exit(2)
}
let js = a[4]
let wait = a.count >= 6 ? 3.2 : 1.5 // with an instrument the run waits long enough for its 3 s window

func fail(_ msg: String) -> Never {
  FileHandle.standardError.write((msg + "\n").data(using: .utf8)!)
  exit(1)
}

class Delegate: NSObject, WKNavigationDelegate {
  var warm = a.count < 6 // with an instrument, a blank page is loaded first so the view's start-up is over before the real load
  func webView(_ v: WKWebView, didFinish n: WKNavigation!) {
    if !warm {
      warm = true
      DispatchQueue.main.asyncAfter(deadline: .now() + 0.7) { v.load(URLRequest(url: URL(string: a[1])!)) }
      return
    }
    DispatchQueue.main.asyncAfter(deadline: .now() + wait) {
      // The JS is evaluated as a global script, so it may be several statements; the last value
      // is the result. If that value is a promise, its result is awaited (for checks that scroll
      // and wait for an IntersectionObserver).
      let lit = String(data: try! JSONSerialization.data(withJSONObject: [js], options: []), encoding: .utf8)!
      let body = "return JSON.stringify(await (0, eval)(\(lit)[0]));"
      v.callAsyncJavaScript(body, arguments: [:], in: nil, in: .page) { res in
        switch res {
        case .failure(let e): fail("js error: \(e)")
        case .success(let r): print((r as? String) ?? "null")
        }
        exit(0)
      }
    }
  }
  func webView(_ v: WKWebView, didFailProvisionalNavigation n: WKNavigation!, withError e: Error) { fail("load failed: \(e)") }
  func webView(_ v: WKWebView, didFail n: WKNavigation!, withError e: Error) { fail("load failed: \(e)") }
}

let app = NSApplication.shared
let win = NSWindow(contentRect: NSRect(x: 0, y: 0, width: w, height: h), styleMask: [.borderless], backing: .buffered, defer: false)
let conf = WKWebViewConfiguration()
if a.count >= 6 {
  conf.userContentController.addUserScript(WKUserScript(source: a[5], injectionTime: .atDocumentStart, forMainFrameOnly: true))
}
let wv = WKWebView(frame: NSRect(x: 0, y: 0, width: w, height: h), configuration: conf)
win.contentView = wv
let delegate = Delegate()
wv.navigationDelegate = delegate
if a.count >= 6 { wv.loadHTMLString("<!doctype html><p>warm-up</p>", baseURL: nil) } else { wv.load(URLRequest(url: URL(string: a[1])!)) }
DispatchQueue.main.asyncAfter(deadline: .now() + 30) { fail("timeout") }
app.run()
