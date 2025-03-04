import logging 
import csv

from tablib import Dataset


logger = logging.getLogger('airporttransfer')

def transform_choices_to_key_value_pairs(payment_types_list):
    return [{'value': key, 'label': value} for key, value in payment_types_list]


def clean_csv_file(file):
    dataset = Dataset()

    try:
        # Open the uploaded CSV file
        csv_file = csv.reader(file.read().decode("utf-8").splitlines())
        
        # Get the header row
        headers = next(csv_file)
        dataset.headers = [header.strip() for header in headers]

        # Process rows
        for row in csv_file:
            cleaned_row = [field.strip() for field in row]  # Strip whitespace
            dataset.append(cleaned_row)

        # Log total rows processed
        logger.debug(f"Total rows processed: {len(dataset)}")

    except Exception as e:
        logger.error(f"Error processing CSV file: {e}")
        raise ValueError("Failed to parse CSV file. Ensure the format is correct.")

    return dataset
