"use client";

import { useState } from "react";
import { SegmentedControl } from "@/components";
import { InventoryShell } from "../components/InventoryShell";
import { ValuationReport } from "./components/ValuationReport";
import { CostOfSalesReport } from "./components/CostOfSalesReport";

type Report = 'valuation' | 'cost-of-sales';

const PageInventoryReports = () => {
    const [report, setReport] = useState<Report>('valuation');

    return (
        <InventoryShell title="Reportes de inventario" subTitle="Valorización y costo de ventas">
            <div className="mt-4">
                <SegmentedControl
                    label="Reporte"
                    name="report"
                    value={report}
                    options={[
                        { label: 'Valorización', value: 'valuation' },
                        { label: 'Costo de ventas', value: 'cost-of-sales' },
                    ]}
                    onChange={setReport}
                />
            </div>
            {report === 'valuation' ? <ValuationReport /> : <CostOfSalesReport />}
        </InventoryShell>
    );
};

export default PageInventoryReports;
