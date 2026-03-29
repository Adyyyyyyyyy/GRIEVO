import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

MAIL_EMAIL = os.getenv("MAIL_EMAIL")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")


def send_email(to_email: str, subject: str, html_body: str):
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"GRIEVO Notifications <{MAIL_EMAIL}>"
        msg["To"] = to_email

        part = MIMEText(html_body, "html")
        msg.attach(part)

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(MAIL_EMAIL, MAIL_PASSWORD)
            server.sendmail(MAIL_EMAIL, to_email, msg.as_string())

        print(f"✅ Email sent to {to_email}")
        return True

    except Exception as e:
        print(f"❌ Email failed: {e}")
        return False


def notify_admin_new_grievance(admin_email: str, admin_name: str, grievance_id: int, category: str, department: str, priority: str):
    subject = f"[GRIEVO] New Grievance Assigned — #{grievance_id}"
    body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="background: linear-gradient(135deg, #3b82f6, #6366f1); padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">GRIEVO</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0;">Grievance Management System</p>
        </div>
        <div style="padding: 24px;">
            <p style="font-size: 16px; color: #374151;">Dear <strong>{admin_name}</strong>,</p>
            <p style="color: #6b7280;">A new grievance has been assigned to your domain.</p>
            <div style="background: #f3f4f6; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px; margin: 16px 0;">
                <p style="margin: 4px 0;"><strong>Grievance ID:</strong> #{grievance_id}</p>
                <p style="margin: 4px 0;"><strong>Category:</strong> {category}</p>
                <p style="margin: 4px 0;"><strong>Department:</strong> {department}</p>
                <p style="margin: 4px 0;"><strong>Priority:</strong> {priority}</p>
            </div>
            <p style="color: #6b7280;">Please log in to the GRIEVO portal to review and respond.</p>
        </div>
        <div style="background: #f9fafb; padding: 12px 24px; border-radius: 0 0 8px 8px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">GRIEVO — Student Grievance & Feedback Management System</p>
        </div>
    </div>
    """
    send_email("singh.adityac0928@gmail.com", subject, body)


def notify_student_status_update(student_email: str, grievance_id: int, category: str, new_status: str):
    subject = f"[GRIEVO] Grievance #{grievance_id} Status Updated"
    color = "#10b981" if new_status in ["Resolved", "Closed"] else "#f59e0b" if new_status == "In Progress" else "#3b82f6"
    body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">GRIEVO</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0;">Grievance Management System</p>
        </div>
        <div style="padding: 24px;">
            <p style="font-size: 16px; color: #374151;">Your grievance status has been updated.</p>
            <div style="background: #f3f4f6; border-left: 4px solid {color}; padding: 16px; border-radius: 4px; margin: 16px 0;">
                <p style="margin: 4px 0;"><strong>Grievance ID:</strong> #{grievance_id}</p>
                <p style="margin: 4px 0;"><strong>Category:</strong> {category}</p>
                <p style="margin: 4px 0;"><strong>New Status:</strong> <span style="color: {color}; font-weight: bold;">{new_status}</span></p>
            </div>
            <p style="color: #6b7280;">Log in to GRIEVO to view details and admin responses.</p>
            {'<p style="color: #10b981; font-weight: bold;">Your grievance has been resolved! Please submit your feedback.</p>' if new_status == 'Resolved' else ''}
        </div>
        <div style="background: #f9fafb; padding: 12px 24px; border-radius: 0 0 8px 8px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">GRIEVO — Student Grievance & Feedback Management System</p>
        </div>
    </div>
    """
    send_email(student_email, subject, body)


def notify_student_new_response(student_email: str, grievance_id: int, category: str, admin_name: str):
    subject = f"[GRIEVO] New Response on Grievance #{grievance_id}"
    body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">GRIEVO</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0;">Grievance Management System</p>
        </div>
        <div style="padding: 24px;">
            <p style="font-size: 16px; color: #374151;"><strong>{admin_name}</strong> has responded to your grievance.</p>
            <div style="background: #f3f4f6; border-left: 4px solid #10b981; padding: 16px; border-radius: 4px; margin: 16px 0;">
                <p style="margin: 4px 0;"><strong>Grievance ID:</strong> #{grievance_id}</p>
                <p style="margin: 4px 0;"><strong>Category:</strong> {category}</p>
            </div>
            <p style="color: #6b7280;">Log in to GRIEVO to read the full response.</p>
        </div>
        <div style="background: #f9fafb; padding: 12px 24px; border-radius: 0 0 8px 8px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">GRIEVO — Student Grievance & Feedback Management System</p>
        </div>
    </div>
    """
    send_email(student_email, subject, body)