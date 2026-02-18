export function Test() {
  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a2e', color: '#fff' }}>
      <div style={{ textAlign: 'center' }}>
        <h1>✓ React is Working!</h1>
        <p>Tailwind CSS Status: Check browser DevTools</p>
        <pre style={{ backgroundColor: '#111', padding: '20px', borderRadius: '8px', marginTop: '20px', fontSize: '12px' }}>
          {JSON.stringify({
            frontend: 'Running on 5173',
            backend: 'http://localhost:5000',
            tailwind: 'Loading...'
          }, null, 2)}
        </pre>
      </div>
    </div>
  )
}
