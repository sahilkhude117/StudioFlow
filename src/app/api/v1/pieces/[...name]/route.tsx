

import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest, 
  { params }: { params: { slug: string } }
) => {
  try {

    const data = {
        "id": "M15FESk9gyPWXIQahQmoV",
        "created": "2023-06-05T19:25:51.228Z",
        "updated": "2023-06-10T21:33:51.175Z",
        "name": "@activepieces/piece-mailchimp",
        "authors": [],
        "displayName": "Mailchimp",
        "logoUrl": "https://cdn.activepieces.com/pieces/mailchimp.png",
        "projectUsage": 1,
        "description": "",
        "projectId": null,
        "platformId": null,
        "version": "0.2.2",
        "minimumSupportedRelease": "0.0.0",
        "maximumSupportedRelease": "99999.99999.9999",
        "auth": null,
        "actions": {
            "add_member_to_list": {
                "name": "add_member_to_list",
                "displayName": "Add Member to an Audience (List)",
                "description": "Add a member to an existing Mailchimp audience (list)",
                "props": {
                    "authentication": {
                        "description": "",
                        "displayName": "Authentication",
                        "authUrl": "https://login.mailchimp.com/oauth2/authorize",
                        "tokenUrl": "https://login.mailchimp.com/oauth2/token",
                        "required": true,
                        "scope": [],
                        "type": "OAUTH2"
                    },
                    "email": {
                        "displayName": "Email",
                        "description": "Email of the new contact",
                        "required": true,
                        "type": "SHORT_TEXT"
                    },
                    "list_id": {
                        "displayName": "Audience",
                        "refreshers": [
                            "authentication"
                        ],
                        "description": "Audience you want to add the contact to",
                        "required": true,
                        "type": "DROPDOWN"
                    },
                    "status": {
                        "displayName": "Status",
                        "required": true,
                        "options": {
                            "disabled": false,
                            "options": [
                                {
                                    "label": "Subscribed",
                                    "value": "subscribed"
                                },
                                {
                                    "label": "Unsubscribed",
                                    "value": "unsubscribed"
                                },
                                {
                                    "label": "Cleaned",
                                    "value": "cleaned"
                                },
                                {
                                    "label": "Pending",
                                    "value": "pending"
                                },
                                {
                                    "label": "Transactional",
                                    "value": "transactional"
                                }
                            ]
                        },
                        "type": "STATIC_DROPDOWN"
                    }
                },
                "sampleData": {}
            }
        },
        "triggers": {
            "subscribe": {
                "name": "subscribe",
                "displayName": "Member Subscribed to Audience",
                "description": "Runs when an Audience subscriber is added.",
                "props": {
                    "authentication": {
                        "description": "",
                        "displayName": "Authentication",
                        "authUrl": "https://login.mailchimp.com/oauth2/authorize",
                        "tokenUrl": "https://login.mailchimp.com/oauth2/token",
                        "required": true,
                        "scope": [],
                        "type": "OAUTH2"
                    },
                    "list_id": {
                        "displayName": "Audience",
                        "refreshers": [
                            "authentication"
                        ],
                        "description": "Audience you want to add the contact to",
                        "required": true,
                        "type": "DROPDOWN"
                    }
                },
                "type": "WEBHOOK",
                "sampleData": {
                    "type": "subscribe",
                    "fired_at": "2009-03-26 21:35:57",
                    "data": {
                        "id": "8a25ff1d98",
                        "list_id": "a6b5da1054",
                        "email": "api@mailchimp.com",
                        "email_type": "html",
                        "ip_opt": "10.20.10.30",
                        "ip_signup": "10.20.10.30",
                        "merges": {
                            "EMAIL": "api@mailchimp.com",
                            "FNAME": "Mailchimp",
                            "LNAME": "API",
                            "INTERESTS": "Group1,Group2"
                        }
                    }
                },
                "testStrategy": "SIMULATION"
            }
        },
        "pieceType": "OFFICIAL",
        "categories": null,
        "packageType": "REGISTRY",
        "archiveId": null
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

