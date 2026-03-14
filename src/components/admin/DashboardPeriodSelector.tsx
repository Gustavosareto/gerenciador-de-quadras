"use client";

import { useState } from "react";
import { Select } from "@/components/ui/Select";

export function DashboardPeriodSelector() {
    const [period, setPeriod] = useState("30_days");

    return (
        <div className="w-full sm:w-[180px]">
            <Select
                value={period}
                onChange={setPeriod}
                options={[
                    { label: "Últimos 30 dias", value: "30_days" },
                    { label: "Esta semana", value: "this_week" },
                    { label: "Este ano", value: "this_year" }
                ]}
            />
        </div>
    );
}
