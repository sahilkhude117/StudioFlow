import { useEffect } from "react";
import {
    Route,
    Routes as ReactRouterRoutes,
    Navigate,
    useNavigate,
} from 'react-router-dom';

import * as URLS from 'config/urls'
import Layout from 'components/Layout';
import PublicLayout from 'components/PublicLayout';
import useStudioFlowConfig from "hooks/useStudioFlowConfig";
import useStudioFlowInfo from "hooks/useStudioFlowInfo";
import useAuthentication from "hooks/useAuthentication";
import Executions from 'pages/Executions';
import Execution from 'pages/Execution';
import Flows from "pages/Flows";
import Applications from "pages/Applications";
import Application from "pages/Application";
import EditorRoutes from "pages/Editor/routes";
import Login from "pages/Login";
import SignUp from "pages/SignUp/index.ee";

function Routes() {
    const { data: studioFlowInfo, isSuccess } = useStudioFlowInfo();
    const { data: configData } = useStudioFlowConfig();
    const { isAuthenticated } = useAuthentication();

    const installed = isSuccess
    ? studioFlowInfo.data.installationCompleted
    : true;
    const navigate = useNavigate();

    useEffect(() => {
        if (!installed){
            navigate(URLS.INSTALLATION, { replace: true});
        }
    }, [])

    return (
        <ReactRouterRoutes>
            <Route
                path={URLS.EXECUTIONS}
                element={
                    <Layout>
                        <Executions/>
                    </Layout>
                }
            />

            <Route
                path={URLS.EXECUTION_PATTERN}
                element={
                    <Layout>
                        <Execution/>
                    </Layout>
                }
            />

            <Route
                path={`${URLS.FLOWS}/*`}
                element={
                    <Layout>
                        <Flows/>
                    </Layout>
                }
            />

            <Route
                path={`${URLS.APPS}/*`}
                element={
                    <Layout>
                        <Applications/>
                    </Layout>
                }
            />

            <Route
                path={`${URLS.APP_PATTERN}/*`}
                element={
                    <Layout>
                        <Application/>
                    </Layout>
                }
            />

            <Route
                path={`${URLS.EDITOR}/*`}
                element={
                    <EditorRoutes/>
                }
            />

            <Route
                path={URLS.LOGIN}
                element={
                    <PublicLayout>
                        <Login/>
                    </PublicLayout>
                }
            />

            <Route
                path={URLS.LOGIN_CALLBACK}
                element={
                    <LoginCallback/>
                }
            />

            <Route
                path={URLS.SIGNUP}
                element={
                    <PublicLayout>
                        <SignUp/>
                    </PublicLayout>
                }
            />

        </ReactRouterRoutes>
    )
}

export default <Routes/>