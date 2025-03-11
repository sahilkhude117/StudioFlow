import appConfig from "../config/app";

const appInfoConverter = (rawAppData:any) => {
    rawAppData.iconUrl = rawAppData.iconUrl.replace(
        '{BASE_URL}',
        appConfig.baseUrl
    )

    rawAppData.authDocUrl = rawAppData.authDocUrl.replace(
        '{DOCS_URL}',
        appConfig.docsUrl
    );

    if (rawAppData.auth?.fields) {
        rawAppData.auth.fields = rawAppData.auth.fields.map((field:any) => {
            if (field.type === 'string' && typeof field.value === 'string') {
                return {
                    ...field,
                    value: field.value.replace('{WEB_APP_URL}', appConfig.webAppUrl),
                };
            }
            return field;
        });
    }

    return rawAppData;
};

export default appInfoConverter;