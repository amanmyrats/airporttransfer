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

def make_random_password(length=10, allowed_chars='abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'):
        "Generates a random password with the given length and given allowed_chars"
        # Note that default value of allowed_chars does not have "I" or letters
        # that look like it -- just to avoid confusion.
        from random import choice
        return ''.join([choice(allowed_chars) for i in range(length)])