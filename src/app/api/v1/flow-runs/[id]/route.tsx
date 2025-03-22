
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest, 
  { params }: { params: { slug: string } }
) => {
  try {

    const data = {"data":[],"next":null,"previous":null}

    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch platform details" },
      { status: 500 }
    );
  }
};

