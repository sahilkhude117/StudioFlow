import { api } from './api';

export type FlagsMap = Record<string, boolean | string | object | undefined>;

export const flagsApi = {
  getAll() {
    return new Promise<{ data: FlagsMap }>((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            USER_CREATED: true,
            ENVIRONMENT: "prod",
            SHOW_POWERED_BY_IN_FORM: true,
            PIECES_SYNC_MODE: "NONE",
            EXECUTION_DATA_RETENTION_DAYS: "30",
            CLOUD_AUTH_ENABLED: true,
            PROJECT_LIMITS_ENABLED: false,
            EDITION: "cloud",
            SHOW_BILLING: true,
            THIRD_PARTY_AUTH_PROVIDERS_TO_SHOW_MAP: {
              google: true,
            },
            THIRD_PARTY_AUTH_PROVIDER_REDIRECT_URL:
              "https://cloud.activepieces.com/redirect",
            EMAIL_AUTH_ENABLED: true,
            THEME: {
              websiteName: "Activepieces",
              colors: {
                avatar: "#515151",
                "blue-link": "#1890ff",
                danger: "#f94949",
                primary: {
                  default: "#6e41e2",
                  dark: "#6738e1",
                  light: "#eee8fc",
                  medium: "#c6b4f4",
                },
                warn: {
                  default: "#f78a3b",
                  light: "#fff6e4",
                  dark: "#cc8805",
                },
                success: {
                  default: "#14ae5c",
                  light: "#3cad71",
                },
                selection: "#8964e7",
              },
              logos: {
                fullLogoUrl: "https://cdn.activepieces.com/brand/full-logo.png",
                favIconUrl: "https://cdn.activepieces.com/brand/favicon.ico",
                logoIconUrl: "https://cdn.activepieces.com/brand/logo.svg",
              },
            },
            SHOW_COMMUNITY: true,
            PRIVATE_PIECES_ENABLED: true,
            PRIVACY_POLICY_URL: "https://www.activepieces.com/privacy",
            TERMS_OF_SERVICE_URL: "https://www.activepieces.com/terms",
            TELEMETRY_ENABLED: true,
            PUBLIC_URL: "https://cloud.activepieces.com/",
            FLOW_RUN_TIME_SECONDS: "600",
            FLOW_RUN_MEMORY_LIMIT_KB: "1048576",
            PAUSED_FLOW_TIMEOUT_DAYS: "30",
            WEBHOOK_TIMEOUT_SECONDS: "30",
            CURRENT_VERSION: "0.48.5",
            LATEST_VERSION: "0.48.5",
            ALLOW_NPM_PACKAGES_IN_CODE_STEP: true,
            WEBHOOK_URL_PREFIX: "https://cloud.activepieces.com/api/v1/webhooks",
            SUPPORTED_APP_WEBHOOKS: [
              "slack",
              "@activepieces/piece-slack",
              "square",
              "@activepieces/piece-square",
              "nifty",
              "@activepieces/piece-nifty",
              "facebook-leads",
              "@activepieces/piece-facebook-leads",
            ],
          },
        });
      }, 300); // Simulating network delay (300ms)
    });
  },
};
