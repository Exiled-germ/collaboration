import { supabase } from "@/integrations/supabase/client";

export interface EmailInvite {
  to: string;
  subject: string;
  html: string;
  phaseId: string;
  phaseName: string;
  targetUser: string;
}

export async function sendInviteEmail(invite: EmailInvite) {
  try {
    console.log('📧 Sending email via Supabase Function:', {
      to: invite.to,
      subject: invite.subject,
      phase: invite.phaseName,
    });

    // Call Supabase Edge Function
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: invite.to,
        subject: invite.subject,
        html: invite.html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Email function error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    console.log('✅ Email sent successfully:', data);
    
    return { success: true, data };
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    
    // Fallback: Log email to console
    console.log('📧 [FALLBACK] Email would have been sent to:', {
      to: invite.to,
      subject: invite.subject,
      phase: invite.phaseName,
    });
    
    return { success: false, error };
  }
}

export function generateInviteEmailHTML(
  targetUser: string,
  phaseName: string,
  inviteMessage: string,
  reason: string,
  projectName: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PhaseFlow Collaboration Invite</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 10px;
    }
    .phase-badge {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      margin: 20px 0;
    }
    .message-box {
      background-color: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .reason-box {
      background-color: #e8f4f8;
      border-left: 4px solid #17a2b8;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
      text-align: center;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      color: #666;
      font-size: 14px;
    }
    h1 {
      color: #333;
      font-size: 24px;
      margin-bottom: 10px;
    }
    h2 {
      color: #667eea;
      font-size: 18px;
      margin-top: 0;
    }
    p {
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">✨ PhaseFlow</div>
      <p style="color: #666;">AI-Powered Project Collaboration</p>
    </div>

    <h1>안녕하세요, ${targetUser}님! 👋</h1>
    
    <p>
      <strong>${projectName}</strong> 프로젝트에서 당신의 협업이 필요합니다.
    </p>

    <div class="phase-badge">
      📋 ${phaseName}
    </div>

    <div class="message-box">
      <h2>AI가 전하는 메시지</h2>
      <p>${inviteMessage}</p>
    </div>

    <div class="reason-box">
      <h2>💡 왜 당신이 필요한가요?</h2>
      <p>${reason}</p>
    </div>

    <div style="text-align: center;">
      <a href="${window.location.origin}/dashboard" class="button">
        대시보드에서 확인하기 →
      </a>
    </div>

    <div class="footer">
      <p>
        이 초대는 AI가 프로젝트 요구사항과 팀원 프로필을 분석하여 자동으로 생성되었습니다.
      </p>
      <p style="margin-top: 20px;">
        <strong>PhaseFlow v2.0</strong><br>
        Built with ❤️ for PMs
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

export async function sendBatchInvites(
  invites: Array<{
    target_user: string;
    target_email: string;
    invite_message: string;
    reason: string;
    phase_name: string;
  }>,
  projectName: string
) {
  const results = await Promise.allSettled(
    invites.map(invite =>
      sendInviteEmail({
        to: invite.target_email,
        subject: `[PhaseFlow] ${projectName} - ${invite.phase_name} 협업 초대`,
        html: generateInviteEmailHTML(
          invite.target_user,
          invite.phase_name,
          invite.invite_message,
          invite.reason,
          projectName
        ),
        phaseId: '',
        phaseName: invite.phase_name,
        targetUser: invite.target_user,
      })
    )
  );

  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return { successful, failed, total: invites.length };
}
