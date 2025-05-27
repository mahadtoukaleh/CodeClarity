import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Resend } from 'resend'
import { format } from 'date-fns'

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, subject, plan, message, date, time } = body

    // Format the date for display
    const formattedDate = date ? format(new Date(date), 'MMMM do, yyyy') : 'Not specified'

    // Log the submission
    console.log('Form submission:', {
      firstName,
      lastName,
      email,
      subject,
      plan,
      message,
      date: formattedDate,
      time,
      timestamp: new Date().toISOString()
    })

    // Send email notification
    const { data, error } = await resend.emails.send({
      from: 'CodeClarity <onboarding@resend.dev>',
      to: ['codeclarityteam@gmail.com'],
      subject: 'New Booking Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Booking Request</h2>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Plan:</strong> ${plan}</p>
            <p><strong>Preferred Date:</strong> ${formattedDate}</p>
            <p><strong>Preferred Time:</strong> ${time || 'Not specified'}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <div style="margin-top: 20px; padding: 15px; background: #f0f9ff; border-radius: 8px; border: 1px solid #bae6fd;">
            <h3 style="color: #0369a1; margin-top: 0;">Next Steps</h3>
            <ol style="margin: 0; padding-left: 20px;">
              <li>Review the booking request details above</li>
              <li>Confirm availability for the requested date and time</li>
              <li>Send a confirmation email to the student</li>
              <li>Add the session to your calendar</li>
            </ol>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('Email sending error:', error)
      return NextResponse.json(
        { 
          success: false,
          message: 'Failed to send notification email'
        },
        { status: 500 }
      )
    }

    // Send confirmation email to the student
    const { error: studentEmailError } = await resend.emails.send({
      from: 'CodeClarity <onboarding@resend.dev>',
      to: [email],
      subject: 'Your CodeClarity Consultation Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Thank You for Your Interest!</h2>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>Hi ${firstName},</p>
            <p>Thank you for requesting a consultation with CodeClarity. We've received your booking request for:</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${time || 'Not specified'}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p>We'll review your request and get back to you within 24 hours to confirm your session.</p>
            <p>If you have any questions in the meantime, feel free to reply to this email.</p>
          </div>
          <div style="margin-top: 20px; padding: 15px; background: #f0f9ff; border-radius: 8px; border: 1px solid #bae6fd;">
            <h3 style="color: #0369a1; margin-top: 0;">What to Expect</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Confirmation of your session time</li>
              <li>Meeting link (for online sessions)</li>
              <li>Brief questionnaire to help us prepare</li>
            </ul>
          </div>
        </div>
      `,
    })

    if (studentEmailError) {
      console.error('Student confirmation email error:', studentEmailError)
      // Don't return error here as the main submission was successful
    }

    return NextResponse.json({ 
      success: true,
      message: 'Form submitted successfully'
    })
  } catch (error) {
    console.error('Form submission error:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Something went wrong. Please try again.'
      },
      { status: 500 }
    )
  }
} 