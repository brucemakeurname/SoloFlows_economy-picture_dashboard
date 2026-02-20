import { useCallback } from "react";
import { Database, Calendar, Download, Globe, FileJson, FileSpreadsheet, CheckCircle, Clock } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import DataTable from "@/components/dashboard/DataTable";
import { useApi } from "@/hooks/useApi";
import type { Period } from "@/lib/types";

export default function Settings() {
  const { data: periods, loading: periodsLoading } = useApi<Period[]>("periods.php", []);

  const periodColumns = [
    { key: "code", header: "Code", sortable: true },
    { key: "label", header: "Label" },
    { key: "start_date", header: "Start", render: (row: Record<string, unknown>) => new Date(String(row.start_date)).toLocaleDateString("en-US") },
    { key: "end_date", header: "End", render: (row: Record<string, unknown>) => new Date(String(row.end_date)).toLocaleDateString("en-US") },
    { key: "is_active", header: "Status", render: (row: Record<string, unknown>) => (
      <Badge variant={row.is_active ? "success" : "outline"}>
        {row.is_active ? <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />Active</span> : <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Inactive</span>}
      </Badge>
    )},
  ];

  const handleExportCSV = useCallback(() => { alert("Export CSV -- Feature coming soon"); }, []);
  const handleExportJSON = useCallback(() => { alert("Export JSON -- Feature coming soon"); }, []);

  return (
    <PageContainer title="Settings" description="Configuration and data management">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Data Sources */}
        <Card>
          <CardHeader className="px-3 py-2">
            <CardTitle className="flex items-center gap-1.5 text-sm"><Database className="h-4 w-4 text-primary" />Data Sources</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0 space-y-2">
            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-500" />
                <div><p className="text-sm font-medium">Manual Entry</p><p className="text-xs text-muted-foreground">Data entry via interface</p></div>
              </div>
              <Badge variant="success"><CheckCircle className="mr-0.5 h-3 w-3" />Active</Badge>
            </div>
            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-purple-500" />
                <div><p className="text-sm font-medium">Supabase API</p><p className="text-xs text-muted-foreground">Sync from backend</p></div>
              </div>
              <Badge variant="success"><CheckCircle className="mr-0.5 h-3 w-3" />Active</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Data Export + API Config */}
        <div className="flex flex-col gap-3">
          <Card>
            <CardHeader className="px-3 py-2">
              <CardTitle className="flex items-center gap-1.5 text-sm"><Download className="h-4 w-4 text-primary" />Data Export</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportCSV}><FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />CSV</Button>
                <Button variant="outline" size="sm" onClick={handleExportJSON}><FileJson className="mr-1.5 h-3.5 w-3.5" />JSON</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-3 py-2">
              <CardTitle className="flex items-center gap-1.5 text-sm"><Globe className="h-4 w-4 text-primary" />API Config</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0">
              <div className="rounded-md border border-dashed p-4 text-center">
                <Globe className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-xs text-muted-foreground">Automated API in next version</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Period Management — full width */}
        <Card className="lg:col-span-2">
          <CardHeader className="px-3 py-2">
            <CardTitle className="flex items-center gap-1.5 text-sm"><Calendar className="h-4 w-4 text-primary" />Period Management</CardTitle>
            <CardDescription className="text-xs">Accounting periods and status</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pb-2 pt-0">
            <DataTable
              columns={periodColumns}
              data={(periods ?? []) as unknown as Record<string, unknown>[]}
              loading={periodsLoading}
              emptyMessage="No periods configured"
            />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
