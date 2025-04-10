import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { GridFSBucket, ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const fileId = params.fileId;
    console.log("File ID:", fileId);
    
    if (!fileId) {
      return NextResponse.json({ error: "No file ID provided" }, { status: 400 });
    }
    
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("pexl_files");
    const bucket = new GridFSBucket(db, { bucketName: "uploads" });

    // Get file info to verify permissions
    const fileInfo = await db
      .collection("uploads.files")
      .findOne({ _id: new ObjectId(fileId) });

    if (!fileInfo) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Stream the file from GridFS
    const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));
    
    // Convert to a format that can be used by NextResponse
    const chunks: Buffer[] = [];
    
    // Return a streaming response
    return new Promise<NextResponse>((resolve, reject) => {
      downloadStream.on("data", (chunk) => {
        chunks.push(Buffer.from(chunk));
      });
      
      downloadStream.on("error", (err) => {
        console.error("Error streaming file:", err);
        resolve(NextResponse.json({ error: "Error streaming file" }, { status: 500 }));
      });
      
      downloadStream.on("end", () => {
        const buffer = Buffer.concat(chunks);
        
        // Create response with appropriate headers
        const response = new NextResponse(buffer);
        
        // Set content-type from file info
        response.headers.set("Content-Type", fileInfo.contentType || "application/octet-stream");
        
        // Set disposition to attachment with the original filename
        response.headers.set(
          "Content-Disposition", 
          `attachment; filename="${encodeURIComponent(fileInfo.filename)}"`
        );
        
        resolve(response);
      });
    });
    
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Error downloading file" },
      { status: 500 }
    );
  }
}