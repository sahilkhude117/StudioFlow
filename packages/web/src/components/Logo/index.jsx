const { default: CustomLogo } = require("components/CustomLogo/index.ee");
const { default: DefaultLogo } = require("components/DefaultLogo");
const { default: useStudioFlowConfig } = require("hooks/useStudioFlowConfig")

const Logo = () => {
    const { data: configData, isLoading} = useStudioFlowConfig();
    const config = configData?.data;
    const logoSvgData = config?.logoSvgData;

    if ( isLoading && !logoSvgData ) return <React.Fragment/>;

    if(logoSvgData) return <CustomLogo/>;

    return <DefaultLogo/>;
}

export default Logo;