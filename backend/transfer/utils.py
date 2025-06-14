import logging
import random

from django.utils import timezone


logger = logging.getLogger('airporttransfer')

def get_local_date():
    return timezone.localtime(timezone.now()).date()

def get_local_time():
    return timezone.localtime(timezone.now()).time()

def is_unique_reservation_number(reservation_number=None):
    from transfer.models import Reservation
    return not Reservation.objects.filter(number=reservation_number).exists()

def get_autogenerated_reservation_number(company_code='ATH'):
    logger.debug(f"inside generate_reservation_number, company_code: {company_code}")
    reservation_number = None
    # Remove the first 2 digit from the timestamp to make it short
    unix_timestamp = str(int(timezone.localtime(timezone.now()).timestamp()))[2:]
    random_number = '00'
    # logger.debug(f"random_number: {random_number}")
    # logger.debug(f"unix_timestamp: {unix_timestamp}")
    while True:
        # Remove the first 2 digit from the timestamp to make it short
        unix_timestamp = str(int(timezone.localtime(timezone.now()).timestamp()))[2:]
        
        # Create the reservation number
        reservation_number = f"{company_code.upper()}{random_number}-{unix_timestamp}"
        # logger.debug(f"reservation_number: {reservation_number}")
        # Check if the reservation number is unique
        if is_unique_reservation_number(reservation_number):
            break

        # Remove the first 2 digit from the timestamp to make it short
        unix_timestamp = str(int(timezone.localtime(timezone.now()).timestamp()))[2:]
        # Generate a random 2-digit number between 10 and 99
        random_number = random.randint(10, 99)
    # logger.debug(f"return reservation_number: {reservation_number}")
    return reservation_number