import logging 


logger = logging.getLogger('airporttransfer')

def transform_choices_to_key_value_pairs(payment_types_list):
    return [{'key': key, 'value': value} for key, value in payment_types_list]

