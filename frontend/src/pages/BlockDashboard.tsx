export function BlockDashboard() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Ethereum Block Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time Ethereum blockchain monitoring and analysis
        </p>
      </div>

      <div className="grid gap-6">
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Latest Blocks</h2>
          <p className="text-muted-foreground">Blocks will appear here once connected to the backend.</p>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          <p className="text-muted-foreground">Transactions will appear here once connected to the backend.</p>
        </div>
      </div>
    </div>
  )
}