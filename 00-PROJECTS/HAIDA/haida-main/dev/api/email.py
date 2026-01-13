"""
HAIDA - Email Service Module
=============================

Servicio para envío de emails:
- Reset password
- Notificaciones de tests
- Alertas del sistema
- Invitaciones de equipo

Soporta múltiples proveedores:
- Gmail (desarrollo)
- SendGrid (producción recomendado)
- AWS SES (enterprise)
- Resend (moderno)
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class EmailService:
    """Servicio de envío de emails con soporte multi-proveedor"""

    def __init__(self):
        self.smtp_host = os.getenv('SMTP_HOST', '')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.smtp_user = os.getenv('SMTP_USER', '')
        self.smtp_password = os.getenv('SMTP_PASSWORD', '')
        self.smtp_from_email = os.getenv('SMTP_FROM_EMAIL', 'noreply@haida.com')
        self.smtp_from_name = os.getenv('SMTP_FROM_NAME', 'HAIDA QA Platform')
        self.smtp_use_tls = os.getenv('SMTP_USE_TLS', 'true').lower() == 'true'
        self.base_url = os.getenv('EMAIL_BASE_URL', 'https://haida.carlosarta.com')
        self.enabled = bool(self.smtp_host and self.smtp_user and self.smtp_password)

        if not self.enabled:
            logger.warning('SMTP not configured - email sending disabled')

    def is_configured(self) -> bool:
        """Verifica si SMTP está configurado"""
        return self.enabled

    def send_email(
        self,
        to_email: str,
        subject: str,
        body_html: str,
        body_text: Optional[str] = None,
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None
    ) -> bool:
        """
        Envía un email

        Args:
            to_email: Email destinatario
            subject: Asunto del email
            body_html: Cuerpo del email en HTML
            body_text: Cuerpo del email en texto plano (opcional)
            cc: Lista de emails en copia
            bcc: Lista de emails en copia oculta

        Returns:
            bool: True si el email se envió exitosamente
        """
        if not self.enabled:
            logger.warning(f'SMTP not configured - skipping email to {to_email}')
            return False

        try:
            # Crear mensaje
            msg = MIMEMultipart('alternative')
            msg['From'] = f'{self.smtp_from_name} <{self.smtp_from_email}>'
            msg['To'] = to_email
            msg['Subject'] = subject
            msg['Date'] = datetime.utcnow().strftime('%a, %d %b %Y %H:%M:%S +0000')

            if cc:
                msg['Cc'] = ', '.join(cc)
            if bcc:
                msg['Bcc'] = ', '.join(bcc)

            # Agregar cuerpo texto plano
            if body_text:
                part1 = MIMEText(body_text, 'plain', 'utf-8')
                msg.attach(part1)

            # Agregar cuerpo HTML
            part2 = MIMEText(body_html, 'html', 'utf-8')
            msg.attach(part2)

            # Enviar email
            with smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=10) as server:
                if self.smtp_use_tls:
                    server.starttls()

                server.login(self.smtp_user, self.smtp_password)

                recipients = [to_email]
                if cc:
                    recipients.extend(cc)
                if bcc:
                    recipients.extend(bcc)

                server.sendmail(
                    self.smtp_from_email,
                    recipients,
                    msg.as_string()
                )

            logger.info(f'Email sent successfully to {to_email}')
            return True

        except Exception as e:
            logger.error(f'Failed to send email to {to_email}: {str(e)}')
            return False

    def send_password_reset(
        self,
        to_email: str,
        reset_token: str,
        user_name: Optional[str] = None
    ) -> bool:
        """
        Envía email de reset de contraseña

        Args:
            to_email: Email del usuario
            reset_token: Token de reset
            user_name: Nombre del usuario (opcional)

        Returns:
            bool: True si el email se envió exitosamente
        """
        reset_url = f'{self.base_url}/reset-password?token={reset_token}'

        name_display = user_name or to_email.split('@')[0]

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }}
                .button {{ display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; font-size: 12px; color: #666; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Reset Your Password</h1>
                </div>
                <div class="content">
                    <p>Hi {name_display},</p>
                    <p>You requested to reset your password for your HAIDA account.</p>
                    <p>Click the button below to reset your password:</p>
                    <p style="text-align: center;">
                        <a href="{reset_url}" class="button">Reset Password</a>
                    </p>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="background: #fff; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px;">
                        {reset_url}
                    </p>
                    <p><strong>This link will expire in 1 hour.</strong></p>
                    <p>If you didn't request this password reset, you can safely ignore this email.</p>
                </div>
                <div class="footer">
                    <p>HAIDA - Hiberus AI-Driven Automation<br>
                    <a href="{self.base_url}">{self.base_url}</a></p>
                </div>
            </div>
        </body>
        </html>
        """

        text_body = f"""
        Hi {name_display},

        You requested to reset your password for your HAIDA account.

        Click this link to reset your password:
        {reset_url}

        This link will expire in 1 hour.

        If you didn't request this password reset, you can safely ignore this email.

        ---
        HAIDA - Hiberus AI-Driven Automation
        {self.base_url}
        """

        return self.send_email(
            to_email=to_email,
            subject='Reset Your HAIDA Password',
            body_html=html_body,
            body_text=text_body
        )

    def send_test_completed_notification(
        self,
        to_email: str,
        project_name: str,
        suite_name: str,
        total_tests: int,
        passed: int,
        failed: int,
        duration_seconds: int,
        report_url: Optional[str] = None
    ) -> bool:
        """
        Envía notificación de tests completados

        Args:
            to_email: Email del usuario
            project_name: Nombre del proyecto
            suite_name: Nombre de la suite
            total_tests: Total de tests ejecutados
            passed: Tests pasados
            failed: Tests fallidos
            duration_seconds: Duración en segundos
            report_url: URL del reporte (opcional)

        Returns:
            bool: True si el email se envió exitosamente
        """
        status_icon = '✅' if failed == 0 else '⚠️'
        status_text = 'All tests passed!' if failed == 0 else f'{failed} test(s) failed'
        status_color = '#10b981' if failed == 0 else '#ef4444'

        report_section = ''
        if report_url:
            report_section = f'''
            <p style="text-align: center;">
                <a href="{report_url}" class="button">View Full Report</a>
            </p>
            '''

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: {status_color}; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }}
                .stats {{ background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }}
                .stat-row {{ display: flex; justify-content: space-between; margin: 10px 0; padding: 10px; border-bottom: 1px solid #e5e7eb; }}
                .stat-label {{ font-weight: bold; }}
                .button {{ display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; }}
                .footer {{ text-align: center; margin-top: 30px; font-size: 12px; color: #666; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>{status_icon} Test Execution Completed</h1>
                    <p>{status_text}</p>
                </div>
                <div class="content">
                    <h2>Project: {project_name}</h2>
                    <h3>Suite: {suite_name}</h3>

                    <div class="stats">
                        <div class="stat-row">
                            <span class="stat-label">Total Tests:</span>
                            <span>{total_tests}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">✅ Passed:</span>
                            <span style="color: #10b981;">{passed}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">❌ Failed:</span>
                            <span style="color: #ef4444;">{failed}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">⏱️ Duration:</span>
                            <span>{duration_seconds}s</span>
                        </div>
                    </div>

                    {report_section}
                </div>
                <div class="footer">
                    <p>HAIDA - Hiberus AI-Driven Automation<br>
                    <a href="{self.base_url}">{self.base_url}</a></p>
                </div>
            </div>
        </body>
        </html>
        """

        return self.send_email(
            to_email=to_email,
            subject=f'[HAIDA] {status_icon} Tests Completed - {project_name}',
            body_html=html_body
        )

    def send_welcome_email(
        self,
        to_email: str,
        user_name: str,
        temporary_password: Optional[str] = None
    ) -> bool:
        """
        Envía email de bienvenida a nuevo usuario

        Args:
            to_email: Email del usuario
            user_name: Nombre del usuario
            temporary_password: Contraseña temporal (opcional)

        Returns:
            bool: True si el email se envió exitosamente
        """
        password_section = ''
        if temporary_password:
            password_section = f'''
            <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p><strong>⚠️ Your temporary password:</strong></p>
                <p style="font-family: monospace; font-size: 16px; background: white; padding: 10px; border-radius: 4px;">
                    {temporary_password}
                </p>
                <p><em>Please change this password after your first login.</em></p>
            </div>
            '''

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }}
                .button {{ display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; font-size: 12px; color: #666; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>👋 Welcome to HAIDA!</h1>
                </div>
                <div class="content">
                    <p>Hi {user_name},</p>
                    <p>Welcome to HAIDA - Hiberus AI-Driven Automation platform!</p>
                    <p>Your account has been created and you're ready to start automating your QA testing process.</p>

                    {password_section}

                    <p style="text-align: center;">
                        <a href="{self.base_url}/login" class="button">Go to HAIDA</a>
                    </p>

                    <h3>Getting Started:</h3>
                    <ul>
                        <li>Create your first project</li>
                        <li>Design test cases with AI assistance</li>
                        <li>Execute automated tests</li>
                        <li>View comprehensive reports</li>
                    </ul>

                    <p>If you have any questions, feel free to reach out to our support team.</p>
                </div>
                <div class="footer">
                    <p>HAIDA - Hiberus AI-Driven Automation<br>
                    <a href="{self.base_url}">{self.base_url}</a></p>
                </div>
            </div>
        </body>
        </html>
        """

        return self.send_email(
            to_email=to_email,
            subject='Welcome to HAIDA - Your QA Automation Platform',
            body_html=html_body
        )


# Singleton instance
email_service = EmailService()
