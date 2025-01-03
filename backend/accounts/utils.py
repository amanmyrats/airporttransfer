import logging

from django.core.mail import send_mail


logger = logging.getLogger('airporttransfer')

def sendpassword_task(recipient=None, password=None):
    logger.debug('inside sendpassword_task')
    if not recipient or not password:
        return False
    subject = "AirportTransfer'e hoşgeldiniz"
    message = f"""AirportTransfer'e kaydolduğunuz için teşekkür ederiz.

AirportTransfer'i kullanmaya başlamak için lütfen aşağıdaki linke tıklayın:
https://724supertransfers.com/

İlk girişinizde şifrenizi değiştirebilirsiniz.

Kullanıcı adınız: {recipient}
Şifreniz: {password}

İyi günler dileriz.
"""
    from_email = 'info@transfertakip.com'
    recipient_list = [recipient]  # Ensure this is verified in SES

    try:
        response = send_mail(subject, message, from_email, recipient_list)
        logger.debug('Email sent:', response)
        return True
    except Exception as e:
        logger.debug('Email not sent:', e)
        return False

def check_initial_roles():
    """
    company_admin
    company_yonetici
    company_muhasebeci
    company_employee
    company_rezervasyoncu
    company_operasyoncu
    company_driver
    """
    from accounts.models import Role
    roles = [
        'company_admin',
        'company_yonetici',
        'company_muhasebeci',
        'company_employee',
        'company_rezervasyoncu',
        'company_operasyoncu',
        'company_driver',
    ]
    for role in roles:
        role_exists = Role.objects.filter(role_name=role).exists()
        if not role_exists:
            Role.objects.create(role_name=role)