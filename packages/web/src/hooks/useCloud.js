import { useNavigate } from "react-router-dom";
import useStudioFlowInfo from "./useStudioFlowInfo";

export default function useCloud(options) {
    const redirect = options?.redirect || false;
    const navigate = useNavigate();

    const { data : studioFlowInfo } = useStudioFlowInfo();

    const isCloud = studioFlowInfo?.data.isCloud;

    if (isCloud === false && redirect){
        navigate('/');
    }

    return isCloud;
}