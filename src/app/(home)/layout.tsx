import { DashboardContainer } from "../components/dashboard-container";

export default function ({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <DashboardContainer>
                {children}
            </DashboardContainer>
        </div>
    )
}