import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GridFSBucket } from "mongodb";
import pdfParse from "pdf-parse/lib/pdf-parse.js";

export async function POST(req: NextRequest) {
  try {
    console.log("Starting file upload process...");
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log("No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.log("No file provided in formData");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("File received:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    const buffer = await file.arrayBuffer();
    const bytes = Buffer.from(buffer);

    // Get page count for PDF files
    let pageCount: number | undefined;
    if (file.type === "application/pdf") {
      try {
        console.log("Attempting to parse PDF...");
        const dataBuffer = Buffer.from(await file.arrayBuffer());
        const pdfData = await pdfParse(dataBuffer);
        pageCount = pdfData.numpages;
        console.log("PDF parsed successfully, pages:", pageCount);
      } catch (error) {
        console.error("Error parsing PDF:", error);
        // Don't fail the upload if PDF parsing fails
      }
    }

    try {
      console.log("Connecting to MongoDB...");
      const client = await clientPromise;
      const db = client.db("pexl_files");
      const bucket = new GridFSBucket(db, {
        bucketName: "uploads",
      });

      const userEmail = session.user?.email || undefined;
      console.log("Preparing file upload for user:", userEmail);

      // Create a write stream to store the file
      const uploadStream = bucket.openUploadStream(file.name, {
        metadata: {
          originalName: file.name,
          size: file.size,
          type: file.type,
          userId: userEmail,
          uploadDate: new Date(),
          pageCount,
        },
      });

      // Write the file to GridFS and properly wait for it to finish
      return new Promise((resolve, reject) => {
        uploadStream.on('error', (error) => {
          console.error("GridFS upload error:", error);
          reject(NextResponse.json(
            { error: "Failed to upload file to database" },
            { status: 500 }
          ));
        });
        
        uploadStream.on('finish', () => {
          console.log("GridFS upload completed successfully with ID:", uploadStream.id.toHexString());
          resolve(NextResponse.json({
            success: true,
            fileId: uploadStream.id,
            file: {
              filename: file.name,
              contentType: file.type,
              size: file.size,
              uploadDate: new Date(),
              userId: userEmail,
              pageCount,
            },
          }));
        });

        // Write the file data and end the stream
        uploadStream.write(bytes);
        uploadStream.end();
      });

    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        {
          error: "Database error during upload",
          details: dbError instanceof Error ? dbError.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: "Error uploading file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
