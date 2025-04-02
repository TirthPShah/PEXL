import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GridFSBucket, ObjectId } from "mongodb";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fileId = params.fileId;
    if (!fileId) {
      return NextResponse.json(
        { error: "No file ID provided" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("pexl");
    const bucket = new GridFSBucket(db, {
      bucketName: "uploads",
    });

    // First, verify that the file belongs to the user
    const file = await db.collection("uploads.files").findOne({
      _id: new ObjectId(fileId),
      "metadata.userId": session.user?.email,
    });

    if (!file) {
      return NextResponse.json(
        { error: "File not found or unauthorized" },
        { status: 404 }
      );
    }

    // Delete the file from GridFS
    await bucket.delete(new ObjectId(fileId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Error deleting file" }, { status: 500 });
  }
}
