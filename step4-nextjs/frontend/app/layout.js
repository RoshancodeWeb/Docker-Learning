// The root layout — Next.js (App Router) REQUIRES this file.
// Every page is wrapped inside this <html>/<body>.

export const metadata = {
  title: "Step 4 — Multi-Tier Docker App",
  description: "Next.js frontend → Node API → Redis",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "-apple-system, Segoe UI, Helvetica, Arial, sans-serif",
          background: "#0f172a",
          color: "#e2e8f0",
          display: "flex",
          minHeight: "100vh",
          margin: 0,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </body>
    </html>
  );
}
