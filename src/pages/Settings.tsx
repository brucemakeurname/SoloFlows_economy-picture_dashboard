import { useCallback } from "react";
import {
  Database,
  Calendar,
  Download,
  Globe,
  FileJson,
  FileSpreadsheet,
  CheckCircle,
  Clock,
} from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import DataTable from "@/components/dashboard/DataTable";
import { useApi } from "@/hooks/useApi";
import type { Period } from "@/lib/types";

export default function Settings() {
  // Fetch periods
  const { data: periods, loading: periodsLoading } = useApi<Period[]>("periods.php", []);

  // Periods table columns
  const periodColumns = [
    {
      key: "code",
      header: "Ma ky",
      sortable: true,
    },
    {
      key: "label",
      header: "Nhan",
    },
    {
      key: "start_date",
      header: "Ngay bat dau",
      render: (row: Record<string, unknown>) =>
        new Date(String(row.start_date)).toLocaleDateString("vi-VN"),
    },
    {
      key: "end_date",
      header: "Ngay ket thuc",
      render: (row: Record<string, unknown>) =>
        new Date(String(row.end_date)).toLocaleDateString("vi-VN"),
    },
    {
      key: "is_active",
      header: "Trang thai",
      render: (row: Record<string, unknown>) => (
        <Badge variant={row.is_active ? "success" : "outline"}>
          {row.is_active ? (
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Dang hoat dong
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Khong hoat dong
            </span>
          )}
        </Badge>
      ),
    },
  ];

  const handleExportCSV = useCallback(() => {
    alert("Xuat CSV -- Tinh nang dang duoc phat trien");
  }, []);

  const handleExportJSON = useCallback(() => {
    alert("Xuat JSON -- Tinh nang dang duoc phat trien");
  }, []);

  return (
    <PageContainer title="Cai dat" description="Quan ly cau hinh va du lieu">
      <div className="space-y-6">
        {/* Section 1: Data Sources */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle>Nguon du lieu</CardTitle>
            </div>
            <CardDescription>
              Cac nguon du lieu dang duoc ket noi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Database className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Manual Entry</p>
                    <p className="text-sm text-muted-foreground">
                      Nhap lieu thu cong qua giao dien
                    </p>
                  </div>
                </div>
                <Badge variant="success">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Active
                </Badge>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                    <Globe className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Supabase API</p>
                    <p className="text-sm text-muted-foreground">
                      Dong bo du lieu tu Supabase backend
                    </p>
                  </div>
                </div>
                <Badge variant="success">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Period Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Quan ly ky</CardTitle>
            </div>
            <CardDescription>
              Danh sach cac ky ke toan va trang thai
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={periodColumns}
              data={(periods ?? []) as unknown as Record<string, unknown>[]}
              loading={periodsLoading}
              emptyMessage="Chua co ky nao duoc thiet lap"
            />
          </CardContent>
        </Card>

        {/* Section 3: Data Export */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              <CardTitle>Xuat du lieu</CardTitle>
            </div>
            <CardDescription>
              Tai du lieu xuong may tinh de luu tru hoac phan tich ngoai he thong
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleExportCSV}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={handleExportJSON}>
                <FileJson className="mr-2 h-4 w-4" />
                Export JSON
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: API Configuration Placeholder */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle>Cau hinh API</CardTitle>
            </div>
            <CardDescription>
              Ket noi voi cac dich vu ben ngoai
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Globe className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm text-muted-foreground">
                Ket noi API tu dong se duoc ho tro trong phien ban tiep theo
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
