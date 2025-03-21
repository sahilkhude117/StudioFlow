import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest, 
  { params }: { params: { slug: string } }
) => {
  try {
    const sampleData = {}
    return NextResponse.json(sampleData, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch product details" },
      { status: 500 }
    );
  }
};

export const POST = async (
    req: NextRequest, 
    { params }: { params: { slug: string } }
  ) => {
    try {
      const sampleData = {}
      return NextResponse.json(sampleData, { status: 200 });
    } catch (e) {
      console.error(e);
      return NextResponse.json(
        { error: "Failed to fetch product details" },
        { status: 500 }
      );
    }
};
