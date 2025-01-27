import logging 


logger = logging.getLogger('airporttransfer')

def transform_choices_to_key_value_pairs(payment_types_list):
    return [{'value': key, 'label': value} for key, value in payment_types_list]

