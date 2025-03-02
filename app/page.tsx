import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, BarChart, Database } from 'lucide-react';

export default function Home() {
  return (
    <main className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">OHLCV Data Manager</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Download, manage, and analyze OHLCV data from cryptocurrency exchanges
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <Card>
          <CardHeader>
            <Download className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Download Data</CardTitle>
            <CardDescription>
              Download historical OHLCV data for multiple symbols
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Efficiently download historical price data with configurable concurrency and automatic rate limiting.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard" className="w-full">
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <Database className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Manage Data</CardTitle>
            <CardDescription>
              View and manage your downloaded data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Browse your downloaded symbols, check data completeness, and manage storage.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/database" className="w-full">
              <Button variant="outline" className="w-full">Browse Database</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <BarChart className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Monitor Downloads</CardTitle>
            <CardDescription>
              Track download progress and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Monitor download speeds, progress, and estimated completion times for all your data downloads.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard" className="w-full">
              <Button variant="outline" className="w-full">View Dashboard</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
