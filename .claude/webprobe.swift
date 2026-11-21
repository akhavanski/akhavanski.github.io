// webprobe: opens a URL in an offscreen WKWebView of the given width (the same engine as Safari),
// waits 1.5 s after the load, runs the JS and prints JSON.stringify of its result.
// Exit code 1 if the page does not load or the JS throws. Used by .claude/check-czerepaha.rb.
// Usage: webprobe <url> <width> <height> <js>
import Cocoa
import WebKit

let a = CommandLine.arguments
guard a.count >= 5, let url = URL(string: a[1]), let w = Double(a[2]), let h = Double(a[3]) else {
  FileHandle.standardError.write("usage: webprobe <url> <width> <height> <js>\n".data(using: .utf8)!)
  exit(2)
}
let js = a[4]

func fail(_ msg: String) -> Never {
  FileHandle.standardError.write((msg + "\n").data(using: .utf8)!)
  exit(1)
}

class Delegate: NSObject, WKNavigationDelegate {
  func webView(_ v: WKWebView, didFinish n: WKNavigation!) {
    DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
      // The JS is evaluated as a script, so it may be several statements; the last value is the result.
      let lit = String(data: try! JSONSerialization.data(withJSONObject: [js], options: []), encoding: .utf8)!
      let wrapped = "JSON.stringify(eval(\(lit)[0]))"
      v.evaluateJavaScript(wrapped) { r, e in
        if let e = e { fail("js error: \(e)") }
        print((r as? String) ?? "null")
        exit(0)
      }
    }
  }
  func webView(_ v: WKWebView, didFailProvisionalNavigation n: WKNavigation!, withError e: Error) { fail("load failed: \(e)") }
  func webView(_ v: WKWebView, didFail n: WKNavigation!, withError e: Error) { fail("load failed: \(e)") }
}

let app = NSApplication.shared
let win = NSWindow(contentRect: NSRect(x: 0, y: 0, width: w, height: h), styleMask: [.borderless], backing: .buffered, defer: false)
let wv = WKWebView(frame: NSRect(x: 0, y: 0, width: w, height: h))
win.contentView = wv
let delegate = Delegate()
wv.navigationDelegate = delegate
wv.load(URLRequest(url: url))
DispatchQueue.main.asyncAfter(deadline: .now() + 30) { fail("timeout") }
app.run()
