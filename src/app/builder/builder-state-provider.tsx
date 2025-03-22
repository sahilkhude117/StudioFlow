'use client'
import { useRef } from "react";
import { BuilderInitialState, BuilderStateContext, BuilderStore, createBuilderStore } from "./builder-hooks";
import { useSearchParams } from "next/navigation";
import { NEW_FLOW_QUERY_PARAM } from "@/lib/utils";

type BuilderStateProviderProps = React.PropsWithChildren<BuilderInitialState>;

export function BuilderStateProvider({
    children,
    sampleData,
    sampleDataInput,
    ...props
}: BuilderStateProviderProps) {
    const storeRef = useRef<BuilderStore | null>(null);
    const checkAccess = true;
    const readonly = false;
    const searchParams = useSearchParams();
    if (!storeRef.current) {
        storeRef.current = createBuilderStore(
            {
                ...props,
                readonly,
                sampleData,
                sampleDataInput
            },
            searchParams.get(NEW_FLOW_QUERY_PARAM) === "true",
        );
    }

    return (
        <BuilderStateContext.Provider value={storeRef.current}>
            {children}
        </BuilderStateContext.Provider>
    )
}