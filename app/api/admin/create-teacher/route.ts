import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Security: Only allow in development or with secret header
  const authHeader = request.headers.get('x-admin-secret');
  const expectedSecret = process.env.ADMIN_CREATE_SECRET || 'demo-create-teacher-2024';

  if (authHeader !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceRoleKey || !supabaseUrl) {
    return NextResponse.json({ error: 'Missing Supabase config' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const body = await request.json();
    const email = body.email || 'teacher@demo.com';
    const password = body.password || 'demo123456';
    const fullName = body.full_name || 'Cô Trinh';
    const username = body.username || 'cotrinh';

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(u => u.email === email);

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      // Update password
      await supabase.auth.admin.updateUserById(userId, { password });
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });
      if (createError) throw createError;
      userId = newUser.user.id;
    }

    // Upsert profile (profiles table doesn't have email column)
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: fullName,
        role: 'teacher',
        username,
      }, { onConflict: 'id' });

    if (profileError) throw profileError;

    return NextResponse.json({
      success: true,
      message: 'Teacher account created/updated',
      credentials: { email, password },
      userId,
    });
  } catch (error: any) {
    console.error('Create teacher error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}