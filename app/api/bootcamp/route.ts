import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      ageGroup,
      parentName,
      parentEmail,
      parentPhone,
    } = body

    // Send notification email to admin
    await resend.emails.send({
      from: 'CodeClarity <onboarding@resend.dev>',
      to: 'codeclarityteam@gmail.com',
      subject: 'New Bootcamp Registration',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Bootcamp Registration</h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Student Information:</h3>
            <p><strong>Name:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Age Group:</strong> ${ageGroup === 'kids' ? 'Kids (9-13)' : 'Teens (14+)'}</p>
            <p><strong>Session Time:</strong> ${ageGroup === 'kids' ? 'Saturdays at 11AM' : 'Saturdays at 3PM'}</p>
          </div>

          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Parent/Guardian Information:</h3>
            <p><strong>Name:</strong> ${parentName}</p>
            <p><strong>Email:</strong> ${parentEmail}</p>
            <p><strong>Phone:</strong> ${parentPhone}</p>
          </div>

          <h3 style="color: #1e40af;">Next Steps:</h3>
          <ol>
            <li>Add student to the appropriate class roster</li>
            <li>Send welcome package</li>
            <li>Schedule initial assessment call</li>
          </ol>
        </div>
      `,
    })

    return NextResponse.json(
      { message: 'Registration successful' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Bootcamp registration error:', error)
    return NextResponse.json(
      { message: 'Error processing registration' },
      { status: 500 }
    )
  }
} 