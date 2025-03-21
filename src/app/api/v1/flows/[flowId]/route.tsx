import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest, 
  { params }: { params: { slug: string } }
) => {
  try {
    const data = {
      "id": "RhbXkfGiryjUhuLPpr5LM",
      "created": "2025-03-19T10:28:09.919Z",
      "updated": "2025-03-19T10:28:09.919Z",
      "projectId": "xrUEh4rDSAtit1zjqdqCd",
      "status": "DISABLED",
      "version": {
          "id": "EGTks1ljJud4Npi6sn33Y",
          "created": "2025-03-19T10:28:09.937Z",
          "updated": "2025-03-19T10:28:10.324Z",
          "flowId": "RhbXkfGiryjUhuLPpr5LM",
          "displayName": "Send ChatGPT welcome email to MailChimp new subscribers",
          "trigger": {
              "name": "trigger",
              "valid": false,
              "displayName": "Member Subscribed to Audience",
              "type": "PIECE_TRIGGER",
              "settings": {
                  "pieceName": "@activepieces/piece-mailchimp",
                  "pieceVersion": "~0.2.1",
                  "pieceType": "OFFICIAL",
                  "packageType": "REGISTRY",
                  "input": {
                      "list_id": "2ae2f814cd"
                  },
                  "inputUiInfo": {},
                  "triggerName": "subscribe"
              }
          },
          "valid": false,
          "state": "DRAFT",
          "updatedBy": "1FtjkqDCcdpG1qpCuJp6z",
          "schemaVersion": "1"
      },
      "externalId": null,
      "folderId": null,
      "schedule": null,
      "publishedVersionId": null
    };

    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch product details" },
      { status: 500 }
    );
  }
};
