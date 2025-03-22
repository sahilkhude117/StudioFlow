
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest, 
  { params }: { params: { slug: string } }
) => {
  try {

    const data = {
        "id": "bkRM3FkkyIvFkBnPHxTez",
        "created": "2025-03-15T06:15:54.859Z",
        "updated": "2025-03-15T06:15:54.859Z",
        "ownerId": "1FtjkqDCcdpG1qpCuJp6z",
        "name": "sahil's Platform",
        "primaryColor": "#6e41e2",
        "logoIconUrl": "https://cdn.activepieces.com/brand/logo.svg",
        "fullLogoUrl": "https://cdn.activepieces.com/brand/full-logo.png",
        "favIconUrl": "https://cdn.activepieces.com/brand/favicon.ico",
        "filteredPieceNames": [],
        "filteredPieceBehavior": "BLOCKED",
        "cloudAuthEnabled": true,
        "analyticsEnabled": false,
        "showPoweredBy": false,
        "environmentsEnabled": false,
        "auditLogEnabled": false,
        "embeddingEnabled": false,
        "managePiecesEnabled": false,
        "manageTemplatesEnabled": false,
        "customAppearanceEnabled": false,
        "manageProjectsEnabled": false,
        "projectRolesEnabled": false,
        "customDomainsEnabled": false,
        "globalConnectionsEnabled": false,
        "customRolesEnabled": false,
        "apiKeysEnabled": false,
        "flowIssuesEnabled": true,
        "alertsEnabled": false,
        "ssoEnabled": false,
        "enforceAllowedAuthDomains": false,
        "allowedAuthDomains": [],
        "emailAuthEnabled": true,
        "pinnedPieces": [],
        "federatedAuthProviders": {},
        "defaultLocale": "en",
        "copilotSettings": {},
        "smtp": null,
        "hasLicenseKey": false
    }

    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch platform details" },
      { status: 500 }
    );
  }
};

