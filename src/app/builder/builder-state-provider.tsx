import { BuilderInitialState } from "./builder-hooks";

type BuilderStateProviderProps = React.PropsWithChildren<BuilderInitialState>;

export function BuilderStateProvider({
    children,
    sampleData,
    sampleDataInput,
    ...props
}: BuilderStateProviderProps) {
    
}