import { Typography } from "@mui/material";
import * as React from 'react';
import { FormattedMessage } from "react-intl";
import useStudioFlowConfig from "hooks/useStudioFlowConfig";
import MationLogo from "components/MationLogo";

const DefaultLogo = () => {
    const { data: studioFlowInfo, isPending} = useStudioFlowConfig();
    const isMation = studioFlowInfo?.data.isMation;

    if(isPending) return <React.Fragment/>;
    if(isMation) return <MationLogo/>

    return (
        <Typography variant="h6" component="h1" data-test="typography-logo" noWrap>
            <FormattedMessage id="brandText"/>
        </Typography>
    );
};

export default DefaultLogo;