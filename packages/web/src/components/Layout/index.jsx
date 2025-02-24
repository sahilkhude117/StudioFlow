import * as React from 'react';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Stack from '@mui/material/Stack';
import AppsIcon from '@mui/icons-material/Apps';
import SwapCallsIcon from '@mui/icons-material/SwapCalls';
import HistoryIcon from '@mui/icons-material/History';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PropTypes from 'prop-types';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import SecurityIcon from '@mui/icons-material/Security';

import * as URLS from 'config/urls';
import useVersion from 'hooks/useVersion';
import useStudioFlowConfig from 'hooks/useStudioFlowConfig';
import useFormatMessage from 'hooks/useFormatMessage';
import AppBar from 'components/Appbar';
import Drawer from 'components/Drawer';

const additionalDrawerLinkIcons = {
    Security: SecurityIcon,
    ArrowBackIosNew: ArrowBackIosNewIcon
};

const drawerLinks = [
    {
      Icon: SwapCallsIcon,
      primary: 'drawer.flows',
      to: URLS.FLOWS,
      dataTest: 'flows-page-drawer-link',
    },
    {
      Icon: AppsIcon,
      primary: 'drawer.apps',
      to: URLS.APPS,
      dataTest: 'apps-page-drawer-link',
    },
    {
      Icon: HistoryIcon,
      primary: 'drawer.executions',
      to: URLS.EXECUTIONS,
      dataTest: 'executions-page-drawer-link',
    },
];

const generateDrawerBottomLinks = async ({
    disableNotificationsPage,
    notificationBadgeContent,
    additionalDrawerLink,
    additionalDrawerLinkIcon,
    additionalDrawerLinkText,
    formatMessage,
}) => {
    const notificationsPageLinkObject = {
        Icon: NotificationsIcon,
        primary: formatMessage('settingsDrawer.notifications'),
        to: URLS.UPDATES,
        badgeContent: notificationBadgeContent,
    }

    const hasAdditionalDrawerLink =
        additionalDrawerLink && additionalDrawerLinkText;

    const additionalDrawerLinkObject = {
        Icon:
            additionalDrawerLinkIcons[additionalDrawerLinkIcon] ||
            ArrowBackIosNewIcon,
        primary: additionalDrawerLinkText || '',
        to: additionalDrawerLink || '',
        target: '_blank'
    };

    const links = [];

    if (!disableNotificationsPage) {
        links.push(notificationsPageLinkObject);
    }

    return links;
};

function Layout({ children }) {
    const version = useVersion();
    const { data: configData, isLoading} = useStudioFlowConfig();
    const config = configData?.data;

    const theme = useTheme();
    const formatMessage = useFormatMessage();
    const [bottomLinks, setBottomLinks] = React.useState([]);
    const matchSmallScreens = useMediaQuery(theme.breakpoints.down('lg'));
    const [isDrawerOpen, setDrawerOpen] = React.useState(!matchSmallScreens);
    const openDrawer = () => setDrawerOpen(true);
    const closeDrawer = () => setDrawerOpen(false);

    React.useEffect(() => {
        async function perform() {
            const newBottomLinks = await generateDrawerBottomLinks({
                notificationBadgeContent: version.newVersionCount,
                disableNotificationsPage: config?.disableNotificationsPage,
                additionalDrawerLink: config?.additionalDrawerLink,
                additionalDrawerLinkIcon: config?.additionalDrawerLinkIcon,
                additionalDrawerLinkText: config?.additionalDrawerLinkText,
                formatMessage,
            });
            setBottomLinks(newBottomLinks);
        }
        if (isLoading) return;

        perform();
    },[config, isLoading, version.newVersionCount]);

    return (
        <>
            <AppBar
                drawerOpen={isDrawerOpen}
                onDrawerOpen={openDrawer}
                onDrawerClose={closeDrawer}
            />

            <Box
                sx={{
                    display: 'flex',
                    flex: 1,
                }}
            >
                <Drawer
                    links={drawerLinks}
                    bottomLinks={bottomLinks}
                    open={isDrawerOpen}
                    onOpen={openDrawer}
                    onClose={closeDrawer}
                />

                <Stack flex={1}>
                    <Toolbar/>
                    {children}
                </Stack>
            </Box>
        </>
    )
}

PublicLayout.propTypes = {
    children: PropTypes.node.isRequired,
};
  
export default Layout;