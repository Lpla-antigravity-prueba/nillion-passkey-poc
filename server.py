import http.server
import socketserver
PORT = 8000
class Handler(http.server.SimpleHTTPRequestHandler):
      def end_headers(self):
                self.send_header('Access-Control-Allow-Origin', '*')
                super().end_headers()
        print(f"Nillion PoC Server running at http://localhost:{PORT}")
with socketserver.TCPServer(("", PORT), Handler) as httpd:
      httpd.serve_forever()
