'use server';

import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { RegisterResponse, RegisterUserInput } from "@/types";

export async function registerUser(formData: FormData): Promise<RegisterResponse> {
  if (!formData) {
    return { success: false, error: "Form data is required" };
  }

  try {
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');

    if (!name || !email || !password) {
      return { success: false, error: "All fields are required" };
    }

    const userData: RegisterUserInput = {
      name: String(name).trim(),
      email: String(email).toLowerCase(),
      password: String(password)
    };

    if (userData.name.length < 2) {
      return { success: false, error: "Name must be at least 2 characters long" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return { success: false, error: "Invalid email format" };
    }

    if (userData.password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long" };
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
      select: { id: true }
    });

    if (existingUser) {
      return { success: false, error: "Email already registered" };
    }

    // Hash password
    const hashedPassword = await hash(userData.password, 12);

    // Create user with properly structured data object
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: "user"
      },
      select: {
        id: true
      }
    });

    return { 
      success: true, 
      userId: user.id 
    };

  } catch (error) {
    console.error("Registration error:", error);
    return { 
      success: false,
      error: "An error occurred during registration. Please try again." 
    };
  }
}