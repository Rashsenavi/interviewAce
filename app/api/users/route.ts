import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";

// GET all users
export async function GET() {
  try {
    const allUsers = await db.select().from(users);
    return NextResponse.json(allUsers);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST create new user
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body?.email || !body?.passwordHash || !body?.firstName || !body?.lastName) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: email, passwordHash, firstName, and lastName are required",
        },
        { status: 400 }
      );
    }

    const allowedUserTypes = new Set(["job_seeker", "interviewer", "admin"]);
    const userType = allowedUserTypes.has(body.userType) ? body.userType : "job_seeker";

    const newUser = await db.insert(users).values({
      email: body.email,
      passwordHash: body.passwordHash,
      firstName: body.firstName,
      lastName: body.lastName,
      phoneNumber: body.phoneNumber,
      userType,
    }).returning();

    return NextResponse.json(newUser[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
